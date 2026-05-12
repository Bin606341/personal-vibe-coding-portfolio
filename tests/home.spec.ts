import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

test('home scene renders a nonblank 3D canvas and supports shooting', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /HoopVerse/i })).toBeVisible();
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();
  expect(box?.width).toBeGreaterThan(300);
  expect(box?.height).toBeGreaterThan(300);

  const screenshot = await canvas.screenshot();
  const png = PNG.sync.read(screenshot);
  let visiblePixels = 0;

  for (let index = 0; index < png.data.length; index += 4) {
    const red = png.data[index];
    const green = png.data[index + 1];
    const blue = png.data[index + 2];
    const alpha = png.data[index + 3];
    const isBlankWhite = red > 245 && green > 245 && blue > 245;
    const isBlankBlack = red < 8 && green < 8 && blue < 8;

    if (alpha > 0 && !isBlankWhite && !isBlankBlack) {
      visiblePixels += 1;
    }
  }

  expect(visiblePixels).toBeGreaterThan(500);

  const chargeFill = page.locator('.charge-fill');
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(250);
  const chargedWidth = await chargeFill.evaluate((element) => Number.parseFloat(getComputedStyle(element).width));
  expect(chargedWidth).toBeGreaterThan(0);
  await page.waitForTimeout(560);
  await page.keyboard.up('KeyD');
});

