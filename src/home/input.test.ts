import { describe, expect, test } from 'vitest';
import { buildChargedShotPreview } from './input';

describe('home game shot guide', () => {
  test('draws a short dashed guide with a visible parabolic bend', () => {
    const origin = { x: 176, y: 412 };
    const target = { x: 696, y: 460 };
    const preview = buildChargedShotPreview(origin, target, 800);
    const midPoint = preview[Math.floor(preview.length / 2)];
    const endPoint = preview[preview.length - 1];

    expect(preview.length).toBeGreaterThan(2);
    expect(preview.length).toBeLessThanOrEqual(8);
    expect(midPoint.x).toBeGreaterThan(origin.x);
    expect(midPoint.y).toBeLessThan(origin.y);

    const lineYAtMidPoint =
      origin.y + ((endPoint.y - origin.y) * (midPoint.x - origin.x)) / (endPoint.x - origin.x);

    expect(lineYAtMidPoint - midPoint.y).toBeGreaterThan(10);
  });
});
