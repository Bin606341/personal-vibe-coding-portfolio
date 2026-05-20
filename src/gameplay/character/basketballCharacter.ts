import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DunkState, type DunkActionConfig } from '../dunk/dunkLogic';

export enum BasketballActionState {
  Idle = 'Idle',
  JogDribble = 'JogDribble',
  SprintDribble = 'SprintDribble',
  Gather = 'Gather',
  JumpShot = 'JumpShot',
  DunkGather = 'DunkGather',
  DunkAirborne = 'DunkAirborne',
  DunkImpact = 'DunkImpact',
  Recovery = 'Recovery',
}

export interface BasketballMotionInput {
  isMoving: boolean;
  isSprinting: boolean;
  isChargingShot: boolean;
  isShooting: boolean;
  dunkState: DunkState;
  dunkAction: DunkActionConfig | null;
  elapsed: number;
}

export interface BasketballCharacterControllerOptions {
  assetUrl?: string | null;
  scale?: number;
}

type ProceduralRig = {
  hips: THREE.Object3D;
  chest: THREE.Object3D;
  head: THREE.Object3D;
  leftUpperArm: THREE.Object3D;
  leftForearm: THREE.Object3D;
  rightUpperArm: THREE.Object3D;
  rightForearm: THREE.Object3D;
  leftThigh: THREE.Object3D;
  leftShin: THREE.Object3D;
  rightThigh: THREE.Object3D;
  rightShin: THREE.Object3D;
  leftHand: THREE.Object3D;
  rightHand: THREE.Object3D;
};

type HumanoidPoseRig = {
  hips: THREE.Object3D | null;
  chest: THREE.Object3D | null;
  head: THREE.Object3D | null;
  leftUpperArm: THREE.Object3D | null;
  leftForearm: THREE.Object3D | null;
  rightUpperArm: THREE.Object3D | null;
  rightForearm: THREE.Object3D | null;
  leftThigh: THREE.Object3D | null;
  leftShin: THREE.Object3D | null;
  rightThigh: THREE.Object3D | null;
  rightShin: THREE.Object3D | null;
};

type TransformSnapshot = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

const DEFAULT_ASSET_URL = '/models/basketball-player/player.glb';
const TARGET_PLAYER_HEIGHT = 2.02;
const MIN_VISIBLE_PLAYER_HEIGHT = 0.35;

const stateClipNames = {
  [BasketballActionState.Idle]: ['Idle', 'idle'],
  [BasketballActionState.JogDribble]: ['JogDribble', 'Dribble', 'Jog', 'Run'],
  [BasketballActionState.SprintDribble]: ['SprintDribble', 'Sprint', 'FastRun', 'Run'],
  [BasketballActionState.Gather]: ['Gather', 'ShotGather', 'JumpShot'],
  [BasketballActionState.JumpShot]: ['JumpShot', 'Shoot', 'Shooting'],
  [BasketballActionState.DunkGather]: ['DunkGather', 'Gather', 'Dunk'],
  [BasketballActionState.DunkAirborne]: ['DunkAirborne', 'Dunk', 'Jump'],
  [BasketballActionState.DunkImpact]: ['DunkImpact', 'Dunk', 'Slam'],
  [BasketballActionState.Recovery]: ['Recovery', 'Landing', 'Idle'],
} satisfies Record<BasketballActionState, string[]>;

export const resolveBasketballActionState = (input: BasketballMotionInput): BasketballActionState => {
  if (input.dunkState === DunkState.Gather && input.dunkAction) {
    return BasketballActionState.DunkGather;
  }

  if (input.dunkState === DunkState.Airborne && input.dunkAction) {
    return BasketballActionState.DunkAirborne;
  }

  if (input.dunkState === DunkState.Impact && input.dunkAction) {
    return BasketballActionState.DunkImpact;
  }

  if (input.dunkState === DunkState.Recovery && input.dunkAction) {
    return BasketballActionState.Recovery;
  }

  if (input.isShooting) {
    return BasketballActionState.JumpShot;
  }

  if (input.isChargingShot) {
    return BasketballActionState.Gather;
  }

  if (input.isMoving && input.isSprinting) {
    return BasketballActionState.SprintDribble;
  }

  if (input.isMoving) {
    return BasketballActionState.JogDribble;
  }

  return BasketballActionState.Idle;
};

