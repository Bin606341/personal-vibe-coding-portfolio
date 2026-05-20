import { describe, expect, test } from 'vitest';
import {
  buildChargedShotPreview,
  calculateChargePercent,
  getLauncherChargePose,
  toChargedLaunchVelocity,
} from '../home/input';

describe('home game charge helpers', () => {
  test('maps hold duration into a capped charge percent', () => {
    expect(calculateChargePercent(0)).toBe(0);
    expect(calculateChargePercent(600)).toBe(50);
    expect(calculateChargePercent(1200)).toBe(100);
    expect(calculateChargePercent(1600)).toBe(100);
  });

  test('turns charged release into a fixed shot direction with variable power', () => {
    const origin = { x: 96, y: 240 };
    const target = { x: 640, y: 180 };
    const tap = toChargedLaunchVelocity(origin, target, 40);
    const short = toChargedLaunchVelocity(origin, target, 240);
    const medium = toChargedLaunchVelocity(origin, target, 600);
    const full = toChargedLaunchVelocity(origin, target, 1200);
    const tapSpeed = Math.hypot(tap.x, tap.y);
    const shortSpeed = Math.hypot(short.x, short.y);
    const mediumSpeed = Math.hypot(medium.x, medium.y);
    const fullSpeed = Math.hypot(full.x, full.y);

    expect(tap.x).toBeGreaterThan(0);
    expect(tap.y).toBeLessThan(0);
    expect(shortSpeed).toBeGreaterThan(tapSpeed);
    expect(mediumSpeed).toBeGreaterThan(shortSpeed * 1.45);
    expect(fullSpeed).toBeGreaterThan(shortSpeed);
    expect(full.x / fullSpeed).toBeCloseTo(short.x / shortSpeed, 3);
    expect(full.y / fullSpeed).toBeCloseTo(short.y / shortSpeed, 3);
  });

  test('builds a short dashed shot guide in the same direction as the release', () => {
    const origin = { x: 96, y: 240 };
    const target = { x: 640, y: 180 };
    const preview = buildChargedShotPreview(origin, target, 840);
    const lastPoint = preview[preview.length - 1];
    const velocity = toChargedLaunchVelocity(origin, target, 840);

    expect(preview.length).toBeGreaterThan(2);
    expect(preview.length).toBeLessThanOrEqual(8);
    expect(lastPoint).toBeDefined();
    expect(lastPoint?.x).toBeGreaterThan(origin.x);
    expect(lastPoint?.y).toBeLessThan(origin.y);
    expect(Math.sign((lastPoint?.x ?? origin.x) - origin.x)).toBe(Math.sign(velocity.x));
    expect(Math.sign((lastPoint?.y ?? origin.y) - origin.y)).toBe(Math.sign(velocity.y));
  });

  test('adds squash and lift feedback from charge instead of pointer drag', () => {
    const resting = getLauncherChargePose(0);
    const charged = getLauncherChargePose(900);

    expect(charged.scaleX).toBeGreaterThan(resting.scaleX);
    expect(charged.scaleY).toBeLessThan(resting.scaleY);
    expect(charged.lift).toBeGreaterThan(resting.lift);
  });
});