test('top navigation reaches all content sections', async ({ page }) => {
  await page.goto('/');

  const navTargets = [
    ['/players', '[data-testid="team-card"]'],
    ['/hall', '.content-page'],
    ['/training', '.content-page'],
    ['/tactics', '.content-page'],
    ['/clutch', '.content-page'],
  ] as const;

  for (const [path, selector] of navTargets) {
    await page.locator(`.main-nav a[href="${path}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator(selector).first()).toBeVisible();
  }
});

test('players section renders cached team logos and player headshots', async ({ page }) => {
  await page.goto('/players');

  await expect(page.getByTestId('team-card')).toHaveCount(30);

  const loadedLogos = await page.locator('.team-logo img').evaluateAll(
    (images) =>
      images.filter((image) => {
        const img = image as HTMLImageElement;
        return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
      }).length,
  );
  expect(loadedLogos).toBe(30);

  const loadedHeadshots = await page.locator('.player-avatar img').evaluateAll(
    (images) =>
      images.filter((image) => {
        const img = image as HTMLImageElement;
        return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
      }).length,
  );
  expect(loadedHeadshots).toBeGreaterThanOrEqual(12);
});

test('inline media cards stay on page while playing and expanding', async ({ page }) => {
  const pages = ['/training', '/tactics', '/clutch'] as const;

  for (const path of pages) {
    await page.goto(path);
    await expect(page.locator('.content-page')).toBeVisible();

    const card = page.locator('[data-testid="video-resource-card"]').first();
    await expect(card.getByTestId('inline-media')).toBeVisible();

    const startPath = new URL(page.url()).pathname;
    const stageActions = card.locator('.video-actions .video-action');
    if ((await stageActions.count()) > 1) {
      await stageActions.first().click();
      expect(new URL(page.url()).pathname).toBe(startPath);
    }

    await stageActions.last().click();
    await expect(page.locator('[data-testid="video-resource-modal"]')).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(startPath);

    await page.locator('.video-modal-toolbar .video-action').last().click();
    await expect(page.locator('[data-testid="video-resource-modal"]')).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe(startPath);
  }
});

test('all training cards expose playable inline media sources', async ({ page }) => {
  await page.goto('/training');
  await expect(page.locator('[data-testid="drill-card"]')).toHaveCount(3);

  for (const position of ['PG', 'SG', 'SF', 'PF', 'C']) {
    await page.getByRole('tab', { name: position }).click();

    const cards = page.locator('[data-testid="drill-card"]');
    await expect(cards).toHaveCount(3);

    for (let index = 0; index < 3; index += 1) {
      const card = cards.nth(index);
      const video = card.locator('video').first();
      await expect(video).toBeVisible();

      const source = video.locator('source');
      const src = await source.getAttribute('src');
      const type = await source.getAttribute('type');
      const expectedType = src?.endsWith('.ogv') || src?.endsWith('.ogg')
        ? 'video/ogg'
        : src?.endsWith('.mp4')
          ? 'video/mp4'
          : 'video/webm';
      expect(type).toBe(expectedType);

      await video.evaluate((element) => {
        const media = element as HTMLVideoElement;
        media.defaultPlaybackRate = 1.75;
        media.playbackRate = 1.75;
      });

      await card.locator('.video-actions .video-action').first().click();
      await expect.poll(
        () =>
          video.evaluate((element) => {
            const media = element as HTMLVideoElement;
            if (media.error) return -media.error.code;
            return media.readyState;
          }),
        { timeout: 8_000 },
      ).toBeGreaterThanOrEqual(2);

      const playbackState = await video.evaluate((element) => ({
        errorCode: (element as HTMLVideoElement).error?.code ?? null,
        paused: (element as HTMLVideoElement).paused,
        playbackRate: (element as HTMLVideoElement).playbackRate,
        defaultPlaybackRate: (element as HTMLVideoElement).defaultPlaybackRate,
      }));
      expect(playbackState.errorCode).toBeNull();
      expect(playbackState.paused).toBe(false);
      expect(playbackState.playbackRate).toBe(1);
      expect(playbackState.defaultPlaybackRate).toBe(1);
      await video.evaluate((element) => (element as HTMLVideoElement).pause());
    }
  }
});

test('training videos are unique and long enough to show complete teaching actions', async ({ page }) => {
  await page.goto('/training');

  const seenSources = new Set<string>();
  const minimumTeachingSecondsByPosition: Record<string, number> = {
    PG: 10,
    SG: 24,
    SF: 24,
    PF: 24,
    C: 24,
  };

  for (const position of ['PG', 'SG', 'SF', 'PF', 'C']) {
    await page.getByRole('tab', { name: position }).click();

    const videos = page.locator('[data-testid="drill-card"] video');
    await expect(videos).toHaveCount(3);

    for (let index = 0; index < 3; index += 1) {
      const video = videos.nth(index);
      const metadata = await video.evaluate(async (element) => {
        const media = element as HTMLVideoElement;
        if (Number.isFinite(media.duration) && media.duration > 0) {
          return { duration: media.duration, source: media.currentSrc || media.querySelector('source')?.src || '' };
        }

        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('Timed out loading video metadata')), 8_000);
          const cleanup = () => {
            window.clearTimeout(timeout);
            media.removeEventListener('loadedmetadata', onLoaded);
            media.removeEventListener('error', onError);
          };
          const onLoaded = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(media.error ?? new Error('Video metadata failed to load'));
          };

          media.addEventListener('loadedmetadata', onLoaded, { once: true });
          media.addEventListener('error', onError, { once: true });
          media.load();
        });

        return { duration: media.duration, source: media.currentSrc || media.querySelector('source')?.src || '' };
      });

      expect(metadata.source, `${position} drill ${index + 1}`).not.toHaveLength(0);
      expect(seenSources.has(metadata.source), `${position} drill ${index + 1} uses a duplicate video`).toBe(false);
      seenSources.add(metadata.source);
      expect(metadata.duration, `${position} drill ${index + 1} duration`).toBeGreaterThanOrEqual(
        minimumTeachingSecondsByPosition[position],
      );
      expect(metadata.duration, `${position} drill ${index + 1} duration`).toBeLessThanOrEqual(45);
    }
  }

  expect(seenSources.size).toBe(15);
});

test('tactic videos are unique and long enough to show the tactical action', async ({ page }) => {
  await page.goto('/tactics');

  const seenSources = new Set<string>();
  const minimumTacticSecondsByCategory: Record<string, number> = {
    半场进攻: 25,
    挡拆战术: 10,
    快攻转换: 35,
    区域联防: 35,
    关键球战术: 10,
  };

  for (const category of ['半场进攻', '挡拆战术', '快攻转换', '区域联防', '关键球战术']) {
    await page.getByRole('tab', { name: category }).click();

    const cards = page.locator('.tactic-card');
    await expect(cards).toHaveCount(1);

    const video = cards.first().locator('video').first();
    await expect(video).toBeVisible();

    const metadata = await video.evaluate(async (element) => {
      const media = element as HTMLVideoElement;
      if (!(Number.isFinite(media.duration) && media.duration > 0)) {
        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('Timed out loading tactic video metadata')), 8_000);
          const cleanup = () => {
            window.clearTimeout(timeout);
            media.removeEventListener('loadedmetadata', onLoaded);
            media.removeEventListener('error', onError);
          };
          const onLoaded = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(media.error ?? new Error('Tactic video metadata failed to load'));
          };

          media.addEventListener('loadedmetadata', onLoaded, { once: true });
          media.addEventListener('error', onError, { once: true });
          media.load();
        });
      }

      return {
        duration: media.duration,
        source: media.currentSrc || media.querySelector('source')?.src || '',
      };
    });

    expect(metadata.source, `${category} tactic video`).not.toHaveLength(0);
    expect(seenSources.has(metadata.source), `${category} uses a duplicate tactic video`).toBe(false);
    seenSources.add(metadata.source);
    expect(metadata.duration, `${category} tactic video duration`).toBeGreaterThanOrEqual(
      minimumTacticSecondsByCategory[category],
    );
    expect(metadata.duration, `${category} tactic video duration`).toBeLessThanOrEqual(60);
  }

  expect(seenSources.size).toBe(5);
});

test('classic clutch videos are unique and long enough to show the full moment', async ({ page }) => {
  await page.goto('/clutch');

  const seenSources = new Set<string>();
  const players = ['Michael Jordan', 'Kobe Bryant', 'LeBron James', 'Stephen Curry'] as const;

  for (const player of players) {
    await page.locator('.player-switcher').getByRole('button', { name: player }).click();
    const cards = page.locator('.moment-card');
    await expect(cards).toHaveCount(3);

    for (let index = 0; index < 3; index += 1) {
      const card = cards.nth(index);
      const video = card.locator('video').first();
      await expect(video).toBeVisible();

      const metadata = await video.evaluate(async (element) => {
        const media = element as HTMLVideoElement;
        if (!(Number.isFinite(media.duration) && media.duration > 0)) {
          await new Promise<void>((resolve, reject) => {
            const timeout = window.setTimeout(() => reject(new Error('Timed out loading classic video metadata')), 8_000);
            const cleanup = () => {
              window.clearTimeout(timeout);
              media.removeEventListener('loadedmetadata', onLoaded);
              media.removeEventListener('error', onError);
            };
            const onLoaded = () => {
              cleanup();
              resolve();
            };
            const onError = () => {
              cleanup();
              reject(media.error ?? new Error('Classic video metadata failed to load'));
            };

            media.addEventListener('loadedmetadata', onLoaded, { once: true });
            media.addEventListener('error', onError, { once: true });
            media.load();
          });
        }

        return {
          duration: media.duration,
          source: media.currentSrc || media.querySelector('source')?.src || '',
        };
      });

      expect(metadata.source, `${player} moment ${index + 1}`).not.toHaveLength(0);
      expect(seenSources.has(metadata.source), `${player} moment ${index + 1} uses a duplicate video`).toBe(false);
      seenSources.add(metadata.source);
      expect(metadata.duration, `${player} moment ${index + 1} duration`).toBeGreaterThanOrEqual(20);
      expect(metadata.duration, `${player} moment ${index + 1} duration`).toBeLessThanOrEqual(360);
    }
  }

  expect(seenSources.size).toBe(12);
});

test('short training clips keep playing instead of flashing out', async ({ page }) => {
  await page.goto('/training');
  await page.getByRole('tab', { name: 'C' }).click();

  const card = page.locator('[data-testid="drill-card"]').first();
  const video = card.locator('video').first();

  await card.locator('.video-actions .video-action').first().click();
  await page.waitForTimeout(4500);

  await expect.poll(
    () =>
      video.evaluate((element) => ({
        paused: (element as HTMLVideoElement).paused,
        currentTime: (element as HTMLVideoElement).currentTime,
      })),
    { timeout: 8_000 },
  ).toMatchObject({ paused: false });
});
