import { describe, expect, test } from 'vitest';
import { ALL_HOME_LEVELS, LEVEL_STAGES, WORLD_ONE_LEVELS, WORLD_TWO_LEVELS, parseLevelDefinition, resolveLevelHoop } from '../home/levels';

const intersects = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

const hasClearHoopApproach = (level: ReturnType<typeof parseLevelDefinition>, elapsedMs: number) => {
  const hoop = resolveLevelHoop(level, elapsedMs);
  const lanes = [
    {
      x: hoop.sensor.x + hoop.sensor.width * 0.2,
      y: hoop.leftRim.y - level.cellSize * 0.9,
      width: hoop.sensor.width * 0.6,
      height: level.cellSize * 0.82,
    },
    {
      x: hoop.sensor.x - level.cellSize * 0.55,
      y: hoop.leftRim.y - level.cellSize * 0.92,
      width: level.cellSize * 0.5,
      height: level.cellSize * 0.82,
    },
    {
      x: hoop.sensor.x + hoop.sensor.width + level.cellSize * 0.05,
      y: hoop.leftRim.y - level.cellSize * 0.92,
      width: level.cellSize * 0.5,
      height: level.cellSize * 0.82,
    },
  ];

  return lanes.some((lane) => level.obstacles.every((obstacle) => !intersects(obstacle, lane)));
};

describe('home game level parsing', () => {
  test('parses launcher, obstacles and hoop from the level grid', () => {
    const level = parseLevelDefinition(WORLD_ONE_LEVELS[0]);

    expect(level.width).toBe(960);
    expect(level.height).toBe(576);
    expect(level.launcher.x).toBeGreaterThan(0);
    expect(level.launcher.y).toBeGreaterThan(level.height / 2);
    expect(level.hoop.center.x).toBeGreaterThan(level.width / 2);
    expect(level.obstacles.length).toBeGreaterThan(5);
  });

  test('builds two five-level stages for a total of ten levels', () => {
    const parsed = ALL_HOME_LEVELS.map(parseLevelDefinition);

    expect(LEVEL_STAGES).toHaveLength(2);
    expect(LEVEL_STAGES.every((stage) => stage.levels.length === 5)).toBe(true);
    expect(parsed).toHaveLength(10);
    expect(new Set(parsed.map((level) => level.id)).size).toBe(parsed.length);
    expect(parsed.every((level) => level.obstacles.length > 0)).toBe(true);
  });

  test('keeps every hoop reachable instead of sealing it with surrounding wall blocks', () => {
    const parsed = ALL_HOME_LEVELS.map(parseLevelDefinition);

    expect(
      parsed.every((level) =>
        [0, 700, 1400].every((elapsedMs) => hasClearHoopApproach(level, elapsedMs)),
      ),
    ).toBe(true);
  });

  test('makes world 2 harder with moving hoops on every level', () => {
    const parsed = WORLD_TWO_LEVELS.map(parseLevelDefinition);

    expect(parsed).toHaveLength(5);
    expect(parsed.every((level) => level.hoopMotion)).toBe(true);
    expect(
      parsed.every((level) => {
        const start = resolveLevelHoop(level, 0);
        const later = resolveLevelHoop(level, 900);

        return Math.abs(start.center.x - later.center.x) > 0.5 || Math.abs(start.center.y - later.center.y) > 0.5;
      }),
    ).toBe(true);
  });
});
