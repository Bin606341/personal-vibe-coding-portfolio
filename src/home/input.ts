import type { Point } from './levels';

export type Vector = {
  x: number;
  y: number;
};

export type TrajectoryPoint = Point & {
  radius: number;
  opacity: number;
};

export type LauncherChargePose = {
  scaleX: number;
  scaleY: number;
  lift: number;
  charge: number;
};

export type ChargedShotProfile = {
  maxChargeMs?: number;
  minSpeed?: number;
  maxSpeed?: number;
  arcLift?: number;
};

export const MAX_DRAG_DISTANCE = 220;
export const LAUNCH_SPEED_SCALE = 4.4;
export const MAX_CHARGE_MS = 1200;
export const GAME_GRAVITY = 500;

const DEFAULT_MIN_CHARGED_SPEED = 220;
const DEFAULT_MAX_CHARGED_SPEED = 1100;
const DEFAULT_CHARGED_ARC_LIFT = 320;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampUnit = (value: number) => clamp(value, 0, 1);
const easeOutCubic = (value: number) => 1 - Math.pow(1 - clampUnit(value), 3);
const sampleCubic = (start: Point, controlA: Point, controlB: Point, end: Point, t: number): Point => {
  const inverse = 1 - t;

  return {
    x:
      inverse * inverse * inverse * start.x +
      3 * inverse * inverse * t * controlA.x +
      3 * inverse * t * t * controlB.x +
      t * t * t * end.x,
    y:
      inverse * inverse * inverse * start.y +
      3 * inverse * inverse * t * controlA.y +
      3 * inverse * t * t * controlB.y +
      t * t * t * end.y,
  };
};

export const calculateChargePercent = (heldMs: number, maxMs = MAX_CHARGE_MS) => {
  const safeMax = Math.max(1, maxMs);
  return clamp(Math.round((Math.max(0, heldMs) / safeMax) * 100), 0, 100);
};

export const getLauncherChargePose = (heldMs: number, maxMs = MAX_CHARGE_MS): LauncherChargePose => {
  const charge = clampUnit(Math.max(0, heldMs) / Math.max(1, maxMs));
  const eased = easeOutCubic(charge);

  return {
    scaleX: 1 + eased * 0.28,
    scaleY: 1 - eased * 0.2,
    lift: eased * 8,
    charge: calculateChargePercent(heldMs, maxMs),
  };
};

export const toChargedLaunchVelocity = (
  origin: Point,
  target: Point,
  heldMs: number,
  profile: ChargedShotProfile = {},
): Vector => {
  const maxChargeMs = profile.maxChargeMs ?? MAX_CHARGE_MS;
  const charge = clampUnit(Math.max(0, heldMs) / Math.max(1, maxChargeMs));
  // Keep tap shots soft and let medium charge build distance more gradually.
  const shapedCharge = Math.pow(charge, 1.6);
  const minSpeed = profile.minSpeed ?? DEFAULT_MIN_CHARGED_SPEED;
  const maxSpeed = profile.maxSpeed ?? DEFAULT_MAX_CHARGED_SPEED;
  const arcLift = profile.arcLift ?? DEFAULT_CHARGED_ARC_LIFT;
  const speed = minSpeed + (maxSpeed - minSpeed) * shapedCharge;
  const aimPoint = {
    x: target.x,
    y: target.y - arcLift,
  };
  const dx = aimPoint.x - origin.x;
  const dy = aimPoint.y - origin.y;
  const distance = Math.hypot(dx, dy) || 1;

  return {
    x: Number(((dx / distance) * speed).toFixed(3)),
    y: Number(((dy / distance) * speed).toFixed(3)),
  };
};

export const toLaunchVelocity = (origin: Point, pointer: Point): Vector => {
  const drag = {
    x: pointer.x - origin.x,
    y: pointer.y - origin.y,
  };
  const distance = Math.hypot(drag.x, drag.y);
  if (distance === 0) {
    return { x: 0, y: 0 };
  }

  const limitedDistance = Math.min(distance, MAX_DRAG_DISTANCE);
  const scale = limitedDistance / distance;

  return {
    x: drag.x * scale * LAUNCH_SPEED_SCALE,
    y: drag.y * scale * LAUNCH_SPEED_SCALE,
  };
};

export const getLauncherStretch = (origin: Point, pointer: Point) => {
  const distance = Math.min(Math.hypot(origin.x - pointer.x, origin.y - pointer.y), MAX_DRAG_DISTANCE);
  const force = clamp(distance / MAX_DRAG_DISTANCE, 0, 1);

  return {
    scaleX: 1 + force * 0.24,
    scaleY: 1 - force * 0.18,
    lift: force * 6,
  };
};

export const buildTrajectoryPreview = (
  origin: Point,
  pointer: Point,
  width: number,
  height: number,
  gravity = GAME_GRAVITY,
): TrajectoryPoint[] => {
  const velocity = toLaunchVelocity(origin, pointer);
  if (Math.hypot(velocity.x, velocity.y) < 20) {
    return [];
  }

  const preview: TrajectoryPoint[] = [];

  for (let step = 1; step <= 20; step += 1) {
    const time = step * 0.12;
    const x = origin.x + velocity.x * time;
    const y = origin.y + velocity.y * time + 0.5 * gravity * time * time;

    if (x < -40 || x > width + 40 || y < -40 || y > height + 120) {
      break;
    }

    preview.push({
      x,
      y,
      radius: Math.max(4 - step * 0.12, 1.8),
      opacity: Math.max(0.9 - step * 0.035, 0.18),
    });
  }

  return preview;
};

export const buildChargedShotPreview = (
  origin: Point,
  target: Point,
  heldMs: number,
  maxPoints = 6,
): TrajectoryPoint[] => {
  const velocity = toChargedLaunchVelocity(origin, target, heldMs);
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed < 20) {
    return [];
  }

  const direction = {
    x: velocity.x / speed,
    y: velocity.y / speed,
  };
  const charge = clampUnit(Math.max(0, heldMs) / MAX_CHARGE_MS);
  const easedCharge = easeOutCubic(charge);
  const pointCount = Math.max(3, Math.min(8, Math.floor(maxPoints)));
  const guideDistance = 150 + easedCharge * 55;
  const guideLift = 38 + easedCharge * 30;
  const end = {
    x: origin.x + direction.x * guideDistance,
    y: origin.y + direction.y * guideDistance,
  };
  const controlA = {
    x: origin.x + direction.x * guideDistance * 0.34,
    y: origin.y + direction.y * guideDistance * 0.34,
  };
  const controlB = {
    x: origin.x + direction.x * guideDistance * 0.78,
    y: origin.y + direction.y * guideDistance * 0.78 - guideLift,
  };

  return Array.from({ length: pointCount }, (_, index) => {
    const step = index + 1;
    const point = sampleCubic(origin, controlA, controlB, end, step / pointCount);

    return {
      x: Number(point.x.toFixed(3)),
      y: Number(point.y.toFixed(3)),
      radius: Math.max(3.8 - step * 0.24, 1.7),
      opacity: Math.max(0.94 - step * 0.09, 0.32),
    };
  });
};
