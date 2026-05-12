import { useMemo, useState } from 'react';
import { classicPlayers, getLegendImageUrl } from '../data/nba';
import { SectionHeader } from '../components/SectionHeader';
import { VideoResourceCard } from '../components/VideoResourceCard';

const allOption = '全部';

export const ClutchPage = () => {
  const [activePlayerId, setActivePlayerId] = useState(classicPlayers[0].id);
  const [stage, setStage] = useState(allOption);
  const activePlayer = classicPlayers.find((player) => player.id === activePlayerId) ?? classicPlayers[0];
  const stages = [allOption, ...Array.from(new Set(activePlayer.moments.map((moment) => moment.stage)))];

  const moments = useMemo(
    () => activePlayer.moments.filter((moment) => stage === allOption || moment.stage === stage),
    [activePlayer, stage],
  );

  return (
    <div className="content-page">
      <SectionHeader
        eyebrow="CLUTCH ARCHIVE"
        title="历史经典绝杀区"
        description="以球星为主入口，结合比赛阶段筛选，回顾 NBA 历史里的关键一击。"
      />

      <section className="player-switcher" aria-label="绝杀球星选择">
        {classicPlayers.map((player) => (
          <button
            key={player.id}
            type="button"
            className={player.id === activePlayer.id ? 'active' : ''}
            onClick={() => {
              setActivePlayerId(player.id);
              setStage(allOption);
            }}
          >
            {getLegendImageUrl(player.name) ? (
              <img src={getLegendImageUrl(player.name)} alt={`${player.name} headshot`} loading="lazy" />
            ) : null}
            {player.name}
          </button>
        ))}
      </section>

      <section className="filter-bar compact">
        <label>
          比赛阶段
          <select value={stage} onChange={(event) => setStage(event.target.value)}>
            {stages.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <span>
          {activePlayer.team} · {activePlayer.era}
        </span>
      </section>

      <section className="card-grid">
        {moments.map((moment) => (
          <article className="info-card moment-card" key={moment.title}>
            <span className="eyebrow">{moment.stage}</span>
            <h2>{moment.title}</h2>
            <dl className="moment-meta">
              <div>
                <dt>日期</dt>
                <dd>{moment.date}</dd>
              </div>
              <div>
                <dt>对阵</dt>
                <dd>{moment.matchup}</dd>
              </div>
              <div>
                <dt>类型</dt>
                <dd>{moment.type}</dd>
              </div>
            </dl>
            <p>{moment.description}</p>
            <p>{moment.meaning}</p>
            <VideoResourceCard video={moment.video} />
          </article>
        ))}
      </section>
    </div>
  );
};
