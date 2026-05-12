import type { Tactic } from '../data/nba';

type TacticDiagramProps = {
  tactic: Tactic;
};

const playerDots = {
  horns: [
    [50, 18],
    [36, 38],
    [64, 38],
    [18, 70],
    [82, 70],
  ],
  'pick-roll': [
    [50, 20],
    [50, 38],
    [18, 72],
    [82, 72],
    [70, 40],
  ],
  transition: [
    [50, 14],
    [20, 36],
    [80, 36],
    [50, 58],
    [50, 78],
  ],
  zone: [
    [38, 24],
    [62, 24],
    [22, 58],
    [50, 58],
    [78, 58],
  ],
  baseline: [
    [20, 75],
    [40, 46],
    [60, 46],
    [50, 78],
    [82, 72],
  ],
  motion: [
    [50, 20],
    [30, 42],
    [70, 42],
    [25, 74],
    [75, 74],
  ],
} satisfies Record<Tactic['diagramType'], number[][]>;

export const TacticDiagram = ({ tactic }: TacticDiagramProps) => {
  const dots = playerDots[tactic.diagramType];

  return (
    <svg className="tactic-diagram" viewBox="0 0 100 100" role="img" aria-label={`${tactic.name} 战术图`}>
      <rect x="6" y="8" width="88" height="84" rx="5" />
      <line x1="6" y1="50" x2="94" y2="50" />
      <circle cx="50" cy="50" r="11" />
      <path d="M34 8v20a16 16 0 0 0 32 0V8" />
      <path d="M28 92V72a22 22 0 0 1 44 0v20" />
      <circle cx="50" cy="14" r="3" />
      <circle cx="50" cy="86" r="3" />
      {dots.map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          <circle className="player-dot" cx={x} cy={y} r="4.6" />
          <text x={x} y={y + 1.7}>
            {index + 1}
          </text>
        </g>
      ))}
      <path className="motion-line" d="M50 20 C62 30, 67 38, 74 52" />
      <path className="motion-line" d="M20 72 C32 66, 40 58, 50 48" />
    </svg>
  );
};