export const findHumanoidBone = (root: THREE.Object3D, hand: 'left' | 'right'): THREE.Object3D | null => {
  const side = hand === 'left' ? 'left' : 'right';
  const sideSuffix = hand === 'left' ? 'l' : 'r';
  const exactNames =
    hand === 'left'
      ? ['mixamorigLeftHand', 'LeftHand', 'leftHand', 'Hand_L', 'hand.L', 'Palm.L']
      : ['mixamorigRightHand', 'RightHand', 'rightHand', 'Hand_R', 'hand.R', 'Palm.R'];
  let fallback: THREE.Object3D | null = null;

  root.traverse((object) => {
    if (fallback) return;
    const normalized = object.name.replace(/[\s_.-]/g, '').toLowerCase();
    const isSidePalm =
      normalized === `palm${sideSuffix}` || normalized === `${sideSuffix}palm` || normalized.includes(`${side}palm`);
    if (exactNames.includes(object.name) || isSidePalm || (normalized.includes(side) && normalized.includes('hand'))) {
      fallback = object;
    }
  });

  return fallback;
};

type HeightFitResult = {
  originalHeight: number;
  scale: number;
  height: number;
  visible: boolean;
};

const isFiniteVector = (vector: THREE.Vector3) =>
  Number.isFinite(vector.x) && Number.isFinite(vector.y) && Number.isFinite(vector.z);

export const computeVisibleGeometryBounds = (object: THREE.Object3D): THREE.Box3 | null => {
  object.updateWorldMatrix(true, true);

  const bounds = new THREE.Box3();
  let hasGeometry = false;

  object.traverse((child) => {
    if (!child.visible || !(child instanceof THREE.Mesh)) return;

    const geometry = child.geometry;
    if (!geometry) return;

    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }

    if (!geometry.boundingBox) return;

    const meshBounds = geometry.boundingBox.clone();
    meshBounds.applyMatrix4(child.matrixWorld);

    if (!isFiniteVector(meshBounds.min) || !isFiniteVector(meshBounds.max) || meshBounds.isEmpty()) return;

    bounds.union(meshBounds);
    hasGeometry = true;
  });

  return hasGeometry ? bounds : null;
};

export const fitObjectToHeight = (object: THREE.Object3D, targetHeight = TARGET_PLAYER_HEIGHT): HeightFitResult => {
  object.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const originalHeight = Math.max(size.y, 0.001);
  const scale = targetHeight / originalHeight;
  object.scale.multiplyScalar(scale);
  object.updateWorldMatrix(true, true);

  const normalizedBox = new THREE.Box3().setFromObject(object);
  const normalizedSize = new THREE.Vector3();
  normalizedBox.getSize(normalizedSize);
  const yOffset = normalizedBox.min.y;
  object.position.y -= yOffset;

  return {
    originalHeight,
    scale,
    height: normalizedSize.y,
    visible: normalizedSize.y >= MIN_VISIBLE_PLAYER_HEIGHT,
  };
};

export const fitObjectToVisibleHeight = (
  object: THREE.Object3D,
  targetHeight = TARGET_PLAYER_HEIGHT,
): HeightFitResult => {
  const box = computeVisibleGeometryBounds(object);
  if (!box) {
    return {
      originalHeight: 0,
      scale: 1,
      height: 0,
      visible: false,
    };
  }

  const size = new THREE.Vector3();
  box.getSize(size);
  const originalHeight = size.y;

  if (!Number.isFinite(originalHeight) || originalHeight <= 0) {
    return {
      originalHeight: 0,
      scale: 1,
      height: 0,
      visible: false,
    };
  }

  const scale = targetHeight / originalHeight;
  object.scale.multiplyScalar(scale);
  object.updateWorldMatrix(true, true);

  const normalizedBox = computeVisibleGeometryBounds(object);
  if (!normalizedBox) {
    return {
      originalHeight,
      scale,
      height: 0,
      visible: false,
    };
  }

  object.position.y -= normalizedBox.min.y;
  object.updateWorldMatrix(true, true);

  const groundedBox = computeVisibleGeometryBounds(object);
  const groundedSize = new THREE.Vector3();
  groundedBox?.getSize(groundedSize);

  return {
    originalHeight,
    scale,
    height: groundedSize.y,
    visible:
      Boolean(groundedBox) &&
      Number.isFinite(groundedSize.y) &&
      groundedSize.y >= MIN_VISIBLE_PLAYER_HEIGHT &&
      Math.abs(groundedSize.y - targetHeight) < targetHeight * 0.08,
  };
};

