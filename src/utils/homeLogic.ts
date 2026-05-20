export type PlayerPosition = {
  x: number;
  z: number;
};

export type CourtBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type MovementKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export type SceneEntry = {
  id: string;
  label: string;
  path: string;
  position: [number, number];
  radius: number;
};

export type ShotPoint = {
  x: number;
  y: number;
  z: number;
};

export type ShotQuality = 'too-short' | 'perfect' | 'too-long';

export type ChargedShotResult = {
  made: boolean;
  quality: ShotQuality;
  feedback: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const getMovementSpeed = (baseSpeed: number, sprintHeld: boolean, sprintMultiplier = 1.45) => {
  return Number((baseSpeed * (sprintHeld ? sprintMultiplier : 1)).toFixed(3));
};

export const movePlayer = (
  position: PlayerPosition,
  key: MovementKey,
  step: number,
  bounds: CourtBounds,
): PlayerPosition => {
  const next = { ...position };

  if (key === 'ArrowUp') next.z -= step;
  if (key === 'ArrowDown') next.z += step;
  if (key === 'ArrowLeft') next.x -= step;
  if (key === 'ArrowRight') next.x += step;

  return {
    x: clamp(Number(next.x.toFixed(3)), bounds.minX, bounds.maxX),
    z: clamp(Number(next.z.toFixed(3)), bounds.minZ, bounds.maxZ),
  };
};

export const findNearbyEntry = (
  position: PlayerPosition,
  entries: SceneEntry[],
): SceneEntry | null => {
  const matches = entries
    .map((entry) => {
      const [x, z] = entry.position;
      const distance = Math.hypot(position.x - x, position.z - z);

      return { entry, distance };
    })
    .filter(({ entry, distance }) => distance <= entry.radius)
    .sort((a, b) => a.distance - b.distance);

  return matches[0]?.entry ?? null;
};

export const getMovementIntent = (pressedKeys: ReadonlySet<MovementKey>): PlayerPosition => {
  const x = Number(pressedKeys.has('ArrowRight')) - Number(pressedKeys.has('ArrowLeft'));
  const z = Number(pressedKeys.has('ArrowDown')) - Number(pressedKeys.has('ArrowUp'));
  const length = Math.hypot(x, z);

  if (length === 0) {
    return { x: 0, z: 0 };
  }

  return {
    x: Number((x / length).toFixed(3)),
    z: Number((z / length).toFixed(3)),
  };
};

export const advancePlayer = (
  position: PlayerPosition,
  pressedKeys: ReadonlySet<MovementKey>,
  speed: number,
  deltaSeconds: number,
  bounds: CourtBounds,
): PlayerPosition => {
  const intent = getMovementIntent(pressedKeys);

  return {
    x: clamp(Number((position.x + intent.x * speed * deltaSeconds).toFixed(3)), bounds.minX, bounds.maxX),
    z: clamp(Number((position.z + intent.z * speed * deltaSeconds).toFixed(3)), bounds.minZ, bounds.maxZ),
  };
};

export const createShotPath = (
  start: ShotPoint,
  end: ShotPoint,
  points = 24,
  arcHeight = 3.4,
): ShotPoint[] => {
  const total = Math.max(2, Math.floor(points));

  return Array.from({ length: total }, (_, index) => {
    const t = index / (total - 1);
    const arc = Math.sin(Math.PI * t) * arcHeight;

    return {
      x: Number((start.x + (end.x - start.x) * t).toFixed(3)),
      y: Number((start.y + (end.y - start.y) * t + arc).toFixed(3)),
      z: Number((start.z + (end.z - start.z) * t).toFixed(3)),
    };
  });
};

export const calculateChargePercent = (heldMs: number, maxMs = 1300) => {
  return clamp(Math.round((Math.max(0, heldMs) / maxMs) * 100), 0, 100);
};

export const judgeChargedShot = (
  heldMs: number,
  perfectWindow = { min: 680, max: 900 },
): ChargedShotResult => {
  if (heldMs < perfectWindow.min) {
    return {
      made: false,
      quality: 'too-short',
      feedback: '蓄力太短，篮球砸到前框',
    };
  }

  if (heldMs > perfectWindow.max) {
    return {
      made: false,
      quality: 'too-long',
      feedback: '蓄力过长，篮球偏出篮筐',
    };
  }

  return {
    made: true,
    quality: 'perfect',
    feedback: '完美出手，空心命中',
  };
};
