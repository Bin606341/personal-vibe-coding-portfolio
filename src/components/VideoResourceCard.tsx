import { useEffect, useRef, useState, type RefObject, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Pause, Play, X } from 'lucide-react';
import type { VideoResource } from '../data/nba';

type VideoResourceCardProps = {
  video: VideoResource;
};

const getVideoSourceType = (localUrl: string) => {
  const path = localUrl.split(/[?#]/)[0].toLowerCase();

  if (path.endsWith('.ogv') || path.endsWith('.ogg')) return 'video/ogg';
  if (path.endsWith('.mp4')) return 'video/mp4';
  return 'video/webm';
};

export const VideoResourceCard = ({ video }: VideoResourceCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inlineRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLVideoElement>(null);

  const isGif = video.mediaType === 'gif';
  const activeRef = isExpanded ? modalRef : inlineRef;

  const forceNormalPlaybackSpeed = (media: HTMLVideoElement) => {
    if (media.defaultPlaybackRate !== 1) {
      media.defaultPlaybackRate = 1;
    }

    if (media.playbackRate !== 1) {
      media.playbackRate = 1;
    }
  };

  useEffect(() => {
    if (!isExpanded) {
      modalRef.current?.pause();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsExpanded(false);
        setIsPlaying(false);
        modalRef.current?.pause();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  const handlePlay = async () => {
    const media = activeRef.current;
    if (!media) return;

    forceNormalPlaybackSpeed(media);
    setIsPlaying(true);

    try {
      await media.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    const media = activeRef.current;
    if (!media) return;

    media.pause();
    setIsPlaying(false);
  };

  const handleTogglePlayback = () => {
    if (isPlaying) {
      handlePause();
      return;
    }

    void handlePlay();
  };

  const handleOpenExpanded = () => {
    inlineRef.current?.pause();
    modalRef.current?.pause();
    setIsPlaying(false);
    setIsExpanded(true);
  };

  const handleCloseExpanded = () => {
    inlineRef.current?.pause();
    modalRef.current?.pause();
    setIsPlaying(false);
    setIsExpanded(false);
  };

  const renderMedia = (ref: RefObject<HTMLVideoElement>, testId: string) => {
    if (isGif) {
      return (
        <img
          className="video-media"
          data-testid={testId}
          src={video.localUrl}
          alt={video.label}
          loading="lazy"
        />
      );
    }

    return (
      <video
        ref={ref}
        className="video-media"
        data-testid={testId}
        poster={video.posterUrl}
        preload="metadata"
        playsInline
        loop
        onLoadedMetadata={(event) => forceNormalPlaybackSpeed(event.currentTarget)}
        onRateChange={(event) => forceNormalPlaybackSpeed(event.currentTarget)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={video.localUrl} type={getVideoSourceType(video.localUrl)} />
      </video>
    );
  };

  const modalRoot = typeof document === 'undefined' ? null : document.body;

  return (
    <>
      <figure className="video-resource" data-testid="video-resource-card">
        <div className="video-stage">
          {renderMedia(inlineRef, 'inline-media')}
          <div className="video-actions">
            {!isGif ? (
              <button
                type="button"
                className="video-action"
                aria-label={isPlaying ? '暂停视频' : '播放视频'}
                onClick={handleTogglePlayback}
              >
                {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              </button>
            ) : null}
            <button
              type="button"
              className="video-action"
              aria-label="放大视频"
              aria-expanded={isExpanded}
              onClick={handleOpenExpanded}
            >
              <Maximize2 size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <figcaption className="video-caption">
          <div className="video-caption-body">
            <strong>{video.label}</strong>
            <span>{video.sourceName}</span>
          </div>
        </figcaption>
      </figure>

      {isExpanded && modalRoot
        ? createPortal(
            <div
              className="video-modal"
              data-testid="video-resource-modal"
              role="dialog"
              aria-modal="true"
              aria-label={video.label}
              onClick={handleCloseExpanded}
            >
              <div className="video-modal-panel" onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
                <div className="video-modal-player">{renderMedia(modalRef, 'modal-media')}</div>
                <div className="video-modal-toolbar">
                  {!isGif ? (
                    <button
                      type="button"
                      className="video-action"
                      aria-label={isPlaying ? '暂停视频' : '播放视频'}
                      onClick={handleTogglePlayback}
                    >
                      {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="video-action"
                    aria-label="关闭放大视图"
                    onClick={handleCloseExpanded}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>,
            modalRoot,
          )
        : null}
    </>
  );
};
