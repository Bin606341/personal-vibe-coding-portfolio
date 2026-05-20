import * as THREE from 'three';
import { describe, expect, test } from 'vitest';
import { DunkActionType, DunkState, defaultDunkActionConfigs } from '../dunk/dunkLogic';
import {
  BasketballActionState,
  BasketballCharacterController,
  computeVisibleGeometryBounds,
  findHumanoidBone,
  fitObjectToHeight,
  fitObjectToVisibleHeight,
  resolveBasketballActionState,
} from './basketballCharacter';

describe('resolveBasketballActionState', () => {
  test('maps locomotion inputs to idle, jog dribble, and sprint dribble', () => {
    expect(
      resolveBasketballActionState({
        isMoving: false,
        isSprinting: false,
        isChargingShot: false,
        isShooting: false,
        dunkState: DunkState.Locomotion,
        dunkAction: null,
        elapsed: 0,
      }),
    ).toBe(BasketballActionState.Idle);

    expect(
      resolveBasketballActionState({
        isMoving: true,
        isSprinting: false,
        isChargingShot: false,
        isShooting: false,
        dunkState: DunkState.Locomotion,
        dunkAction: null,
        elapsed: 0,
      }),
    ).toBe(BasketballActionState.JogDribble);

    expect(
      resolveBasketballActionState({
        isMoving: true,
        isSprinting: true,
        isChargingShot: false,
        isShooting: false,
        dunkState: DunkState.Locomotion,
        dunkAction: null,
        elapsed: 0,
      }),
    ).toBe(BasketballActionState.SprintDribble);
  });

  test('gives shot and dunk commitments priority over locomotion', () => {
    expect(
      resolveBasketballActionState({
        isMoving: true,
        isSprinting: true,
        isChargingShot: true,
        isShooting: false,
        dunkState: DunkState.Locomotion,
        dunkAction: null,
        elapsed: 0,
      }),
    ).toBe(BasketballActionState.Gather);

    expect(
      resolveBasketballActionState({
        isMoving: true,
        isSprinting: true,
        isChargingShot: false,
        isShooting: true,
        dunkState: DunkState.Locomotion,
        dunkAction: null,
        elapsed: 0,
      }),
    ).toBe(BasketballActionState.JumpShot);

    expect(
      resolveBasketballActionState({
        isMoving: true,
        isSprinting: true,
        isChargingShot: false,
        isShooting: false,
        dunkState: DunkState.Airborne,
        dunkAction: defaultDunkActionConfigs[DunkActionType.SafeTwoHand],
        elapsed: 0,
      }),
    ).toBe(BasketballActionState.DunkAirborne);
  });
});

describe('findHumanoidBone', () => {
  test('matches common Mixamo and generic hand bone names', () => {
    const root = new THREE.Group();
    const mixamoRightHand = new THREE.Bone();
    mixamoRightHand.name = 'mixamorigRightHand';
    const genericLeftHand = new THREE.Bone();
    genericLeftHand.name = 'LeftHand';
    root.add(mixamoRightHand, genericLeftHand);

    expect(findHumanoidBone(root, 'right')?.name).toBe('mixamorigRightHand');
    expect(findHumanoidBone(root, 'left')?.name).toBe('LeftHand');
  });

  test('matches palm bones used by the Quaternius GLB player', () => {
    const root = new THREE.Group();
    const rightPalm = new THREE.Bone();
    rightPalm.name = 'Palm.R';
    const leftPalm = new THREE.Bone();
    leftPalm.name = 'Palm.L';
    root.add(rightPalm, leftPalm);

    expect(findHumanoidBone(root, 'right')?.name).toBe('Palm.R');
    expect(findHumanoidBone(root, 'left')?.name).toBe('Palm.L');
  });
});

