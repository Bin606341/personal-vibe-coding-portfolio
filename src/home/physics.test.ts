import { describe, expect, test } from 'vitest';
import { createBall, stepBall } from './physics';
import { getLauncherChargePose, toChargedLaunchVelocity } from './input';
import { ALL_HOME_LEVELS, WORLD_ONE_LEVELS, parseLevelDefinition, type ParsedLevel } from './levels';

const wallBounceLevel: ParsedLevel = {
  id: 'wall-bounce',
  label: 'WALL',
  theme: 'ocean',
  width: 400,
  height: 260,
  cellSize: 48,
  launcher: { x: 80, y: 190 },
  obstacles: [{ x: 160, y: 70, width: 48, height: 150 }],
  hoop: {
    center: { x: 320, y: 120 },
    leftRim: { x: 290, y: 110, width: 10, height: 6 },
    rightRim: { x: 340, y: 110, width: 10, height: 6 },
    backboard: { x: 356, y: 88, width: 6, height: 42 },
    sensor: { x: 296, y: 118, width: 48, height: 40 },
  },
};

const createLaunchOrigin = (level: ParsedLevel, heldMs: number) => {
  const shooterPosition = {
    x: level.launcher.x,
    y: level.launcher.y - 22,
  };
  const pose = getLauncherChargePose(heldMs);

  return {
    x: shooterPosition.x + 8,
    y: shooterPosition.y - 46 - pose.lift * 0.45,
  };
};

describe('home game physics', () => {
  test('kills the ball as soon as it reaches the bottom boundary', () => {
    const level = parseLevelDefinition(WORLD_ONE_LEVELS[0]);
    const ball = createBall({ x: 120, y: level.height - 13 }, { x: 0, y: 0 });
    const result = stepBall(ball, level, 1 / 60);

    expect(result.killed).toBe(true);
    expect(result.ball).toBeNull();
  });

  test('kills the ball when it hits the side boundary instead of bouncing', () => {
    const ball = createBall({ x: 13, y: 124 }, { x: 0, y: 0 });
    const result = stepBall(ball, wallBounceLevel, 1 / 60);

    expect(result.killed).toBe(true);
    expect(result.ball).toBeNull();
    expect(result.bounced).toBe(false);
  });

  test('scores when the ball crosses the hoop sensor from above', () => {
    const level = parseLevelDefinition(WORLD_ONE_LEVELS[0]);
    const ball = createBall(
      { x: level.hoop.center.x, y: level.hoop.sensor.y - 30 },
      { x: 0, y: 260 },
    );
    const result = stepBall(ball, level, 0.08);

    expect(result.scored).toBe(true);
    expect(result.killed).toBe(false);
  });

  test('scores as soon as the ball touches the red hoop ring area', () => {
    const ball = createBall(
      { x: wallBounceLevel.hoop.center.x, y: wallBounceLevel.hoop.leftRim.y - 10 },
      { x: 0, y: 0 },
    );
    const result = stepBall(ball, wallBounceLevel, 1 / 60);

    expect(result.scored).toBe(true);
    expect(result.killed).toBe(false);
  });

  test('scores when the ball clips the black outline around the hoop ring', () => {
    const ball = createBall(
      { x: wallBounceLevel.hoop.center.x + 45, y: wallBounceLevel.hoop.leftRim.y + 7 },
      { x: 0, y: 0 },
    );
    const result = stepBall(ball, wallBounceLevel, 1 / 60);

    expect(result.scored).toBe(true);
    expect(result.killed).toBe(false);
  });

  test('bounces the charged shot off wall blocks before it keeps flying', () => {
    const ball = createBall({ x: 126, y: 124 }, { x: 200, y: 0 });
    const result = stepBall(ball, wallBounceLevel, 0.1);

    expect(result.bounced).toBe(true);
    expect(result.ball?.vx).toBeLessThan(0);
    expect(result.killed).toBe(false);
  });

  test('creates a playable charged launch vector toward the hoop on all home levels', () => {
    for (const definition of ALL_HOME_LEVELS) {
      const level = parseLevelDefinition(definition);
      const origin = createLaunchOrigin(level, 700);
      const velocity = toChargedLaunchVelocity(origin, level.hoop.center, 700);

      expect(Number.isFinite(velocity.x), `${definition.id} should create a finite horizontal speed`).toBe(true);
      expect(Number.isFinite(velocity.y), `${definition.id} should create a finite vertical speed`).toBe(true);
      expect(Math.hypot(velocity.x, velocity.y), `${definition.id} should create a visible shot speed`).toBeGreaterThan(100);
    }
  });
});
