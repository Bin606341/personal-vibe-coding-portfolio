import { describe, expect, it } from 'vitest';
import {
  classicPlayers,
  dataSourceNote,
  hallOfFameLegends,
  nbaTeams,
  tacticCategories,
  trainingByPosition,
} from './nba';

describe('NBA MVP data coverage', () => {
  it('contains all 30 NBA teams', () => {
    expect(nbaTeams).toHaveLength(30);
    expect(new Set(nbaTeams.map((team) => team.id)).size).toBe(30);
  });

  it('gives every team roster players with local media metadata', () => {
    nbaTeams.forEach((team) => {
      expect(team.players.length, team.name).toBeGreaterThanOrEqual(12);
      team.players.forEach((player) => {
        expect(player.height, player.name).not.toMatch(/待接入|样例/i);
        expect(player.weight, player.name).not.toMatch(/待接入|样例/i);
        expect(player.imageUrl, player.name).toMatch(/^\/nba\/headshots\/\d+\.png$/);
      });
    });
    expect(dataSourceNote).toMatch(/NBA\.com League Roster/i);
  });

  it('contains five training positions with at least three local-media drills each', () => {
    expect(Object.keys(trainingByPosition)).toEqual(['PG', 'SG', 'SF', 'PF', 'C']);

    Object.values(trainingByPosition).forEach((drills) => {
      expect(drills.length).toBeGreaterThanOrEqual(3);
      drills.forEach((drill) => {
        expect(drill.video.url, drill.name).toMatch(/^https:\/\//i);
        expect(drill.video.localUrl, drill.name).toMatch(/^\/media\/.+\.(webm|ogv|mp4|gif)$/i);
        expect(drill.video.posterUrl, drill.name).toMatch(/^\/media\/.+\.(jpg|jpeg|png|gif)$/i);
        expect(['video', 'gif']).toContain(drill.video.mediaType);
        expect(drill.video.sourceName, drill.name).not.toHaveLength(0);
      });
    });
  });

  it('uses a unique training media asset for every position drill', () => {
    const trainingMediaUrls = Object.values(trainingByPosition).flatMap((drills) =>
      drills.map((drill) => drill.video.localUrl),
    );

    expect(trainingMediaUrls).toHaveLength(15);
    expect(new Set(trainingMediaUrls).size).toBe(trainingMediaUrls.length);
  });

  it('contains representative Hall of Fame, tactic, and classic winner content with local playback sources', () => {
    expect(hallOfFameLegends.length).toBeGreaterThanOrEqual(8);
    expect(tacticCategories.length).toBeGreaterThanOrEqual(4);
    expect(classicPlayers.length).toBeGreaterThanOrEqual(4);

    tacticCategories.forEach((category) => {
      category.tactics.forEach((tactic) => {
        expect(tactic.video.url, tactic.name).toMatch(/^https:\/\//i);
        expect(tactic.video.localUrl, tactic.name).toMatch(/^\/media\/.+\.(webm|ogv|mp4|gif)$/i);
        expect(tactic.video.posterUrl, tactic.name).toMatch(/^\/media\/.+\.(jpg|jpeg|png|gif)$/i);
        expect(['video', 'gif']).toContain(tactic.video.mediaType);
        expect(tactic.video.sourceName, tactic.name).not.toHaveLength(0);
      });
    });

    classicPlayers.forEach((player) => {
      expect(player.moments.length, player.name).toBeGreaterThanOrEqual(3);
      player.moments.forEach((moment) => {
        expect(moment.video.url, moment.title).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/i);
        expect(moment.video.localUrl, moment.title).toMatch(/^\/media\/.+\.(webm|ogv|mp4|gif)$/i);
        expect(moment.video.posterUrl, moment.title).toMatch(/^\/media\/.+\.(jpg|jpeg|png|gif)$/i);
        expect(moment.video.mediaType).toBe('video');
        expect(moment.video.sourceName, moment.title).not.toHaveLength(0);
      });
    });
  });

  it('keeps training, tactics, and classic media pools distinct', () => {
    const trainingUrls = new Set(Object.values(trainingByPosition).flatMap((drills) => drills.map((drill) => drill.video.localUrl)));
    const tacticUrls = new Set(tacticCategories.flatMap((category) => category.tactics.map((tactic) => tactic.video.localUrl)));
    const classicUrls = new Set(classicPlayers.flatMap((player) => player.moments.map((moment) => moment.video.localUrl)));

    expect([...trainingUrls].some((url) => tacticUrls.has(url))).toBe(false);
    expect([...trainingUrls].some((url) => classicUrls.has(url))).toBe(false);
    expect([...tacticUrls].some((url) => classicUrls.has(url))).toBe(false);
  });

  it('uses a unique tactic media asset for each tactic card', () => {
    const tacticUrls = tacticCategories.flatMap((category) => category.tactics.map((tactic) => tactic.video.localUrl));

    expect(tacticUrls).toHaveLength(5);
    expect(new Set(tacticUrls).size).toBe(tacticUrls.length);
  });
});
