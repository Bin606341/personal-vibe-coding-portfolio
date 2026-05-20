export type Vector3Like = {
  x: number;
  y: number;
  z: number;
};

export type DunkDirectionKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export type DunkKeyCode =
  | DunkDirectionKey
  | 'ShiftLeft'
  | 'ShiftRight'
  | 'Shift'
  | 'KeyD';

export type DunkKeyboardEventLike = {
  code?: string;
  key?: string;
  repeat?: boolean;
};

/**
 * 离散键盘输入映射出的扣篮动作类型。
 * 枚举值使用稳定字符串，方便调试面板、埋点和动画资源表共用。
 */
export enum DunkActionType {
  SafeTwoHand = 'SafeTwoHandDunk',
  RightHandPower = 'RightHandPowerDunk',
  LeftHandPower = 'LeftHandPowerDunk',
  ReverseFlashy = 'ReverseFlashyDunk',
}

export enum DunkState {
  Locomotion = 'Locomotion',
  Gather = 'Gather',
  Airborne = 'Airborne',
  Impact = 'Impact',
  Recovery = 'Recovery',
}

export enum DunkResult {
  Success = 'Success',
  Blocked = 'Blocked',
}

export type DunkRejectReason =
  | 'outside-zone'
  | 'outside-angle'
  | 'insufficient-speed';

export interface DunkIntent<TAction extends DunkActionType = DunkActionType> {
  type: TAction;
  directionKey: DunkDirectionKey;
  requestedAtMs: number;
}

export interface DunkInputSnapshot {
  sprintHeld: boolean;
  actionHeld: boolean;
  heldDirections: DunkDirectionKey[];
}

export interface DunkTriggerZone {
  /** 角色 Root 到篮筐的最大水平距离。 */
  radius: number;
  /** 角色前向与篮筐方向允许的半角，构成扇区。 */
  halfAngleRadians: number;
  /** 角色沿自身前向的最低速度，避免原地弹射扣篮。 */
  minForwardSpeed: number;
  /** 三秒区矩形；进入后可从任意方向扣篮。 */
  paint?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export interface DunkSpatialConfig {
  rimPosition: Vector3Like;
  takeoffPoint: Vector3Like;
  zone: DunkTriggerZone;
}

export interface DunkSpatialSample {
  rootPosition: Vector3Like;
  forward: Vector3Like;
  velocity: Vector3Like;
}

export interface DunkSpatialDecision {
  allowed: boolean;
  reason?: DunkRejectReason;
  distanceToRim: number;
  forwardSpeed: number;
  angleToRimRadians: number;
  takeoffPoint: Vector3Like;
  rimPosition: Vector3Like;
  insidePaint: boolean;
}

export interface MotionWarpPhase {
  id: string;
  fromTimeMs: number;
  toTimeMs: number;
  from: Vector3Like;
  to: Vector3Like;
}

export interface MotionWarpSample {
  phaseId: string;
  localT: number;
  easedT: number;
  position: Vector3Like;
}

export interface DunkActionConfig {
  type: DunkActionType;
  label: string;
  startupFrames: number;
  interruptionWeight: number;
  gatherMs: number;
  airborneMs: number;
  impactMs: number;
  recoveryMs: number;
  preferredHand: 'both' | 'left' | 'right';
  animationGroupName: string;
}

export interface DunkCombatInput {
  defenderIntersects: boolean;
  defenderBlockPower: number;
  action: DunkActionConfig;
}

export const directionToDunkAction = {
  ArrowUp: DunkActionType.SafeTwoHand,
  ArrowRight: DunkActionType.RightHandPower,
  ArrowLeft: DunkActionType.LeftHandPower,
  ArrowDown: DunkActionType.ReverseFlashy,
} satisfies Record<DunkDirectionKey, DunkActionType>;

export const defaultDunkActionConfigs = {
  [DunkActionType.SafeTwoHand]: {
    type: DunkActionType.SafeTwoHand,
    label: '双手安全扣篮',
    startupFrames: 6,
    interruptionWeight: 0.86,
    gatherMs: 180,
    airborneMs: 420,
    impactMs: 120,
    recoveryMs: 220,
    preferredHand: 'both',
    animationGroupName: 'dunk_safe_two_hand',
  },
  [DunkActionType.RightHandPower]: {
    type: DunkActionType.RightHandPower,
    label: '右手强力扣篮',
    startupFrames: 10,
    interruptionWeight: 0.72,
    gatherMs: 220,
    airborneMs: 440,
    impactMs: 125,
    recoveryMs: 240,
    preferredHand: 'right',
    animationGroupName: 'dunk_right_power',
  },
  [DunkActionType.LeftHandPower]: {
    type: DunkActionType.LeftHandPower,
    label: '左手强力扣篮',
    startupFrames: 10,
    interruptionWeight: 0.7,
    gatherMs: 220,
    airborneMs: 440,
    impactMs: 125,
    recoveryMs: 240,
    preferredHand: 'left',
    animationGroupName: 'dunk_left_power',
  },
  [DunkActionType.ReverseFlashy]: {
    type: DunkActionType.ReverseFlashy,
    label: '反手花式扣篮',
    startupFrames: 18,
    interruptionWeight: 0.42,
    gatherMs: 300,
    airborneMs: 500,
    impactMs: 135,
    recoveryMs: 300,
    preferredHand: 'right',
    animationGroupName: 'dunk_reverse_flashy',
  },
} satisfies Record<DunkActionType, DunkActionConfig>;

const nowMs = () => {
  if (typeof performance !== 'undefined') {
    return performance.now();
  }

  return Date.now();
};

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

const lengthXZ = (value: Vector3Like) => Math.hypot(value.x, value.z);

const normalizeXZ = (value: Vector3Like): Vector3Like => {
  const length = lengthXZ(value);

  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: value.x / length,
    y: 0,
    z: value.z / length,
  };
};