const hardenSingleMaterialVisibility = (material: THREE.Material) => {
  material.visible = true;
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.needsUpdate = true;
};

const hardenMaterialVisibility = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) {
    material.forEach(hardenSingleMaterialVisibility);
    return;
  }

  hardenSingleMaterialVisibility(material);
};

export class BasketballCharacterController {
  readonly root = new THREE.Group();

  private readonly assetUrl: string | null;
  private readonly scale: number;
  private scene: THREE.Scene | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions = new Map<BasketballActionState, THREE.AnimationAction>();
  private activeState: BasketballActionState | null = null;
  private model: THREE.Object3D | null = null;
  private proceduralRig: ProceduralRig | null = null;
  private loadedPoseRig: HumanoidPoseRig | null = null;
  private loadedPoseRestTransforms = new Map<THREE.Object3D, TransformSnapshot>();
  private leftHand: THREE.Object3D | null = null;
  private rightHand: THREE.Object3D | null = null;
  private fallback = false;
  private visibleBounds: THREE.Box3 | null = null;

  constructor(options: BasketballCharacterControllerOptions = {}) {
    this.assetUrl = options.assetUrl === undefined ? DEFAULT_ASSET_URL : options.assetUrl;
    this.scale = options.scale ?? 1;
    this.root.name = 'BasketballCharacterRoot';
  }

  async load(scene: THREE.Scene): Promise<void> {
    this.scene = scene;
    this.root.scale.setScalar(this.scale);

    if (this.assetUrl) {
      try {
        const gltf = await new GLTFLoader().loadAsync(this.assetUrl);
        this.useLoadedModel(gltf.scene, gltf.animations);
        scene.add(this.root);
        return;
      } catch {
        this.useProceduralFallback();
        scene.add(this.root);
        return;
      }
    }

    this.useProceduralFallback();
    scene.add(this.root);
  }

  update(delta: number, input: BasketballMotionInput): void {
    const nextState = resolveBasketballActionState(input);
    this.play(nextState);
    this.mixer?.update(delta);

    if (this.proceduralRig) {
      this.applyProceduralMotion(input, nextState);
    } else {
      this.applyLoadedPoseOverlay(input, nextState);
    }
  }

  play(state: BasketballActionState, fadeMs = 140): void {
    if (state === this.activeState) return;

    const nextAction = this.actions.get(state);
    const previousAction = this.activeState ? this.actions.get(this.activeState) : null;
    this.activeState = state;

    if (!nextAction) return;

    nextAction.enabled = true;
    nextAction.reset().setEffectiveWeight(1).play();

    if (previousAction && previousAction !== nextAction) {
      previousAction.crossFadeTo(nextAction, fadeMs / 1000, false);
    } else {
      nextAction.fadeIn(fadeMs / 1000);
    }
  }

  getHandWorldPosition(hand: 'left' | 'right'): THREE.Vector3 | null {
    const anchor = hand === 'left' ? this.leftHand : this.rightHand;
    if (!anchor) return null;

    const position = new THREE.Vector3();
    anchor.getWorldPosition(position);
    return position;
  }

  isUsingFallback(): boolean {
    return this.fallback;
  }

  hasVisiblePlayer(): boolean {
    return this.getVisibleBounds() !== null;
  }

  getVisibleBounds(): THREE.Box3 | null {
    const bounds = computeVisibleGeometryBounds(this.root);
    if (!bounds) {
      this.visibleBounds = null;
      return null;
    }

    const size = new THREE.Vector3();
    bounds.getSize(size);
    this.visibleBounds = Number.isFinite(size.y) && size.y >= MIN_VISIBLE_PLAYER_HEIGHT ? bounds : null;
    return this.visibleBounds;
  }

  dispose(): void {
    this.mixer?.stopAllAction();
    this.actions.clear();
    this.scene?.remove(this.root);
    this.root.clear();
    this.model = null;
    this.proceduralRig = null;
    this.loadedPoseRig = null;
    this.loadedPoseRestTransforms.clear();
    this.leftHand = null;
    this.rightHand = null;
    this.visibleBounds = null;
    this.scene = null;
  }

