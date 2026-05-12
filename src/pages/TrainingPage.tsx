import { useState } from 'react';
import { trainingByPosition, type TrainingPosition } from '../data/nba';
import { SectionHeader } from '../components/SectionHeader';
import { VideoResourceCard } from '../components/VideoResourceCard';

const positions: TrainingPosition[] = ['PG', 'SG', 'SF', 'PF', 'C'];

export const TrainingPage = () => {
  const [activePosition, setActivePosition] = useState<TrainingPosition>('PG');
  const drills = trainingByPosition[activePosition];

  return (
    <div className="content-page">
      <SectionHeader
        eyebrow="SKILL LAB"
        title="教学区"
        description="按五大位置切换基础动作卡，每张卡包含适用场景、步骤、关键点和常见错误。"
      />

      <div className="segmented-control" role="tablist" aria-label="位置切换">
        {positions.map((position) => (
          <button
            key={position}
            type="button"
            role="tab"
            aria-selected={activePosition === position}
            className={activePosition === position ? 'active' : ''}
            onClick={() => setActivePosition(position)}
          >
            {position}
          </button>
        ))}
      </div>

      <section className="card-grid">
        {drills.map((drill) => (
          <article className="info-card drill-card" data-testid="drill-card" key={drill.name}>
            <span className="eyebrow">{activePosition} TRAINING</span>
            <h2>{drill.name}</h2>
            <p>{drill.useCase}</p>
            <VideoResourceCard video={drill.video} />
            <h3>动作步骤</h3>
            <ol>
              {drill.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <h3>关键要点</h3>
            <div className="tag-row">
              {drill.keyPoints.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
            <h3>常见错误</h3>
            <ul>
              {drill.mistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
};