const dotXZ = (a: Vector3Like, b: Vector3Like) => a.x * b.x + a.z * b.z;

const distanceXZ = (a: Vector3Like, b: Vector3Like) => Math.hypot(a.x - b.x, a.z - b.z);

const angleXZ = (a: Vector3Like, b: Vector3Like) => {
  const left = normalizeXZ(a);
  const right = normalizeXZ(b);
  const dot = Math.min(1, Math.max(-1, dotXZ(left, right)));

  return Math.acos(dot);
};

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const lerpVector = (from: Vector3Like, to: Vector3Like, t: number): Vector3Like => ({
  x: lerp(from.x, to.x, t),
  y: lerp(from.y, to.y, t),
  z: lerp(from.z, to.z, t),
});

export const easeInOutSine = (value: number) => -(Math.cos(Math.PI * clampUnit(value)) - 1) / 2;

const normalizeKeyCode = (event: DunkKeyboardEventLike): DunkKeyCode | null => {
  const code = event.code ?? event.key;

  if (
    code === 'ArrowUp' ||
    code === 'ArrowDown' ||
    code === 'ArrowLeft' ||
    code === 'ArrowRight' ||
    code === 'ShiftLeft' ||
    code === 'ShiftRight' ||
    code === 'Shift' ||
    code === 'KeyD' ||
    code === 'd' ||
    code === 'D'
  ) {
    return code === 'd' || code === 'D' ? 'KeyD' : code;
  }

  return null;
};

const isSprintCode = (code: DunkKeyCode) => code === 'Shift' || code === 'ShiftLeft' || code === 'ShiftRight';

const isDirectionCode = (code: DunkKeyCode): code is DunkDirectionKey =>
  code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight';

/**
 * 将 HTML5 键盘事件解析成一次性扣篮意图。
 * D 键只在 keydown 且非 repeat 时消费，避免长按重复触发。
 */
export class DunkInputMapper<TAction extends DunkActionType = DunkActionType> {
  private readonly pressedCodes = new Set<DunkKeyCode>();
  private readonly directionStack: DunkDirectionKey[] = [];

  constructor(private readonly mapping: Record<DunkDirectionKey, TAction> = directionToDunkAction as Record<DunkDirectionKey, TAction>) {}

