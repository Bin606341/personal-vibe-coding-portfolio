import { describe, expect, it } from 'vitest';
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
} from './dunkLogic';

const rim = { x: 0, y: 2.78, z: -5.85 };
const takeoff = { x: 0, y: 0, z: -4.55 };

describe('DunkInputMapper', () => {
  it('maps Sprint + KeyD + ArrowUp to a safe two-hand dunk intent', () => {
    const mapper = new DunkInputMapper();
    mapper.handleKeyDown({ code: 'ShiftLeft' });
    mapper.handleKeyDown({ code: 'ArrowUp' });

    const intent = mapper.handleKeyDown({ code: 'KeyD', key: 'd', repeat: false });

    expect(intent).toMatchObject({
      type: DunkActionType.SafeTwoHand,
      directionKey: 'ArrowUp',
    });
  });

  it('tracks the latest held direction so keyboard combos stay deterministic', () => {
    const mapper = new DunkInputMapper();
    mapper.handleKeyDown({ code: 'ShiftLeft' });
    mapper.handleKeyDown({ code: 'ArrowUp' });
    mapper.handleKeyDown({ code: 'ArrowRight' });

    const intent = mapper.handleKeyDown({ code: 'KeyD', key: 'd', repeat: false });

    expect(intent?.type).toBe(DunkActionType.RightHandPower);
    expect(intent?.directionKey).toBe('ArrowRight');
  });

  it('defaults Shift + KeyD without a direction to a safe two-hand dunk', () => {
    const mapper = new DunkInputMapper();
    mapper.handleKeyDown({ code: 'ShiftLeft' });

    const intent = mapper.handleKeyDown({ code: 'KeyD', key: 'd', repeat: false });

    expect(intent).toMatchObject({
      type: DunkActionType.SafeTwoHand,
      directionKey: 'ArrowUp',
    });
  });

  it('does not emit an intent when sprint is missing or keydown repeats', () => {
    const mapper = new DunkInputMapper();
    mapper.handleKeyDown({ code: 'ArrowLeft' });

    expect(mapper.handleKeyDown({ code: 'KeyD', key: 'd', repeat: false })).toBeNull();

    mapper.handleKeyDown({ code: 'ShiftRight' });
    expect(mapper.handleKeyDown({ code: 'KeyD', key: 'd', repeat: true })).toBeNull();
  });

  it('does not use Space as a dunk action key anymore', () => {
    const mapper = new DunkInputMapper();
    mapper.handleKeyDown({ code: 'ShiftLeft' });
    mapper.handleKeyDown({ code: 'ArrowRight' });

    expect(mapper.handleKeyDown({ code: 'Space', repeat: false })).toBeNull();
  });
});

