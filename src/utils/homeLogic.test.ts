import { describe, expect, it } from 'vitest';
import {
  advancePlayer,
  calculateChargePercent,
  createShotPath,
  findNearbyEntry,
  getMovementIntent,
  judgeChargedShot,
  movePlayer,
  type SceneEntry,
} from './homeLogic';

const bounds = {
  minX: -10,
  maxX: 10,
  minZ: -6,
  maxZ: 6,
};

const entries: SceneEntry[] = [
  { id: 'players', label: '现役球员区', path: '/players', position: [-7, -3], radius: 2 },
  { id: 'hall', label: '历史名人堂区', path: '/hall', position: [7, -2], radius: 2 },
  { id: 'training', label: '教学区', path: '/training', position: [0, 5], radius: 2 },
];

describe('home scene movement logic', () => {
  it('moves the player with arrow directions', () => {
    expect(movePlayer({ x: 0, z: 0 }, 'ArrowUp', 1, bounds)).toEqual({ x: 0, z: -1 });
    expect(movePlayer({ x: 0, z: 0 }, 'ArrowDown', 1, bounds)).toEqual({ x: 0, z: 1 });
    expect(movePlayer({ x: 0, z: 0 }, 'ArrowLeft', 1, bounds)).toEqual({ x: -1, z: 0 });
    expect(movePlayer({ x: 0, z: 0 }, 'ArrowRight', 1, bounds)).toEqual({ x: 1, z: 0 });
  });

  it('keeps the player inside court bounds', () => {
    expect(movePlayer({ x: 10, z: -6 }, 'ArrowUp', 3, bounds)).toEqual({ x: 10, z: -6 });
    expect(movePlayer({ x: -10, z: 6 }, 'ArrowLeft', 3, bounds)).toEqual({ x: -10, z: 6 });
  });

  it('returns the closest nearby scene entry inside its radius', () => {
    const nearby = findNearbyEntry({ x: -6.5, z: -2.5 }, entries);

    expect(nearby?.id).toBe('players');
  });

  it('returns null when no entry is close enough', () => {
    expect(findNearbyEntry({ x: 0, z: 0 }, entries)).toBeNull();
  });

  it('normalizes diagonal movement intent from simultaneous keys', () => {
    const intent = getMovementIntent(new Set(['ArrowUp', 'ArrowRight']));

    expect(intent.x).toBeCloseTo(0.707, 2);
    expect(intent.z).toBeCloseTo(-0.707, 2);
  });

  it('advances the player smoothly with delta time and diagonal input', () => {
    const next = advancePlayer(
      { x: 0, z: 0 },
      new Set(['ArrowDown', 'ArrowRight']),
      2,
      0.5,
      bounds,
    );

    expect(next.x).toBeCloseTo(0.707, 2);
    expect(next.z).toBeCloseTo(0.707, 2);
  });
});

describe('home scene shot path', () => {
  it('creates an arcing basketball path with a visible peak', () => {
    const path = createShotPath({ x: 0, y: 1, z: 2 }, { x: 0, y: 3, z: -5 }, 8);

    expect(path).toHaveLength(8);
    expect(path[0]).toEqual({ x: 0, y: 1, z: 2 });
    expect(path[path.length - 1]).toEqual({ x: 0, y: 3, z: -5 });
    expect(Math.max(...path.map((point) => point.y))).toBeGreaterThan(4);
  });
});

describe('charged shooting logic', () => {
  it('maps held duration to a capped charge percent', () => {
    expect(calculateChargePercent(0)).toBe(0);
    expect(calculateChargePercent(650)).toBe(50);
    expect(calculateChargePercent(1300)).toBe(100);
    expect(calculateChargePercent(1800)).toBe(100);
  });

  it('judges short, perfect, and long release timing', () => {
    expect(judgeChargedShot(360)).toEqual({
      made: false,
      quality: 'too-short',
      feedback: '蓄力太短，篮球砸到前框',
    });
    expect(judgeChargedShot(760)).toEqual({
      made: true,
      quality: 'perfect',
      feedback: '完美出手，空心命中',
    });
    expect(judgeChargedShot(1180)).toEqual({
      made: false,
      quality: 'too-long',
      feedback: '蓄力过长，篮球偏出篮筐',
    });
  });
});
