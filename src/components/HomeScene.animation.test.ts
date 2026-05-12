import { describe, expect, test } from 'vitest';
import { getHomePlayerMotion, HOME_PLAYER_ANIMATION } from './HomeScene';

describe('home player basketball motion', () => {
  test('uses a coordinated right-hand dribble with body compression at the low bounce', () => {
    expect(HOME_PLAYER_ANIMATION.dribble.dominantHand).toBe('right');
    expect(HOME_PLAYER_ANIMATION.dribble.bodyDrop).toBeGreaterThan(0.05);
    expect(HOME_PLAYER_ANIMATION.dribble.shoulderLean).toBeGreaterThan(0.04);

    const lowBounce = getHomePlayerMotion({
      elapsed: 0,
      isMoving: false,
      charging: false,
      shooting: false,
      chargeMs: 0,
      shotProgress: 0,
    });
    const highBounce = getHomePlayerMotion({
      elapsed: Math.PI / HOME_PLAYER_ANIMATION.dribble.speed,
      isMoving: false,
      charging: false,
      shooting: false,
      chargeMs: 0,
      shotProgress: 0,
    });

    expect(lowBounce.ballOffset.y).toBeLessThan(highBounce.ballOffset.y);
    expect(lowBounce.rig.y).toBeLessThan(highBounce.rig.y);
    expect(lowBounce.rightArm.x).toBeLessThan(highBounce.rightArm.x);
    expect(lowBounce.leftArm.z).toBeGreaterThan(0);
    expect(lowBounce.rightArm.z).toBeLessThan(0);
  });

  test('turns a charged shot into a set point and then an overhead follow-through', () => {
    const setPoint = getHomePlayerMotion({
      elapsed: 1,
      isMoving: false,
      charging: true,
      shooting: false,
      chargeMs: HOME_PLAYER_ANIMATION.shot.setPointMs,
      shotProgress: 0,
    });
    const followThrough = getHomePlayerMotion({
      elapsed: 1.2,
      isMoving: false,
      charging: false,
      shooting: true,
      chargeMs: 0,
      shotProgress: 0.72,
    });

    expect(setPoint.ballOffset.y).toBeGreaterThan(1.55);
    expect(setPoint.ballOffset.z).toBeGreaterThan(0.26);
    expect(setPoint.rig.y).toBeLessThan(0);
    expect(followThrough.ballOffset.y).toBeGreaterThan(setPoint.ballOffset.y);
    expect(followThrough.rightArm.x).toBeLessThan(setPoint.rightArm.x);
    expect(followThrough.leftLeg.x).toBeLessThan(0);
    expect(followThrough.rightLeg.x).toBeLessThan(0);
  });

  test('adds counter-rotation and opposite leg stride while moving', () => {
    const moving = getHomePlayerMotion({
      elapsed: 0.2,
      isMoving: true,
      charging: false,
      shooting: false,
      chargeMs: 0,
      shotProgress: 0,
    });

    expect(Math.sign(moving.leftLeg.x)).toBe(-Math.sign(moving.rightLeg.x));
    expect(Math.abs(moving.rig.x)).toBeGreaterThan(0.015);
    expect(Math.abs(moving.rig.z)).toBeGreaterThan(0.02);
  });
});
