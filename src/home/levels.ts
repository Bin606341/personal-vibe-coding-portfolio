export type Point = {
  x: number;
  y: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HoopGeometry = {
  leftRim: Rect;
  rightRim: Rect;
  backboard: Rect;
  sensor: Rect;
  center: Point;
};

export type HoopMotion = {
  axis: 'x' | 'y';
  amplitude: number;
  speed: number;
  phase?: number;
};

export type LevelTheme = 'ocean' | 'sun';

export type ParsedLevel = {
  id: string;
  label: string;
  theme: LevelTheme;
  width: number;
  height: number;
  cellSize: number;
  launcher: Point;
  obstacles: Rect[];
  hoop: HoopGeometry;
  hoopMotion?: HoopMotion;
};

export type LevelDefinition = {
  id: string;
  label: string;
  theme: LevelTheme;
  grid: number[][];
  hoopMotion?: HoopMotion;
};

export type LevelStageDefinition = {
  id: string;
  label: string;
  levels: LevelDefinition[];
};

const CELL_SIZE = 48;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 12;

type CellRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CellPoint = [number, number];

const emptyGrid = () => Array.from({ length: GRID_HEIGHT }, () => Array<number>(GRID_WIDTH).fill(0));

const fillCells = (grid: number[][], rect: CellRect) => {
  for (let row = rect.y; row < rect.y + rect.height; row += 1) {
    for (let column = rect.x; column < rect.x + rect.width; column += 1) {
      if (row >= 0 && row < GRID_HEIGHT && column >= 0 && column < GRID_WIDTH) {
        grid[row][column] = 1;
      }
    }
  }
};

const createLevel = (
  id: string,
  label: string,
  theme: LevelTheme,
  launcher: CellPoint,
  hoop: CellPoint,
  blocks: CellRect[],
  options: Pick<LevelDefinition, 'hoopMotion'> = {},
): LevelDefinition => {
  const grid = emptyGrid();

  blocks.forEach((block) => fillCells(grid, block));
  grid[launcher[1]][launcher[0]] = 2;
  grid[hoop[1]][hoop[0]] = 3;

  return {
    id,
    label,
    theme,
    grid,
    hoopMotion: options.hoopMotion,
  };
};

export const WORLD_ONE_LEVELS: LevelDefinition[] = [
  createLevel(
    'w1-1',
    'BANK 1',
    'ocean',
    [3, 10],
    [14, 9],
    [
      { x: 1, y: 10, width: 5, height: 1 },
      { x: 8, y: 6, width: 4, height: 4 },
      { x: 15, y: 6, width: 3, height: 4 },
      { x: 17, y: 3, width: 1, height: 3 },
    ],
  ),
  createLevel(
    'w1-2',
    'BANK 2',
    'ocean',
    [2, 10],
    [14, 9],
    [
      { x: 1, y: 10, width: 4, height: 1 },
      { x: 6, y: 8, width: 3, height: 1 },
      { x: 9, y: 6, width: 3, height: 3 },
      { x: 12, y: 8, width: 1, height: 2 },
      { x: 15, y: 7, width: 3, height: 3 },
      { x: 17, y: 4, width: 1, height: 3 },
    ],
  ),
  createLevel(
    'w1-3',
    'DROP',
    'sun',
    [16, 4],
    [9, 8],
    [
      { x: 12, y: 5, width: 5, height: 3 },
      { x: 18, y: 1, width: 1, height: 3 },
      { x: 5, y: 7, width: 2, height: 1 },
      { x: 6, y: 8, width: 2, height: 1 },
      { x: 10, y: 7, width: 1, height: 2 },
      { x: 11, y: 8, width: 2, height: 1 },
    ],
  ),
  createLevel(
    'w1-4',
    'GLASS',
    'sun',
    [3, 8],
    [12, 7],
    [
      { x: 1, y: 9, width: 5, height: 1 },
      { x: 8, y: 5, width: 2, height: 5 },
      { x: 11, y: 4, width: 2, height: 1 },
      { x: 15, y: 5, width: 2, height: 3 },
      { x: 14, y: 8, width: 3, height: 1 },
    ],
  ),
  createLevel(
    'w1-5',
    'FINISH',
    'sun',
    [2, 10],
    [16, 6],
    [
      { x: 1, y: 10, width: 4, height: 1 },
      { x: 7, y: 7, width: 2, height: 3 },
      { x: 10, y: 4, width: 2, height: 5 },
      { x: 13, y: 7, width: 2, height: 3 },
      { x: 15, y: 7, width: 2, height: 1 },
      { x: 17, y: 5, width: 1, height: 4 },
    ],
  ),
];

export const WORLD_TWO_LEVELS: LevelDefinition[] = [
  createLevel(
    'w2-1',
    'SHIFT',
    'ocean',
    [2, 10],
    [14, 7],
    [
      { x: 1, y: 10, width: 4, height: 1 },
      { x: 6, y: 8, width: 2, height: 2 },
      { x: 9, y: 5, width: 2, height: 5 },
      { x: 12, y: 9, width: 2, height: 1 },
      { x: 16, y: 5, width: 2, height: 2 },
    ],
    {
      hoopMotion: { axis: 'x', amplitude: 26, speed: 1.6 },
    },
  ),
  createLevel(
    'w2-2',
    'LIFT',
    'sun',
    [3, 10],
    [15, 8],
    [
      { x: 1, y: 10, width: 5, height: 1 },
      { x: 7, y: 7, width: 2, height: 3 },
      { x: 10, y: 5, width: 2, height: 2 },
      { x: 12, y: 8, width: 1, height: 2 },
      { x: 17, y: 6, width: 1, height: 3 },
    ],
    {
      hoopMotion: { axis: 'y', amplitude: 24, speed: 1.7, phase: 0.9 },
    },
  ),
  createLevel(
    'w2-3',
    'SLIDE',
    'ocean',
    [16, 4],
    [7, 8],
    [
      { x: 13, y: 5, width: 5, height: 3 },
      { x: 5, y: 6, width: 1, height: 2 },
      { x: 6, y: 8, width: 1, height: 1 },
      { x: 9, y: 7, width: 2, height: 1 },
      { x: 10, y: 9, width: 2, height: 1 },
    ],
    {
      hoopMotion: { axis: 'x', amplitude: 20, speed: 2.1, phase: 0.6 },
    },
  ),
  createLevel(
    'w2-4',
    'ELEVATE',
    'sun',
    [2, 9],
    [13, 6],
    [
      { x: 1, y: 10, width: 4, height: 1 },
      { x: 6, y: 8, width: 2, height: 2 },
      { x: 9, y: 5, width: 1, height: 5 },
      { x: 11, y: 4, width: 1, height: 2 },
      { x: 15, y: 7, width: 2, height: 2 },
      { x: 17, y: 4, width: 1, height: 2 },
    ],
    {
      hoopMotion: { axis: 'y', amplitude: 18, speed: 2, phase: 1.3 },
    },
  ),
  createLevel(
    'w2-5',
    'FINAL',
    'ocean',
    [3, 10],
    [15, 5],
    [
      { x: 1, y: 10, width: 4, height: 1 },
      { x: 5, y: 8, width: 2, height: 2 },
      { x: 8, y: 6, width: 2, height: 3 },
      { x: 11, y: 4, width: 2, height: 2 },
      { x: 14, y: 8, width: 2, height: 1 },
      { x: 17, y: 6, width: 1, height: 3 },
    ],
    {
      hoopMotion: { axis: 'x', amplitude: 28, speed: 2.4, phase: 1.1 },
    },
  ),
];

export const LEVEL_STAGES: LevelStageDefinition[] = [
  {
    id: 'world-1',
    label: 'WORLD 1',
    levels: WORLD_ONE_LEVELS,
  },
  {
    id: 'world-2',
    label: 'WORLD 2',
    levels: WORLD_TWO_LEVELS,
  },
];

export const ALL_HOME_LEVELS = LEVEL_STAGES.flatMap((stage) => stage.levels);

const createObstacle = (column: number, row: number): Rect => ({
  x: column * CELL_SIZE,
  y: row * CELL_SIZE,
  width: CELL_SIZE,
  height: CELL_SIZE,
});

const createHoop = (column: number, row: number): HoopGeometry => {
  const cellLeft = column * CELL_SIZE;
  const cellTop = row * CELL_SIZE;
  const centerX = cellLeft + CELL_SIZE / 2;
  const rimTopY = cellTop + 18;
  const centerY = rimTopY + 10;

  return {
    center: { x: centerX, y: centerY },
    leftRim: {
      x: centerX - 36,
      y: rimTopY,
      width: 10,
      height: 6,
    },
    rightRim: {
      x: centerX + 26,
      y: rimTopY,
      width: 10,
      height: 6,
    },
    backboard: {
      x: centerX + 40,
      y: rimTopY - 20,
      width: 7,
      height: 48,
    },
    sensor: {
      x: centerX - 30,
      y: rimTopY + 6,
      width: 60,
      height: 48,
    },
  };
};

export const parseLevelDefinition = (definition: LevelDefinition): ParsedLevel => {
  if (definition.grid.length !== GRID_HEIGHT || definition.grid.some((row) => row.length !== GRID_WIDTH)) {
    throw new Error(`Level ${definition.id} must use a ${GRID_WIDTH}x${GRID_HEIGHT} grid`);
  }

  let launcher: Point | null = null;
  let hoop: HoopGeometry | null = null;
  const obstacles: Rect[] = [];

  definition.grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell === 1) {
        obstacles.push(createObstacle(columnIndex, rowIndex));
      }

      if (cell === 2) {
        obstacles.push(createObstacle(columnIndex, rowIndex));
        launcher = {
          x: columnIndex * CELL_SIZE + CELL_SIZE / 2,
          y: rowIndex * CELL_SIZE,
        };
      }

      if (cell === 3) {
        hoop = createHoop(columnIndex, rowIndex);
      }
    });
  });

  if (!launcher || !hoop) {
    throw new Error(`Level ${definition.id} must include one launcher (2) and one hoop (3)`);
  }

  return {
    id: definition.id,
    label: definition.label,
    theme: definition.theme,
    width: GRID_WIDTH * CELL_SIZE,
    height: GRID_HEIGHT * CELL_SIZE,
    cellSize: CELL_SIZE,
    launcher,
    obstacles,
    hoop,
    hoopMotion: definition.hoopMotion,
  };
};

const translateRect = (rect: Rect, dx: number, dy: number): Rect => ({
  x: Number((rect.x + dx).toFixed(3)),
  y: Number((rect.y + dy).toFixed(3)),
  width: rect.width,
  height: rect.height,
});

export const resolveLevelHoop = (level: Pick<ParsedLevel, 'hoop' | 'hoopMotion'>, elapsedMs: number): HoopGeometry => {
  if (!level.hoopMotion) {
    return level.hoop;
  }

  const phase = level.hoopMotion.phase ?? 0;
  const offset = Math.sin(elapsedMs / 1000 * level.hoopMotion.speed + phase) * level.hoopMotion.amplitude;
  const dx = level.hoopMotion.axis === 'x' ? offset : 0;
  const dy = level.hoopMotion.axis === 'y' ? offset : 0;

  return {
    center: {
      x: Number((level.hoop.center.x + dx).toFixed(3)),
      y: Number((level.hoop.center.y + dy).toFixed(3)),
    },
    leftRim: translateRect(level.hoop.leftRim, dx, dy),
    rightRim: translateRect(level.hoop.rightRim, dx, dy),
    backboard: translateRect(level.hoop.backboard, dx, dy),
    sensor: translateRect(level.hoop.sensor, dx, dy),
  };
};