describe('fitObjectToHeight', () => {
  test('normalizes a tall imported model to basketball court scale', () => {
    const model = new THREE.Mesh(new THREE.BoxGeometry(2, 12, 2), new THREE.MeshBasicMaterial());

    const result = fitObjectToHeight(model, 2.02);

    expect(result.originalHeight).toBeCloseTo(12);
    expect(result.scale).toBeCloseTo(2.02 / 12);
    expect(model.scale.y).toBeCloseTo(2.02 / 12);
    expect(result.height).toBeCloseTo(2.02);
  });

  test('computes bounds from visible mesh geometry instead of invisible scene helpers', () => {
    const root = new THREE.Group();
    const visiblePlayer = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshBasicMaterial());
    const invisibleHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 80, 1), new THREE.MeshBasicMaterial());
    visiblePlayer.position.y = 1;
    invisibleHelper.visible = false;
    root.add(visiblePlayer, invisibleHelper);

    const bounds = computeVisibleGeometryBounds(root);
    const size = new THREE.Vector3();
    bounds?.getSize(size);

    expect(bounds).toBeTruthy();
    expect(size.y).toBeCloseTo(2);
  });

  test('normalizes nested oversized GLB transforms by their visible geometry height', () => {
    const root = new THREE.Group();
    const armature = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.048, 0.01), new THREE.MeshBasicMaterial());
    armature.scale.setScalar(100);
    body.scale.setScalar(100);
    root.add(armature);
    armature.add(body);

    const result = fitObjectToVisibleHeight(root, 2.02);
    const bounds = computeVisibleGeometryBounds(root);
    const size = new THREE.Vector3();
    bounds?.getSize(size);

    expect(result.visible).toBe(true);
    expect(result.originalHeight).toBeGreaterThan(100);
    expect(size.y).toBeCloseTo(2.02);
    expect(bounds?.min.y).toBeCloseTo(0);
  });
});

describe('BasketballCharacterController', () => {
  test('creates a procedural fallback rig with queryable hand anchors', async () => {
    const scene = new THREE.Scene();
    const controller = new BasketballCharacterController({ assetUrl: null });

    await controller.load(scene);
    controller.update(1 / 60, {
      isMoving: false,
      isSprinting: false,
      isChargingShot: true,
      isShooting: false,
      dunkState: DunkState.Locomotion,
      dunkAction: null,
      elapsed: 0.35,
    });

    expect(controller.isUsingFallback()).toBe(true);
    expect(controller.hasVisiblePlayer()).toBe(true);
    expect(controller.getVisibleBounds()).toBeInstanceOf(THREE.Box3);
    expect(scene.children).toContain(controller.root);
    expect(controller.getHandWorldPosition('right')).toBeInstanceOf(THREE.Vector3);

    controller.dispose();
    expect(scene.children).not.toContain(controller.root);
  });

  test('keeps a procedural player visible while an external model is unavailable', async () => {
    const scene = new THREE.Scene();
    const controller = new BasketballCharacterController({ assetUrl: '/missing-player.glb' });

    const loading = controller.load(scene);

    expect(scene.children).toContain(controller.root);
    expect(controller.isUsingFallback()).toBe(true);

    await loading;
    expect(controller.isUsingFallback()).toBe(true);
  });

  test('keeps basketball pose offsets active for loaded humanoid rigs', async () => {
    const scene = new THREE.Scene();
    const controller = new BasketballCharacterController({ assetUrl: null });
    await controller.load(scene);

    const before = controller.getHandWorldPosition('right')?.clone();
    controller.update(1 / 60, {
      isMoving: false,
      isSprinting: false,
      isChargingShot: false,
      isShooting: false,
      dunkState: DunkState.Airborne,
      dunkAction: defaultDunkActionConfigs[DunkActionType.SafeTwoHand],
      elapsed: 0.9,
    });
    const after = controller.getHandWorldPosition('right')?.clone();

    expect(before).toBeTruthy();
    expect(after).toBeTruthy();
    expect(after!.y).toBeGreaterThan(before!.y + 0.15);
  });

  test('resets loaded humanoid pose before applying the basketball overlay each frame', () => {
    const controller = new BasketballCharacterController({ assetUrl: null });
    const model = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshBasicMaterial());
    const hips = new THREE.Bone();
    hips.name = 'Hips';
    mesh.position.y = 1;
    model.add(mesh, hips);

    (controller as unknown as { useLoadedModel: (model: THREE.Object3D, clips: THREE.AnimationClip[]) => void }).useLoadedModel(
      model,
      [],
    );

    const input = {
      isMoving: false,
      isSprinting: false,
      isChargingShot: false,
      isShooting: false,
      dunkState: DunkState.Locomotion,
      dunkAction: null,
      elapsed: 0,
    };

    controller.update(1 / 60, input);
    const firstFrameY = hips.position.y;
    controller.update(1 / 60, input);

    expect(hips.position.y).toBeCloseTo(firstFrameY);
  });
});
