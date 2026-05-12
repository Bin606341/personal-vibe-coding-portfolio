import { describe, expect, test } from 'vitest';
import { HOME_PLAYER_DESIGN } from './HomeScene';

describe('HOME_PLAYER_DESIGN', () => {
  test('captures the chibi number 11 basketball player identity', () => {
    expect(HOME_PLAYER_DESIGN.jerseyNumber).toBe('11');
    expect(HOME_PLAYER_DESIGN.uniform.primary).toBe('#ffffff');
    expect(HOME_PLAYER_DESIGN.uniform.accents).toEqual(['#0b0f19', '#0077c8']);
    expect(HOME_PLAYER_DESIGN.skinTone).toBe('#9b5a3d');
    expect(HOME_PLAYER_DESIGN.hair).toEqual({ color: '#11100f', style: 'short dread clusters' });
    expect(HOME_PLAYER_DESIGN.face).toEqual({
      beard: true,
      sleepyEyes: true,
      thickBrows: true,
    });
    expect(HOME_PLAYER_DESIGN.props).toEqual({
      basketball: true,
      blackShoes: true,
      whiteSleeves: true,
    });
  });
});
