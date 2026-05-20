import type { HoopGeometry, ParsedLevel, Point, Rect } from './levels';
import { GAME_GRAVITY, type Vector } from './input';

export type BallState = Point & {
  vx: number;
  vy: number;
  radius: number;
  previousX: number;
  previousY: number;
};

export type StepResult = {
  ball: BallState | null;
  scored: boolean;
  killed: boolean;
  bounced: boolean;
};

const RESTITUTION = 0.82;
const FRICTION = 0.992;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const resolveCircleRect = (ball: BallState, rect: Rect) => {
  const closestX = clamp(ball.x, rect.x, rect.x + rect.width);
  const closestY = clamp(ball.y, rect.y, rect.y + rect.height);
  let dx = ball.x - closestX;
  let dy = ball.y - closestY;
  let distanceSquared = dx * dx + dy * dy;

  if (distanceSquared >= ball.radius * ball.radius) {
    return false;
  }

  if (distanceSquared === 0) {
    const distances = [
      { axis: 'left', value: Math.abs(ball.x - rect.x) },
      { axis: 'right', value: Math.abs(rect.x + rect.width - ball.x) },
      { axis: 'top', value: Math.abs(ball.y - rect.y) },
      { axis: 'bottom', value: Math.abs(rect.y + rect.height - ball.y) },
    ] as const;
    const nearest = distances.reduce((best, candidate) => (candidate.value < best.value ? candidate : best));

    if (nearest.axis === 'left') {
      dx = -1;
      dy = 0;
    } else if (nearest.axis === 'right') {
      dx = 1;
      dy = 0;
    } else if (nearest.axis === 'top') {
      dx = 0;
      dy = -1;
    } else {
      dx = 0;
      dy = 1;
    }

    distanceSquared = 1;
  }

  const distance = Math.sqrt(distanceSquared);
  const nx = dx / distance;
  const ny = dy / distance;
  const penetration = ball.radius - distance;

  ball.x += nx * penetration;
  ball.y += ny * penetration;

  const normalVelocity = ball.vx * nx + ball.vy * ny;
  if (normalVelocity < 0) {
    ball.vx -= (1 + RESTITUTION) * normalVelocity * nx;
    ball.vy -= (1 + RESTITUTION) * normalVelocity * ny;

    if (Math.abs(nx) > 0.5) {
      ball.vy *= FRICTION;
    }

    if (Math.abs(ny) > 0.5) {
      ball.vx *= FRICTION;
    }
  }

  return true;
};

const crossesSensorFromAbove = (ball: BallState, hoop: HoopGeometry) => {
  const previousBottom = ball.previousY + ball.radius;
  const currentBottom = ball.y + ball.radius;
  const currentTop = ball.y - ball.radius;
  const sensorTop = hoop.sensor.y;
  const sensorBottom = hoop.sensor.y + hoop.sensor.height;
  const withinSensorX = ball.x >= hoop.sensor.x - ball.radius * 0.2 && ball.x <= hoop.sensor.x + hoop.sensor.width + ball.radius * 0.2;
  const withinSensorY = currentBottom >= sensorTop && currentTop <= sensorBottom;
  const crossedIntoSensor = previousBottom <= sensorBottom && currentBottom >= sensorTop;

  return withinSensorX && withinSensorY && ball.vy > 0 && crossedIntoSensor;
};

const touchesHoopScoringRing = (ball: BallState, hoop: HoopGeometry) => {
  const rimCenterX = hoop.center.x;
  const rimCenterY = hoop.leftRim.y + 7;
  const outlineAllowance = 4;
  const rimRadiusX = (hoop.sensor.width + 12) / 2 + outlineAllowance;
  const rimRadiusY = 13 + outlineAllowance;
  const normalizedX = (ball.x - rimCenterX) / (rimRadiusX + ball.radius);
  const normalizedY = (ball.y - rimCenterY) / (rimRadiusY + ball.radius);

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
};

export const createBall = (origin: Point, velocity: Vector): BallState => ({
  x: origin.x,
  y: origin.y,
  previousX: origin.x,
  previousY: origin.y,
  vx: velocity.x,
  vy: velocity.y,
  radius: 14,
});

export const stepBall = (ball: BallState, level: ParsedLevel, deltaSeconds: number): StepResult => {
  const nextBall = { ...ball };
  const collisionRects = [...level.obstacles, level.hoop.leftRim, level.hoop.rightRim, level.hoop.backboard];
  const substeps = Math.max(3, Math.min(7, Math.ceil(deltaSeconds / 0.006)));
  const dt = deltaSeconds / substeps;
  let bounced = false;

  for (let step = 0; step < substeps; step += 1) {
    nextBall.previousX = nextBall.x;
    nextBall.previousY = nextBall.y;
    nextBall.vy += GAME_GRAVITY * dt;
    nextBall.x += nextBall.vx * dt;
    nextBall.y += nextBall.vy * dt;

    if (nextBall.x - nextBall.radius <= 0 || nextBall.x + nextBall.radius >= level.width) {
      return {
        ball: null,
        scored: false,
        killed: true,
        bounced,
      };
    }

    if (nextBall.y - nextBall.radius <= 0) {
      nextBall.y = nextBall.radius;
      nextBall.vy = Math.abs(nextBall.vy) * RESTITUTION;
      bounced = true;
    }

    if (touchesHoopScoringRing(nextBall, level.hoop)) {
      return {
        ball: nextBall,
        scored: true,
        killed: false,
        bounced,
      };
    }

    for (const rect of collisionRects) {
      if (resolveCircleRect(nextBall, rect)) {
        bounced = true;
      }
    }

    if (crossesSensorFromAbove(nextBall, level.hoop)) {
      return {
        ball: nextBall,
        scored: true,
        killed: false,
        bounced,
      };
    }

    if (nextBall.y + nextBall.radius >= level.height) {
      return {
        ball: null,
        scored: false,
        killed: true,
        bounced,
      };
    }
  }

  return {
    ball: nextBall,
    scored: false,
    killed: false,
    bounced,
  };
};
