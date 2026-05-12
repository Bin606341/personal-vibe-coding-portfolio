import { useMemo, useState } from 'react';
import { getLegendImageUrl, hallOfFameLegends } from '../data/nba';
import { SectionHeader } from '../components/SectionHeader';

const allOption = '全部';

const unique = (values: string[]) => [allOption, ...Array.from(new Set(values))];

export const HallPage = () => {
  const [era, setEra] = useState(allOption);
  const [position, setPosition] = useState(allOption);
  const [team, setTeam] = useState(allOption);
  const [selectedId, setSelectedId] = useState(hallOfFameLegends[0].id);

  const eras = unique(hallOfFameLegends.map((legend) => legend.era));
  const positions = unique(hallOfFameLegends.map((legend) => legend.position));
  const teams = unique(hallOfFameLegends.map((legend) => legend.team));

  const legends = useMemo(
    () =>
      hallOfFameLegends.filter(
        (legend) =>
          (era === allOption || legend.era === era) &&
          (position === allOption || legend.position === position) &&
          (team === allOption || legend.team === team),
      ),
    [era, position, team],
  );

  const selected = hallOfFameLegends.find((legend) => legend.id === selectedId) ?? legends[0] ?? hallOfFameLegends[0];

  return (
    <div className="content-page">
      <SectionHeader
        eyebrow="LEGENDS WALL"
        title="历史名人堂区"
        description="以传奇球员头像墙为主入口，配合年代、位置、代表球队筛选。"
      />

      <section className="filter-bar" aria-label="名人堂筛选">
        <label>
          按年代筛选
          <select value={era} onChange={(event) => setEra(event.target.value)}>
            {eras.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          按位置筛选
          <select value={position} onChange={(event) => setPosition(event.target.value)}>
            {positions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          按球队筛选
          <select value={team} onChange={(event) => setTeam(event.target.value)}>
            {teams.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>

      <div className="split-layout">
        <section className="legend-wall">
          {legends.map((legend) => (
            <button
              type="button"
              key={legend.id}
              className={`legend-tile${legend.id === selected.id ? ' selected' : ''}`}
              onClick={() => setSelectedId(legend.id)}
            >
              <span className="legend-avatar">
                {getLegendImageUrl(legend.name) ? (
                  <img src={getLegendImageUrl(legend.name)} alt={`${legend.name} headshot`} loading="lazy" />
                ) : (
                  legend.name.slice(0, 2).toUpperCase()
                )}
              </span>
              <strong>{legend.name}</strong>
              <small>
                {legend.era} · {legend.position}
              </small>
            </button>
          ))}
        </section>

        <aside className="detail-panel">
          <span className="eyebrow">{selected.achievementType}</span>
          <h2>{selected.name}</h2>
          <p>{selected.summary}</p>
          <h3>主要成就</h3>
          <ul>
            {selected.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
          <h3>经典时刻</h3>
          <ul>
            {selected.moments.map((moment) => (
              <li key={moment}>{moment}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};
