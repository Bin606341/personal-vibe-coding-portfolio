import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoResourceCard } from './VideoResourceCard';

const video = {
  label: '变向运球突破',
  sourceName: 'Wikimedia Commons dribbling clip',
  url: 'https://commons.wikimedia.org/wiki/File:Basketball-Basic_Types_of_Dribbling.webm',
  localUrl: '/media/dribble.webm',
  posterUrl: '/media/dribble.jpg',
  mediaType: 'video' as const,
};

describe('VideoResourceCard', () => {
  const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play');
  const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause');

  beforeEach(() => {
    playSpy.mockResolvedValue(undefined);
    pauseSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('plays inline, opens a modal, and closes it again', async () => {
    const user = userEvent.setup();
    render(<VideoResourceCard video={video} />);

    expect(screen.getByTestId('inline-media')).toHaveAttribute('poster', '/media/dribble.jpg');
    expect(screen.getByText('Wikimedia Commons dribbling clip')).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: '播放视频' }));
    });
    await waitFor(() => expect(playSpy).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: '暂停视频' })).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: '放大视频' }));
    });
    expect(screen.getByRole('dialog', { name: '变向运球突破' })).toBeInTheDocument();
    expect(screen.getByTestId('modal-media')).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: '关闭放大视图' }));
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(pauseSpy).toHaveBeenCalled());
  });

  it('uses the correct source MIME type for ogv videos', () => {
    render(
      <VideoResourceCard
        video={{
          ...video,
          localUrl: '/media/shot-s002-hook-two-leg.ogv',
          posterUrl: '/media/shot-s002-hook-two-leg.jpg',
        }}
      />,
    );

    expect(screen.getByTestId('inline-media').querySelector('source')).toHaveAttribute('type', 'video/ogg');
  });

  it('loops video clips so short training demos do not flash and stop', () => {
    render(<VideoResourceCard video={video} />);

    expect(screen.getByTestId('inline-media')).toHaveAttribute('loop');
  });

  it('forces inline playback back to normal speed before playing', async () => {
    const user = userEvent.setup();
    render(<VideoResourceCard video={video} />);

    const media = screen.getByTestId('inline-media') as HTMLVideoElement;
    media.playbackRate = 1.75;
    media.defaultPlaybackRate = 1.5;

    await act(async () => {
      await user.click(screen.getByRole('button', { name: '播放视频' }));
    });

    expect(media.playbackRate).toBe(1);
    expect(media.defaultPlaybackRate).toBe(1);
  });
});