  private useLoadedModel(model: THREE.Object3D, clips: THREE.AnimationClip[]) {
    this.model = model;
    this.model.name = 'BasketballGLTFPlayer';
    this.model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.visible = true;
        object.castShadow = true;
        object.receiveShadow = true;
        hardenMaterialVisibility(object.material);
      }
    });

    this.root.clear();
    this.root.add(model);
    const fit = fitObjectToVisibleHeight(model);
    if (!fit.visible) {
      this.useProceduralFallback();
      return;
    }

    this.fallback = false;
    this.visibleBounds = computeVisibleGeometryBounds(this.root);
    this.mixer = new THREE.AnimationMixer(model);
    this.actions.clear();

    Object.values(BasketballActionState).forEach((state) => {
      const clip = this.findClipForState(clips, state);
      if (clip && this.mixer) {
        this.actions.set(state, this.mixer.clipAction(clip));
      }
    });

    this.leftHand = findHumanoidBone(model, 'left');
    this.rightHand = findHumanoidBone(model, 'right');
    this.loadedPoseRig = findHumanoidPoseRig(model);
    this.loadedPoseRestTransforms = capturePoseRigTransforms(this.loadedPoseRig);
    this.proceduralRig = null;
  }

  private findClipForState(clips: THREE.AnimationClip[], state: BasketballActionState) {
    const candidates = stateClipNames[state].map((name) => name.toLowerCase());
    return clips.find((clip) => candidates.some((candidate) => clip.name.toLowerCase().includes(candidate))) ?? clips[0];
  }

  private useProceduralFallback() {
    this.root.clear();
    this.fallback = true;
    this.mixer = null;
    this.actions.clear();

    const { group, rig } = createProceduralBasketballRig();
    this.model = group;
    this.proceduralRig = rig;
    this.loadedPoseRig = null;
    this.loadedPoseRestTransforms.clear();
    this.leftHand = rig.leftHand;
    this.rightHand = rig.rightHand;
    this.root.add(group);
    this.visibleBounds = computeVisibleGeometryBounds(this.root);
  }

  private applyProceduralMotion(input: BasketballMotionInput, state: BasketballActionState) {
    if (!this.proceduralRig) return;

    resetProceduralRigPose(this.proceduralRig);
    applyBasketballPose(this.proceduralRig, input, state, 1);
  }

  private applyLoadedPoseOverlay(input: BasketballMotionInput, state: BasketballActionState) {
    if (!this.loadedPoseRig) return;

    resetPoseRigTransforms(this.loadedPoseRestTransforms);
    applyBasketballPose(this.loadedPoseRig, input, state, 0.58);
  }
}

const createLimb = (name: string, radius: number, length: number, material: THREE.Material) => {
  const group = new THREE.Group();
  group.name = name;
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), material);
  mesh.position.y = -length / 2;
  mesh.castShadow = true;
  group.add(mesh);
  return group;
};

const findByNames = (root: THREE.Object3D, names: string[]) => {
  const normalizedNames = names.map((name) => name.replace(/[\s_.-]/g, '').toLowerCase());
  let found: THREE.Object3D | null = null;

  root.traverse((object) => {
    if (found) return;
    const normalized = object.name.replace(/[\s_.-]/g, '').toLowerCase();
    if (normalizedNames.includes(normalized)) {
      found = object;
    }
  });

  return found;
};

const findHumanoidPoseRig = (root: THREE.Object3D): HumanoidPoseRig => ({
  hips: findByNames(root, ['mixamorigHips', 'Hips', 'Bone']),
  chest: findByNames(root, ['mixamorigSpine', 'Spine', 'Torso', 'Abdomen']),
  head: findByNames(root, ['mixamorigHead', 'Head']),
  leftUpperArm: findByNames(root, ['mixamorigLeftArm', 'LeftArm', 'UpperArm.L', 'Arm.L']),
  leftForearm: findByNames(root, ['mixamorigLeftForeArm', 'LeftForeArm', 'LowerArm.L', 'ForeArm.L']),
  rightUpperArm: findByNames(root, ['mixamorigRightArm', 'RightArm', 'UpperArm.R', 'Arm.R']),
  rightForearm: findByNames(root, ['mixamorigRightForeArm', 'RightForeArm', 'LowerArm.R', 'ForeArm.R']),
  leftThigh: findByNames(root, ['mixamorigLeftUpLeg', 'LeftUpLeg', 'Thigh.L', 'Leg.L']),
  leftShin: findByNames(root, ['mixamorigLeftLeg', 'LeftLeg', 'Shin.L']),
  rightThigh: findByNames(root, ['mixamorigRightUpLeg', 'RightUpLeg', 'Thigh.R', 'Leg.R']),
  rightShin: findByNames(root, ['mixamorigRightLeg', 'RightLeg', 'Shin.R']),
});

