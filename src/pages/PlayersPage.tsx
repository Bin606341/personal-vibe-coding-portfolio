import { useMemo, useState, type CSSProperties } from 'react';
import { dataSourceNote, getTeamLogoUrl, nbaTeams } from '../data/nba';
import { SectionHeader } from '../components/SectionHeader';

export const PlayersPage = () => {
  const [selectedTeamId, setSelectedTeamId] = useState(nbaTeams[0].id);
  const selectedTeam = useMemo(
    () => nbaTeams.find((team) => team.id === selectedTeamId) ?? nbaTeams[0],
    [selectedTeamId],
  );

  return (
    <div className="content-page">
      <SectionHeader
        eyebrow="CURRENT NBA"
        title="现役球员区"
        description="30 支 NBA 球队完整入口，队徽和球员头像来自 NBA CDN 本地缓存，球员资料使用 NBA.com League Roster 静态数据。"
      />

      <p className="source-note">{dataSourceNote}</p>

      <section className="team-grid-section">
        <div className="section-title-row">
          <h2>30 支 NBA 球队</h2>
          <span>{nbaTeams.length} teams</span>
        </div>
        <div className="team-grid">
          {nbaTeams.map((team) => (
            <button
              key={team.id}
              data-testid="team-card"
              type="button"
              className={`team-card${team.id === selectedTeam.id ? ' selected' : ''}`}
              onClick={() => setSelectedTeamId(team.id)}
              style={
                {
                  '--team-a': team.colors[0],
                  '--team-b': team.colors[1],
                } as CSSProperties
              }
            >
              <span className="team-logo">
                <img src={getTeamLogoUrl(team.id)} alt={`${team.name} logo`} loading="lazy" />
              </span>
              <strong>{team.nameCn}</strong>
              <small>{team.name}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="roster-panel">
        <div className="roster-heading">
          <div>
            <span className="eyebrow">{selectedTeam.conference} Conference</span>
            <h2>{selectedTeam.nameCn}</h2>
            <p>
              {selectedTeam.city} · {selectedTeam.name}
            </p>
          </div>
          <span className="team-badge">{selectedTeam.abbreviation}</span>
        </div>

        <div className="player-grid">
          {selectedTeam.players.map((player) => (
            <article className="player-card" key={player.name}>
              <div className="player-avatar">
                {player.imageUrl ? (
                  <img src={player.imageUrl} alt={`${player.name} headshot`} loading="lazy" />
                ) : (
                  player.number
                )}
              </div>
              <div>
                <h3>{player.nameCn}</h3>
                <p>{player.name}</p>
              </div>
              <dl className="player-meta">
                <div>
                  <dt>位置</dt>
                  <dd>{player.position}</dd>
                </div>
                <div>
                  <dt>号码</dt>
                  <dd>{player.number}</dd>
                </div>
                <div>
                  <dt>经验</dt>
                  <dd>{player.experience}</dd>
                </div>
                <div>
                  <dt>身高</dt>
                  <dd>{player.height}</dd>
                </div>
                <div>
                  <dt>体重</dt>
                  <dd>{player.weight}</dd>
                </div>
                <div>
                  <dt>来源</dt>
                  <dd>{player.origin}</dd>
                </div>
              </dl>
              <p className="card-copy">{player.bio}</p>
              <p className="stat-line">{player.stats}</p>
              {player.sourceUrl ? (
                <a className="source-link" href={player.sourceUrl} target="_blank" rel="noreferrer">
                  NBA.com 球员页
                </a>
              ) : null}
              <div className="tag-row">
                {player.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
