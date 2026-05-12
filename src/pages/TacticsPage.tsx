import { useState } from 'react';
import { tacticCategories } from '../data/nba';
import { SectionHeader } from '../components/SectionHeader';
import { TacticDiagram } from '../components/TacticDiagram';
import { VideoResourceCard } from '../components/VideoResourceCard';

export const TacticsPage = () => {
  const [activeCategoryId, setActiveCategoryId] = useState(tacticCategories[0].id);
  const activeCategory = tacticCategories.find((category) => category.id === activeCategoryId) ?? tacticCategories[0];

  return (
    <div className="content-page">
      <SectionHeader
        eyebrow="TACTIC BOARD"
        title="战术区"
        description="用战术图、跑位说明和视频占位把全场战术拆成更容易理解的学习卡。"
      />

      <div className="segmented-control tactic-tabs" role="tablist" aria-label="战术分类">
        {tacticCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategory.id === category.id}
            className={activeCategory.id === category.id ? 'active' : ''}
            onClick={() => setActiveCategoryId(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <section className="tactic-category-intro">
        <h2>{activeCategory.name}</h2>
        <p>{activeCategory.description}</p>
      </section>

      <section className="card-grid tactic-grid">
        {activeCategory.tactics.map((tactic) => (
          <article className="info-card tactic-card" key={tactic.id}>
            <TacticDiagram tactic={tactic} />
            <div>
              <span className="eyebrow">{tactic.situation}</span>
              <h2>{tactic.name}</h2>
              <p>{tactic.spacing}</p>
              <p>{tactic.movement}</p>
              <div className="tag-row">
                {tactic.keys.map((key) => (
                  <span key={key}>{key}</span>
                ))}
              </div>
              <VideoResourceCard video={tactic.video} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