describe('DunkSpatialContext', () => {
  it('allows a dunk request only inside the trigger zone with enough forward speed', () => {
    const context = new DunkSpatialContext({
      rimPosition: rim,
      takeoffPoint: takeoff,
      zone: {
        radius: 2.6,
        halfAngleRadians: Math.PI / 4,
        minForwardSpeed: 4.2,
      },
    });

    expect(
      context.evaluate({
        rootPosition: { x: 0.2, y: 0, z: -3.6 },
        forward: { x: 0, y: 0, z: -1 },
        velocity: { x: 0, y: 0, z: -4.5 },
      }),
    ).toMatchObject({ allowed: true });

    expect(
      context.evaluate({
        rootPosition: { x: 4.2, y: 0, z: -3.6 },
        forward: { x: 0, y: 0, z: -1 },
        velocity: { x: 0, y: 0, z: -4.5 },
      }),
    ).toMatchObject({ allowed: false, reason: 'outside-zone' });

    expect(
      context.evaluate({
        rootPosition: { x: 0.2, y: 0, z: -3.6 },
        forward: { x: 0, y: 0, z: -1 },
        velocity: { x: 0, y: 0, z: -1.5 },
      }),
    ).toMatchObject({ allowed: false, reason: 'insufficient-speed' });
  });

  it('allows dunk attempts from any facing direction inside the paint zone', () => {
    const context = new DunkSpatialContext({
      rimPosition: rim,
      takeoffPoint: takeoff,
      zone: {
        radius: 2.6,
        halfAngleRadians: Math.PI / 4,
        minForwardSpeed: 0,
        paint: {
          minX: -2.45,
          maxX: 2.45,
          minZ: -6.4,
          maxZ: -2.2,
        },
      },
    });

    const fromLeftSideFacingAway = context.evaluate({
      rootPosition: { x: -2.1, y: 0, z: -4.4 },
      forward: { x: -1, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    });
    const fromRightSideFacingBaseline = context.evaluate({
      rootPosition: { x: 2.1, y: 0, z: -5.8 },
      forward: { x: 0, y: 0, z: 1 },
      velocity: { x: 0, y: 0, z: 0 },
    });

    expect(fromLeftSideFacingAway).toMatchObject({ allowed: true });
    expect(fromRightSideFacingBaseline).toMatchObject({ allowed: true });
  });
});

describe('CustomTargetMatcher', () => {
  it('smoothly warps the root through gather and airborne targets', () => {
    const matcher = new CustomTargetMatcher([
      {
        id: 'gather-to-takeoff',
        fromTimeMs: 0,
        toTimeMs: 260,
        from: { x: 0.4, y: 0, z: -3.2 },
        to: takeoff,
      },
      {
        id: 'airborne-to-rim',
        fromTimeMs: 260,
        toTimeMs: 700,
        from: takeoff,
        to: { x: 0, y: 2.1, z: -5.72 },
      },
    ]);

    expect(matcher.sample(0).position).toEqual({ x: 0.4, y: 0, z: -3.2 });
    expect(matcher.sample(130).position.x).toBeGreaterThan(0);
    expect(matcher.sample(130).position.x).toBeLessThan(0.4);
    expect(matcher.sample(520).position.y).toBeGreaterThan(0.9);
    expect(matcher.sample(900).position).toEqual({ x: 0, y: 2.1, z: -5.72 });
  });
});

describe('DunkStateMachine', () => {
  it('locks movement and advances Locomotion -> Gather -> Airborne -> Impact -> Recovery -> Locomotion', () => {
    const fsm = new DunkStateMachine(defaultDunkActionConfigs);
    const started = fsm.request({
      type: DunkActionType.SafeTwoHand,
      directionKey: 'ArrowUp',
      requestedAtMs: 0,
    });

    expect(started).toBe(true);
    expect(fsm.snapshot().state).toBe(DunkState.Gather);
    expect(fsm.snapshot().inputLocked).toBe(true);

    fsm.update(190);
    expect(fsm.snapshot().state).toBe(DunkState.Airborne);

    fsm.update(430);
    expect(fsm.snapshot().state).toBe(DunkState.Impact);

    fsm.update(130);
    expect(fsm.snapshot().state).toBe(DunkState.Recovery);

    fsm.update(260);
    expect(fsm.snapshot().state).toBe(DunkState.Locomotion);
    expect(fsm.snapshot().inputLocked).toBe(false);
  });

  it('rejects new dunk requests during committed states', () => {
    const fsm = new DunkStateMachine(defaultDunkActionConfigs);

    expect(
      fsm.request({
        type: DunkActionType.ReverseFlashy,
        directionKey: 'ArrowDown',
        requestedAtMs: 0,
      }),
    ).toBe(true);

    expect(
      fsm.request({
        type: DunkActionType.SafeTwoHand,
        directionKey: 'ArrowUp',
        requestedAtMs: 60,
      }),
    ).toBe(false);
    expect(fsm.snapshot().intent?.type).toBe(DunkActionType.ReverseFlashy);
  });
});

describe('DunkCombatResolver', () => {
  it('makes safe dunks harder to block than flashy reverse dunks', () => {
    const resolver = new DunkCombatResolver();
    const configs: Record<DunkActionType, DunkActionConfig> = defaultDunkActionConfigs;

    expect(
      resolver.resolve({
        defenderIntersects: true,
        defenderBlockPower: 0.58,
        action: configs[DunkActionType.SafeTwoHand],
      }),
    ).toBe(DunkResult.Success);

    expect(
      resolver.resolve({
        defenderIntersects: true,
        defenderBlockPower: 0.58,
        action: configs[DunkActionType.ReverseFlashy],
      }),
    ).toBe(DunkResult.Blocked);
  });
});