const capturePoseRigTransforms = (rig: HumanoidPoseRig) => {
  const snapshots = new Map<THREE.Object3D, TransformSnapshot>();

  Object.values(rig).forEach((object) => {
    if (!object || snapshots.has(object)) return;

    snapshots.set(object, {
      position: object.position.clone(),
      rotation: object.rotation.clone(),
      scale: object.scale.clone(),
    });
  });

  return snapshots;
};

const resetPoseRigTransforms = (snapshots: Map<THREE.Object3D, TransformSnapshot>) => {
  snapshots.forEach((snapshot, object) => {
    object.position.copy(snapshot.position);
    object.rotation.copy(snapshot.rotation);
    object.scale.copy(snapshot.scale);
  });
};

const mixRotation = (object: THREE.Object3D | null, rotation: Partial<THREE.Euler>, influence: number) => {
  if (!object) return;

  if (rotation.x !== undefined) object.rotation.x += rotation.x * influence;
  if (rotation.y !== undefined) object.rotation.y += rotation.y * influence;
  if (rotation.z !== undefined) object.rotation.z += rotation.z * influence;
};

const applyBasketballPose = (
  rig: HumanoidPoseRig,
  input: BasketballMotionInput,
  state: BasketballActionState,
  influence: number,
) => {
  const strideSpeed = state === BasketballActionState.SprintDribble ? 13.5 : 9.4;
  const stride = input.isMoving ? Math.sin(input.elapsed * strideSpeed) : 0;
  const dribble = (1 - Math.cos(input.elapsed * (state === BasketballActionState.SprintDribble ? 13 : 9.5))) / 2;
  const gather = state === BasketballActionState.Gather || state === BasketballActionState.DunkGather ? 1 : 0;
  const reach =
    state === BasketballActionState.JumpShot ||
    state === BasketballActionState.DunkAirborne ||
    state === BasketballActionState.DunkImpact
      ? 1
      : gather * 0.48;
  const lift = state === BasketballActionState.DunkAirborne || state === BasketballActionState.DunkImpact ? 1 : 0;
  const recovery = state === BasketballActionState.Recovery ? 1 : 0;
  const sprint = state === BasketballActionState.SprintDribble ? 1 : 0;
  const crouch = gather * 0.2 + sprint * 0.1 + (1 - dribble) * 0.04;

  if (rig.hips) {
    rig.hips.position.y += (-crouch + lift * 0.18 - recovery * 0.05) * influence;
  }

  mixRotation(rig.hips, { x: -0.08 - sprint * 0.16 + reach * 0.06, z: -stride * 0.05 }, influence);
  mixRotation(rig.chest, { x: -0.04 + reach * 0.18, z: -stride * 0.08 }, influence);
  mixRotation(rig.head, { x: 0.05 - reach * 0.08 }, influence);
  mixRotation(rig.leftThigh, { x: stride * 0.5 - crouch * 0.45 + recovery * 0.18 }, influence);
  mixRotation(rig.rightThigh, { x: -stride * 0.5 - crouch * 0.45 + recovery * 0.14 }, influence);
  mixRotation(rig.leftShin, { x: Math.max(0, -stride) * 0.38 + crouch * 0.36 }, influence);
  mixRotation(rig.rightShin, { x: Math.max(0, stride) * 0.38 + crouch * 0.36 }, influence);
  mixRotation(rig.leftUpperArm, { x: 0.22 + stride * 0.13 - reach * 1.55, z: 0.28 - reach * 0.16 }, influence);
  mixRotation(rig.rightUpperArm, { x: -0.62 - (1 - dribble) * 0.5 - stride * 0.1 - reach * 1.18, z: -0.34 + reach * 0.1 }, influence);
  mixRotation(rig.leftForearm, { x: -0.14 - reach * 0.48 }, influence);
  mixRotation(rig.rightForearm, { x: -0.34 - reach * 0.86 }, influence);

  if (state === BasketballActionState.DunkImpact) {
    mixRotation(rig.chest, { x: 0.16 }, influence);
    mixRotation(rig.rightForearm, { x: -0.34 }, influence);
    mixRotation(rig.leftForearm, { x: -0.26 }, influence);
  }
};