  handleKeyDown(event: DunkKeyboardEventLike, requestedAtMs = nowMs()): DunkIntent<TAction> | null {
    const code = normalizeKeyCode(event);

    if (!code) {
      return null;
    }

    if (isSprintCode(code) || isDirectionCode(code)) {
      this.pressedCodes.add(code);
    }

    if (isDirectionCode(code)) {
      this.rememberLatestDirection(code);
    }

    if (code !== 'KeyD') {
      return null;
    }

    if (event.repeat) {
      return null;
    }

    this.pressedCodes.add(code);

    if (!this.snapshot().sprintHeld) {
      return null;
    }

    const directionKey = this.getLatestHeldDirection() ?? 'ArrowUp';

    return {
      type: this.mapping[directionKey],
      directionKey,
      requestedAtMs,
    };
  }

  handleKeyUp(event: DunkKeyboardEventLike) {
    const code = normalizeKeyCode(event);

    if (!code) {
      return;
    }

    this.pressedCodes.delete(code);

    if (isDirectionCode(code)) {
      const index = this.directionStack.indexOf(code);
      if (index >= 0) {
        this.directionStack.splice(index, 1);
      }
    }
  }

  snapshot(): DunkInputSnapshot {
    return {
      sprintHeld:
        this.pressedCodes.has('Shift') ||
        this.pressedCodes.has('ShiftLeft') ||
        this.pressedCodes.has('ShiftRight'),
      actionHeld: this.pressedCodes.has('KeyD'),
      heldDirections: this.directionStack.filter((direction) => this.pressedCodes.has(direction)),
    };
  }

  private rememberLatestDirection(direction: DunkDirectionKey) {
    const index = this.directionStack.indexOf(direction);
    if (index >= 0) {
      this.directionStack.splice(index, 1);
    }

    this.directionStack.push(direction);
  }

  private getLatestHeldDirection() {
    for (let index = this.directionStack.length - 1; index >= 0; index -= 1) {
      const direction = this.directionStack[index];
      if (this.pressedCodes.has(direction)) {
        return direction;
      }
    }

    return null;
  }
}

/**
 * 扣篮触发区：用距离、扇区角和前向速度三道门槛拦截非法输入。
 */
export class DunkSpatialContext {
  constructor(private readonly config: DunkSpatialConfig) {}

  evaluate(sample: DunkSpatialSample): DunkSpatialDecision {
    const { rimPosition, takeoffPoint, zone } = this.config;
    const rootToRim = {
      x: rimPosition.x - sample.rootPosition.x,
      y: 0,
      z: rimPosition.z - sample.rootPosition.z,
    };
    const distanceToRim = distanceXZ(sample.rootPosition, rimPosition);
    const forwardSpeed = dotXZ(sample.velocity, normalizeXZ(sample.forward));
    const angleToRimRadians = angleXZ(sample.forward, rootToRim);
    const insidePaint = zone.paint
      ? sample.rootPosition.x >= zone.paint.minX &&
        sample.rootPosition.x <= zone.paint.maxX &&
        sample.rootPosition.z >= zone.paint.minZ &&
        sample.rootPosition.z <= zone.paint.maxZ
      : false;
    const baseDecision = {
      distanceToRim,
      forwardSpeed,
      angleToRimRadians,
      takeoffPoint,
      rimPosition,
      insidePaint,
    };

    if (insidePaint) {
      return { allowed: true, ...baseDecision };
    }

    if (distanceToRim > zone.radius) {
      return { allowed: false, reason: 'outside-zone', ...baseDecision };
    }

    if (angleToRimRadians > zone.halfAngleRadians) {
      return { allowed: false, reason: 'outside-angle', ...baseDecision };
    }

    if (forwardSpeed < zone.minForwardSpeed) {
      return { allowed: false, reason: 'insufficient-speed', ...baseDecision };
    }

    return { allowed: true, ...baseDecision };
  }
}

/**
 * 自定义目标匹配：根据动画时间采样 Root Mesh 应该被吸附到的位置。
 * Babylon 运行层会把这里的 sample 结果写回 root.position。
 */
export class CustomTargetMatcher {
  private readonly phases: MotionWarpPhase[];

