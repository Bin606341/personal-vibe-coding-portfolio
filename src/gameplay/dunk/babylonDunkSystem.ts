import {
  AnimationGroup,
  Bone,
  BoneIKController,
  Mesh,
  Scalar,
  Skeleton,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import {
  CustomTargetMatcher,
  DunkActionType,
  DunkCombatResolver,
  DunkInputMapper,
  DunkResult,
  DunkSpatialContext,
  DunkState,
  DunkStateMachine,
  defaultDunkActionConfigs,
  type DunkActionConfig,
  type DunkIntent,
  type DunkSpatialConfig,
  type MotionWarpPhase,
  type Vector3Like,
} from './dunkLogic';

export interface BabylonDunkRig {
  root: TransformNode;
  characterMesh: TransformNode;
  skeleton: Skeleton;
  ballMesh: Mesh;
  rimTarget: TransformNode;
  animationGroups: Partial<Record<DunkActionType | DunkState.Locomotion, AnimationGroup>>;
  rightHandBoneName: string;
  leftHandBoneName: string;
  rightForearmBoneName?: string;
  leftForearmBoneName?: string;
}

export interface BabylonDunkSystemConfig {
  spatial: DunkSpatialConfig;
  actions?: Record<DunkActionType, DunkActionConfig>;
  gatherTargetOffset?: Vector3Like;
  rimHangOffset?: Vector3Like;
  blendSpeed?: number;
}

export interface BabylonDunkFrameInput {
  deltaMs: number;
  velocity: Vector3;
  forward: Vector3;
  defenderMeshes?: Mesh[];
  defenderBlockPower?: number;
}

export interface BabylonDunkFrameResult {
  state: DunkState;
  inputLocked: boolean;
  result?: DunkResult;
}

/**
 * Babylon.js 运行层：把输入意图、空间判定、动画权重、Root 吸附、球附着和 IK 串在一起。
 * 当前项目首页仍是 Three.js，这个类是可迁移到 Babylon 场景的完整 Gameplay 架构实现。
 */
export class BabylonDunkSystem {
  readonly inputMapper = new DunkInputMapper();

  private readonly actions: Record<DunkActionType, DunkActionConfig>;
  private readonly stateMachine: DunkStateMachine;
  private readonly spatialContext: DunkSpatialContext;
  private readonly combatResolver = new DunkCombatResolver();
  private readonly blendSpeed: number;
  private readonly gatherTargetOffset: Vector3Like;
  private readonly rimHangOffset: Vector3Like;
  private matcher: CustomTargetMatcher | null = null;
  private activeResult: DunkResult | undefined;
  private ballAttached = false;
  private handIk: BoneIKController | null = null;
  private latestVelocity = Vector3.Zero();
  private latestForward = Vector3.Forward();

  constructor(
    private readonly rig: BabylonDunkRig,
    config: BabylonDunkSystemConfig,
  ) {
    this.actions = config.actions ?? defaultDunkActionConfigs;
    this.stateMachine = new DunkStateMachine(this.actions);
    this.spatialContext = new DunkSpatialContext(config.spatial);
    this.blendSpeed = config.blendSpeed ?? 0.14;
    this.gatherTargetOffset = config.gatherTargetOffset ?? { x: 0, y: 0, z: 0 };
    this.rimHangOffset = config.rimHangOffset ?? { x: 0, y: -0.68, z: 0.1 };
  }

  /**
   * HTML5 keydown 入口；也可以从 Babylon DeviceSourceManager 的按键状态组装同等事件后调用。
   */
  handleKeyDown(event: Pick<KeyboardEvent, 'code' | 'key' | 'repeat'>, nowMs = performance.now()) {
    const intent = this.inputMapper.handleKeyDown(event, nowMs);
    if (intent) {
      this.tryStartDunk(intent);
    }
  }

  handleKeyUp(event: Pick<KeyboardEvent, 'code' | 'key'>) {
    this.inputMapper.handleKeyUp(event);
  }

  tryStartDunk(intent: DunkIntent) {
    this.latestForward.copyFrom(this.rig.root.forward);

    const spatial = this.spatialContext.evaluate({
      rootPosition: toVector3Like(this.rig.root.position),
      forward: toVector3Like(this.latestForward),
      velocity: toVector3Like(this.latestVelocity),
    });

    if (!spatial.allowed) {
      return false;
    }

    const started = this.stateMachine.request(intent);

    if (!started) {
      return false;
    }

    const action = this.actions[intent.type];
    const rootPosition = toVector3Like(this.rig.root.position);
    const gatherTarget = addVector(spatial.takeoffPoint, this.gatherTargetOffset);
    const rimHangTarget = addVector(spatial.rimPosition, this.rimHangOffset);
    const phases: MotionWarpPhase[] = [
      {
        id: 'GatherToTakeoff',
        fromTimeMs: 0,
        toTimeMs: action.gatherMs,
        from: rootPosition,
        to: gatherTarget,
      },
      {
        id: 'AirborneToRim',
        fromTimeMs: action.gatherMs,
        toTimeMs: action.gatherMs + action.airborneMs,
        from: gatherTarget,
        to: rimHangTarget,
      },
    ];

    this.matcher = new CustomTargetMatcher(phases);
    this.activeResult = undefined;
    this.ballAttached = false;
    this.playActionAnimation(action);

    return true;
  }

  /**
   * 每帧调用。Gather/Airborne 期间会锁住玩家键盘位移，并由 matcher 驱动 Root 精准贴到目标点。
   */
  update(frame: BabylonDunkFrameInput): BabylonDunkFrameResult {
    this.latestVelocity.copyFrom(frame.velocity);
    this.latestForward.copyFrom(frame.forward);

    const before = this.stateMachine.snapshot();
    this.stateMachine.update(frame.deltaMs);
    const snapshot = this.stateMachine.snapshot();

    this.blendAnimationWeights(snapshot.state, snapshot.actionConfig);

    if (snapshot.inputLocked && this.matcher) {
      const warp = this.matcher.sample(snapshot.elapsedInActionMs);
      const target = new Vector3(warp.position.x, warp.position.y, warp.position.z);

      this.rig.root.position.x = Scalar.Lerp(this.rig.root.position.x, target.x, warp.easedT);
      this.rig.root.position.y = Scalar.Lerp(this.rig.root.position.y, target.y, warp.easedT);
      this.rig.root.position.z = Scalar.Lerp(this.rig.root.position.z, target.z, warp.easedT);
    }

    if (!this.ballAttached && snapshot.state === DunkState.Airborne && snapshot.actionConfig) {
      this.attachBallToPreferredHand(snapshot.actionConfig);
      this.ballAttached = true;
    }

    if (snapshot.state === DunkState.Impact) {
      this.updateHandIk(snapshot.actionConfig);
      this.activeResult ??= this.resolveCombat(frame, snapshot.actionConfig);
    }

    if (before.inputLocked && !snapshot.inputLocked) {
      this.cleanupCommittedAction();
    }

    return {
      state: snapshot.state,
      inputLocked: snapshot.inputLocked,
      result: this.activeResult,
    };
  }

  private playActionAnimation(action: DunkActionConfig) {
    Object.values(this.rig.animationGroups).forEach((group) => {
      group?.setWeightForAllAnimatables(0);
    });

    const group = this.rig.animationGroups[action.type];
    group?.start(false);
    group?.setWeightForAllAnimatables(1);
  }

  private blendAnimationWeights(state: DunkState, action: DunkActionConfig | null) {
    const locomotion = this.rig.animationGroups[DunkState.Locomotion];
    const actionGroup = action ? this.rig.animationGroups[action.type] : null;
    const actionWeight = state === DunkState.Locomotion ? 0 : 1;

    locomotion?.setWeightForAllAnimatables(Scalar.Lerp(locomotion.weight, 1 - actionWeight, this.blendSpeed));
    actionGroup?.setWeightForAllAnimatables(Scalar.Lerp(actionGroup.weight, actionWeight, this.blendSpeed));
  }

  private attachBallToPreferredHand(action: DunkActionConfig) {
    const boneName = action.preferredHand === 'left' ? this.rig.leftHandBoneName : this.rig.rightHandBoneName;
    const bone = findBone(this.rig.skeleton, boneName);

    if (bone) {
      this.rig.ballMesh.attachToBone(bone, this.rig.characterMesh);
      this.rig.ballMesh.position.set(0.02, -0.02, 0.03);
    }
  }

  private updateHandIk(action: DunkActionConfig | null) {
    if (!action) {
      return;
    }

    const boneName = action.preferredHand === 'left' ? this.rig.leftForearmBoneName : this.rig.rightForearmBoneName;
    const bone = boneName ? findBone(this.rig.skeleton, boneName) : null;

    if (!bone) {
      return;
    }

    this.handIk ??= new BoneIKController(this.rig.characterMesh, bone, {
      targetMesh: this.rig.rimTarget,
      slerpAmount: 0.55,
      maxAngle: Math.PI * 0.92,
    });

    this.handIk.targetMesh = this.rig.rimTarget;
    this.handIk.update();
  }

  private resolveCombat(frame: BabylonDunkFrameInput, action: DunkActionConfig | null) {
    if (!action) {
      return undefined;
    }

    const defenderIntersects =
      frame.defenderMeshes?.some((mesh) => mesh.intersectsMesh(this.rig.characterMesh as Mesh, false)) ?? false;

    return this.combatResolver.resolve({
      defenderIntersects,
      defenderBlockPower: frame.defenderBlockPower ?? 0.5,
      action,
    });
  }

  private cleanupCommittedAction() {
    this.matcher = null;
    this.handIk = null;
    this.ballAttached = false;
    this.rig.ballMesh.detachFromBone();
    Object.values(this.rig.animationGroups).forEach((group) => {
      if (group?.isPlaying) {
        group.stop();
      }
    });
    this.rig.animationGroups[DunkState.Locomotion]?.play(true);
  }
}

const findBone = (skeleton: Skeleton, name: string): Bone | null =>
  skeleton.bones.find((bone) => bone.name === name) ?? null;

const toVector3Like = (value: Vector3): Vector3Like => ({
  x: value.x,
  y: value.y,
  z: value.z,
});

const addVector = (a: Vector3Like, b: Vector3Like): Vector3Like => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});