const resetProceduralRigPose = (rig: ProceduralRig) => {
  rig.hips.position.y = 0.98;
  rig.hips.rotation.set(0, 0, 0);
  rig.chest.rotation.set(0, 0, 0);
  rig.head.rotation.set(0, 0, 0);
  rig.leftUpperArm.rotation.set(0, 0, 0.34);
  rig.leftForearm.rotation.set(0, 0, 0);
  rig.rightUpperArm.rotation.set(0, 0, -0.34);
  rig.rightForearm.rotation.set(0, 0, 0);
  rig.leftThigh.rotation.set(0, 0, 0);
  rig.leftShin.rotation.set(0, 0, 0);
  rig.rightThigh.rotation.set(0, 0, 0);
  rig.rightShin.rotation.set(0, 0, 0);
};

const createProceduralBasketballRig = (): { group: THREE.Group; rig: ProceduralRig } => {
  const group = new THREE.Group();
  group.name = 'ProceduralBasketballPlayer';

  const skin = new THREE.MeshStandardMaterial({ color: 0x9b5a3d, roughness: 0.72 });
  const jersey = new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.46 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x0077c8, roughness: 0.5 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.62 });

  const hips = new THREE.Group();
  hips.name = 'mixamorigHips';
  hips.position.y = 0.98;
  group.add(hips);

  const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.28, 0.36), jersey);
  shorts.position.y = -0.08;
  shorts.castShadow = true;
  hips.add(shorts);

  const chest = new THREE.Group();
  chest.name = 'mixamorigSpine';
  chest.position.y = 0.42;
  hips.add(chest);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.64, 8, 22), jersey);
  torso.scale.set(1.08, 1, 0.74);
  torso.castShadow = true;
  chest.add(torso);

  const jerseyStripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.04), blue);
  jerseyStripe.position.set(-0.27, 0, 0.22);
  chest.add(jerseyStripe, jerseyStripe.clone().translateX(0.54));

  const head = new THREE.Group();
  head.name = 'mixamorigHead';
  head.position.y = 0.62;
  chest.add(head);
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), skin);
  headMesh.castShadow = true;
  head.add(headMesh);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.245, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), black);
  hair.position.y = 0.08;
  hair.castShadow = true;
  head.add(hair);

  const leftUpperArm = createLimb('mixamorigLeftArm', 0.055, 0.38, skin);
  leftUpperArm.position.set(-0.34, 0.28, 0.02);
  leftUpperArm.rotation.z = 0.34;
  const leftForearm = createLimb('mixamorigLeftForeArm', 0.05, 0.4, skin);
  leftForearm.position.y = -0.38;
  const leftHand = new THREE.Bone();
  leftHand.name = 'mixamorigLeftHand';
  leftHand.position.y = -0.42;
  leftForearm.add(leftHand);
  leftUpperArm.add(leftForearm);

  const rightUpperArm = createLimb('mixamorigRightArm', 0.055, 0.38, skin);
  rightUpperArm.position.set(0.34, 0.28, 0.02);
  rightUpperArm.rotation.z = -0.34;
  const rightForearm = createLimb('mixamorigRightForeArm', 0.05, 0.4, skin);
  rightForearm.position.y = -0.38;
  const rightHand = new THREE.Bone();
  rightHand.name = 'mixamorigRightHand';
  rightHand.position.y = -0.42;
  rightForearm.add(rightHand);
  rightUpperArm.add(rightForearm);
  chest.add(leftUpperArm, rightUpperArm);

  const leftThigh = createLimb('mixamorigLeftUpLeg', 0.07, 0.46, skin);
  leftThigh.position.set(-0.17, -0.18, 0);
  const leftShin = createLimb('mixamorigLeftLeg', 0.06, 0.48, skin);
  leftShin.position.y = -0.46;
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.38), black);
  leftShoe.position.set(0, -0.5, 0.08);
  leftShoe.castShadow = true;
  leftShin.add(leftShoe);
  leftThigh.add(leftShin);

  const rightThigh = createLimb('mixamorigRightUpLeg', 0.07, 0.46, skin);
  rightThigh.position.set(0.17, -0.18, 0);
  const rightShin = createLimb('mixamorigRightLeg', 0.06, 0.48, skin);
  rightShin.position.y = -0.46;
  const rightShoe = leftShoe.clone();
  rightShin.add(rightShoe);
  rightThigh.add(rightShin);
  hips.add(leftThigh, rightThigh);

  group.scale.setScalar(1.48);

  return {
    group,
    rig: {
      hips,
      chest,
      head,
      leftUpperArm,
      leftForearm,
      rightUpperArm,
      rightForearm,
      leftThigh,
      leftShin,
      rightThigh,
      rightShin,
      leftHand,
      rightHand,
    },
  };
};