  constructor(phases: MotionWarpPhase[], private readonly easing: (value: number) => number = easeInOutSine) {
    this.phases = [...phases].sort((a, b) => a.fromTimeMs - b.fromTimeMs);
  }

  sample(elapsedMs: number): MotionWarpSample {
    if (this.phases.length === 0) {
      return {
        phaseId: 'idle',
        localT: 1,
        easedT: 1,
        position: { x: 0, y: 0, z: 0 },
      };
    }

    const first = this.phases[0];
    if (elapsedMs <= first.fromTimeMs) {
      return {
        phaseId: first.id,
        localT: 0,
        easedT: 0,
        position: { ...first.from },
      };
    }

    for (let index = 0; index < this.phases.length; index += 1) {
      const phase = this.phases[index];

      if (elapsedMs <= phase.toTimeMs) {
        const duration = Math.max(1, phase.toTimeMs - phase.fromTimeMs);
        const localT = clampUnit((elapsedMs - phase.fromTimeMs) / duration);
        const easedT = this.easing(localT);

        return {
          phaseId: phase.id,
          localT,
          easedT,
          position: lerpVector(phase.from, phase.to, easedT),
        };
      }

      const nextPhase = this.phases[index + 1];
      if (nextPhase && elapsedMs < nextPhase.fromTimeMs) {
        return {
          phaseId: phase.id,
          localT: 1,
          easedT: 1,
          position: { ...phase.to },
        };
      }
    }

    const last = this.phases[this.phases.length - 1];
    return {
      phaseId: last.id,
      localT: 1,
      easedT: 1,
      position: { ...last.to },
    };
  }
}

export interface DunkStateSnapshot {
  state: DunkState;
  elapsedInActionMs: number;
  inputLocked: boolean;
  intent: DunkIntent | null;
  actionConfig: DunkActionConfig | null;
}

export class DunkStateMachine {
  private state = DunkState.Locomotion;
  private elapsedInActionMs = 0;
  private intent: DunkIntent | null = null;
  private actionConfig: DunkActionConfig | null = null;

  constructor(private readonly configs: Record<DunkActionType, DunkActionConfig> = defaultDunkActionConfigs) {}

  request(intent: DunkIntent): boolean {
    if (this.state !== DunkState.Locomotion) {
      return false;
    }

    this.intent = intent;
    this.actionConfig = this.configs[intent.type];
    this.elapsedInActionMs = 0;
    this.state = DunkState.Gather;

    return true;
  }

  update(deltaMs: number) {
    if (this.state === DunkState.Locomotion || !this.actionConfig) {
      return;
    }

    this.elapsedInActionMs += Math.max(0, deltaMs);

    const gatherEnd = this.actionConfig.gatherMs;
    const airborneEnd = gatherEnd + this.actionConfig.airborneMs;
    const impactEnd = airborneEnd + this.actionConfig.impactMs;
    const recoveryEnd = impactEnd + this.actionConfig.recoveryMs;

    if (this.elapsedInActionMs < gatherEnd) {
      this.state = DunkState.Gather;
      return;
    }

    if (this.elapsedInActionMs < airborneEnd) {
      this.state = DunkState.Airborne;
      return;
    }

    if (this.elapsedInActionMs < impactEnd) {
      this.state = DunkState.Impact;
      return;
    }

    if (this.elapsedInActionMs < recoveryEnd) {
      this.state = DunkState.Recovery;
      return;
    }

    this.reset();
  }

  snapshot(): DunkStateSnapshot {
    return {
      state: this.state,
      elapsedInActionMs: this.elapsedInActionMs,
      inputLocked: this.state !== DunkState.Locomotion,
      intent: this.intent,
      actionConfig: this.actionConfig,
    };
  }

  reset() {
    this.state = DunkState.Locomotion;
    this.elapsedInActionMs = 0;
    this.intent = null;
    this.actionConfig = null;
  }
}

export class DunkCombatResolver {
  resolve(input: DunkCombatInput): DunkResult {
    if (!input.defenderIntersects) {
      return DunkResult.Success;
    }

    return input.defenderBlockPower > input.action.interruptionWeight ? DunkResult.Blocked : DunkResult.Success;
  }
}
