import { useEffect, useMemo, useRef, useState } from 'react';
import { Home, Menu, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  MAX_CHARGE_MS,
  buildChargedShotPreview,
  calculateChargePercent,
  getLauncherChargePose,
  toChargedLaunchVelocity,
} from '../home/input';
import {
  ALL_HOME_LEVELS,
  LEVEL_STAGES,
  parseLevelDefinition,
  resolveLevelHoop,
  type LevelTheme,
  type ParsedLevel,
  type Point,
} from '../home/levels';
import { createConfetti, stepConfetti, type ConfettiParticle } from '../home/particles';
import { createBall, stepBall, type BallState } from '../home/physics';

type AudioCue = 'charge' | 'bounce' | 'score' | 'confetti' | 'reset';

type ThemePalette = {
  background: string;
  grid: string;
  palm: string;
  wallStripe: string;
  wallTile: string;
  wallTileStroke: string;
  hoop: string;
};

const AUTO_ADVANCE_MS = 1300;
const palettes: Record<LevelTheme, ThemePalette> = {
  ocean: {
    background: '#4ec2f4',
    grid: 'rgba(255,255,255,0.42)',
    palm: '#a6f2ff',
    wallStripe: '#ff9bd7',
    wallTile: '#74ef3a',
    wallTileStroke: '#0c2310',
    hoop: '#d81b60',
  },
  sun: {
    background: '#ffe128',
    grid: 'rgba(255,255,255,0.46)',
    palm: '#91f0ff',
    wallStripe: '#71c9ff',
    wallTile: '#ffa400',
    wallTileStroke: '#4f2b00',
    hoop: '#f02758',
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createAudioPlayer = () => {
  let context: AudioContext | null = null;

  const getContext = () => {
    if (typeof window === 'undefined') return null;
    if (context) return context;

    const AudioContextCtor =
      window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;

    context = new AudioContextCtor();
    return context;
  };

  const play = (cue: AudioCue) => {
    const audio = getContext();
    if (!audio) return;

    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.connect(gain);
    gain.connect(audio.destination);

    if (cue === 'charge') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.02, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      oscillator.start(now);
      oscillator.stop(now + 0.18);
      return;
    }

    if (cue === 'bounce') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.08);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.12);
      return;
    }

    if (cue === 'score') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(760, now);
      oscillator.frequency.exponentialRampToValueAtTime(1020, now + 0.14);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.22);
      return;
    }

    if (cue === 'confetti') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(520, now);
      oscillator.frequency.linearRampToValueAtTime(900, now + 0.08);
      oscillator.frequency.linearRampToValueAtTime(680, now + 0.18);
      gain.gain.setValueAtTime(0.026, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      oscillator.start(now);
      oscillator.stop(now + 0.24);
      return;
    }

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(230, now);
    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.1);
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    oscillator.start(now);
    oscillator.stop(now + 0.14);
  };

  const dispose = () => {
    void context?.close();
    context = null;
  };

  return { play, dispose };
};

const readPointer = (event: React.PointerEvent<HTMLElement>, level: ParsedLevel): Point => {
  const rect = event.currentTarget.getBoundingClientRect();
  const scaleX = rect.width / level.width;
  const scaleY = rect.height / level.height;

  return {
    x: clamp((event.clientX - rect.left) / scaleX, 0, level.width),
    y: clamp((event.clientY - rect.top) / scaleY, 0, level.height),
  };
};

const createLaunchOrigin = (shooterPosition: Point, heldMs: number): Point => {
  const pose = getLauncherChargePose(heldMs);
  return {
    x: shooterPosition.x + 8,
    y: shooterPosition.y - 46 - pose.lift * 0.45,
  };
};

const createPalmSilhouettes = (level: ParsedLevel, palette: ThemePalette) => (
  <g opacity="0.2">
    {[300, 520, 710].map((x, index) => (
      <g key={x} transform={`translate(${x} ${level.height - 36 + (index % 2) * 10})`}>
        <rect x="-5" y="-110" width="10" height="116" rx="5" fill={palette.palm} />
        <path d="M -34 -106 Q 0 -150 34 -106" fill="none" stroke={palette.palm} strokeWidth="10" strokeLinecap="round" />
        <path d="M -30 -78 Q 0 -120 30 -78" fill="none" stroke={palette.palm} strokeWidth="10" strokeLinecap="round" />
      </g>
    ))}
  </g>
);

const getStageProgress = (cursor: number) => {
  let remaining = cursor;

  for (let stageIndex = 0; stageIndex < LEVEL_STAGES.length; stageIndex += 1) {
    const stage = LEVEL_STAGES[stageIndex];
    if (remaining < stage.levels.length) {
      return {
        stage,
        stageIndex,
        levelIndex: remaining,
      };
    }

    remaining -= stage.levels.length;
  }

  return {
    stage: LEVEL_STAGES[0],
    stageIndex: 0,
    levelIndex: 0,
  };
};

const renderBasketball = (ball: Pick<BallState, 'radius'>, fill = '#5ca4ff') => (
  <>
    <circle r={ball.radius} fill={fill} stroke="#05070b" strokeWidth="4" />
    <path d={`M 0 ${-ball.radius} L 0 ${ball.radius}`} stroke="#05070b" strokeWidth="3" />
    <path d={`M ${-ball.radius} 0 L ${ball.radius} 0`} stroke="#05070b" strokeWidth="3" />
    <path
      d={`M ${-ball.radius * 0.62} ${-ball.radius} Q ${-ball.radius * 1.06} 0 ${-ball.radius * 0.62} ${ball.radius}`}
      stroke="#05070b"
      strokeWidth="3"
      fill="none"
    />
    <path
      d={`M ${ball.radius * 0.62} ${-ball.radius} Q ${ball.radius * 1.06} 0 ${ball.radius * 0.62} ${ball.radius}`}
      stroke="#05070b"
      strokeWidth="3"
      fill="none"
    />
  </>
);

export const HomeScene = () => {
  const navigate = useNavigate();
  const audioRef = useRef(createAudioPlayer());
  const aimPointRef = useRef<Point>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const ballRef = useRef<BallState | null>(null);
  const chargeStartedAtRef = useRef<number | null>(null);
  const chargingRef = useRef(false);
  const completeTextRef = useRef('');
  const completeTimeoutRef = useRef<number | null>(null);
  const lastBounceAtRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const sfxEnabledRef = useRef(true);

  const [announceScore, setAnnounceScore] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [ball, setBall] = useState<BallState | null>(null);
  const [chargeMs, setChargeMs] = useState(0);
  const [completeText, setCompleteText] = useState('');
  const [isCharging, setIsCharging] = useState(false);
  const [levelAnimationMs, setLevelAnimationMs] = useState(0);
  const [levelCursor, setLevelCursor] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(true);
  const [statusText, setStatusText] = useState('Click anywhere to charge. Move the mouse to aim, then release.');

  const { stage, levelIndex } = useMemo(() => getStageProgress(levelCursor), [levelCursor]);
  const level = useMemo(() => parseLevelDefinition(stage.levels[levelIndex]), [levelIndex, stage.levels]);
  const renderedHoop = useMemo(() => resolveLevelHoop(level, levelAnimationMs), [level, levelAnimationMs]);
  const activeLevel = useMemo(() => ({ ...level, hoop: renderedHoop }), [level, renderedHoop]);
  const [aimPoint, setAimPoint] = useState<Point>({ x: activeLevel.hoop.center.x, y: activeLevel.hoop.center.y });
  const palette = palettes[level.theme];
  const chargePercent = calculateChargePercent(chargeMs);
  const chargePose = getLauncherChargePose(isCharging ? chargeMs : 0);
  const audioEnabled = sfxEnabled || musicEnabled;
  const shooterPosition = useMemo(
    () => ({
      x: level.launcher.x,
      y: level.launcher.y - 22,
    }),
    [level.launcher.x, level.launcher.y],
  );
  const launchOrigin = useMemo(
    () => createLaunchOrigin(shooterPosition, isCharging ? chargeMs : 0),
    [chargeMs, isCharging, shooterPosition],
  );
  const shotPreview = useMemo(
    () =>
      !ball && !completeText
        ? buildChargedShotPreview(launchOrigin, aimPoint, chargeMs)
        : [],
    [aimPoint, ball, chargeMs, completeText, launchOrigin],
  );
  const rimCenterX = useMemo(
    () => (activeLevel.hoop.leftRim.x + activeLevel.hoop.rightRim.x + activeLevel.hoop.rightRim.width) / 2,
    [activeLevel.hoop.leftRim.x, activeLevel.hoop.rightRim.width, activeLevel.hoop.rightRim.x],
  );
  const rimTopY = activeLevel.hoop.leftRim.y;
  const progressDots = Array.from({ length: stage.levels.length }, (_, index) => ({
    id: `${stage.id}-dot-${index + 1}`,
    active: index <= levelIndex,
  }));
  const currentBall = ball ?? ballRef.current;
  const stickerText = isCharging ? 'HOLD' : 'SHOOT!';

  useEffect(() => {
    ballRef.current = ball;
  }, [ball]);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  useEffect(() => {
    completeTextRef.current = completeText;
  }, [completeText]);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
  }, [sfxEnabled]);

  useEffect(() => {
    const nextAimPoint = { x: level.hoop.center.x, y: level.hoop.center.y };
    aimPointRef.current = nextAimPoint;
    setAimPoint(nextAimPoint);
    setLevelAnimationMs(0);
  }, [level.id, level.hoop.center.x, level.hoop.center.y]);

  const playCue = (cue: AudioCue) => {
    if (!sfxEnabledRef.current) return;
    audioRef.current.play(cue);
  };

  const updateAimPoint = (point: Point) => {
    aimPointRef.current = point;
    setAimPoint(point);
  };

  const stopCharging = () => {
    chargingRef.current = false;
    chargeStartedAtRef.current = null;
    setIsCharging(false);
    setChargeMs(0);
  };

  const resetBall = (announce = true) => {
    ballRef.current = null;
    setBall(null);
    setCompleteText('');
    setAnnounceScore(false);
    setParticles([]);
    particlesRef.current = [];
    stopCharging();
    if (completeTimeoutRef.current !== null) {
      window.clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
    if (announce) {
      setStatusText('Shot reset. Click anywhere to charge again.');
      playCue('reset');
    }
  };

  useEffect(() => {
    resetBall(false);
    setAttempts(0);
    setStatusText(`${stage.label} - ${level.label} loaded. Click anywhere to charge, then release to shoot.`);
  }, [level.label, level.id, stage.label]);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const delta = Math.min((timestamp - lastFrameRef.current) / 1000, 0.033);
      lastFrameRef.current = timestamp;

      if (level.hoopMotion) {
        setLevelAnimationMs(timestamp);
      }

      if (chargingRef.current && chargeStartedAtRef.current !== null) {
        setChargeMs(Math.min(MAX_CHARGE_MS, timestamp - chargeStartedAtRef.current));
      }

      const liveBall = ballRef.current;
      if (liveBall && !completeTextRef.current) {
        const physicsLevel = level.hoopMotion ? { ...level, hoop: resolveLevelHoop(level, timestamp) } : level;
        const result = stepBall(liveBall, physicsLevel, delta);

        if (result.bounced && timestamp - lastBounceAtRef.current > 90) {
          lastBounceAtRef.current = timestamp;
          playCue('bounce');
          setStatusText('Nice bounce. Use the blocks to guide the ball.');
        }

        if (result.scored) {
          ballRef.current = null;
          setBall(null);
          setCompleteText('YES!');
          setAnnounceScore(true);
          setStatusText('Bank shot scored. Next level is loading.');
          const nextParticles = createConfetti(physicsLevel.hoop.center, 44);
          particlesRef.current = nextParticles;
          setParticles(nextParticles);
          playCue('score');
          playCue('confetti');
          if (completeTimeoutRef.current !== null) {
            window.clearTimeout(completeTimeoutRef.current);
          }
          completeTimeoutRef.current = window.setTimeout(() => {
            setLevelCursor((current) => (current + 1) % ALL_HOME_LEVELS.length);
            setCompleteText('');
            setAnnounceScore(false);
            setParticles([]);
            particlesRef.current = [];
          }, AUTO_ADVANCE_MS);
        } else if (result.killed) {
          ballRef.current = null;
          setBall(null);
          setStatusText('Missed. Try a different aim angle or hold length.');
        } else {
          ballRef.current = result.ball;
          setBall(result.ball);
        }
      }

      if (particlesRef.current.length > 0) {
        const nextParticles = stepConfetti(particlesRef.current, delta);
        particlesRef.current = nextParticles;
        setParticles(nextParticles);
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (completeTimeoutRef.current !== null) {
        window.clearTimeout(completeTimeoutRef.current);
      }
      audioRef.current.dispose();
    };
  }, [level]);

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    if (ballRef.current) {
      resetBall();
      return;
    }
    if (completeText) return;

    const point = readPointer(event, level);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer events in tests may not create a capturable pointer.
    }
    chargingRef.current = true;
    chargeStartedAtRef.current = performance.now();
    updateAimPoint(point);
    setIsCharging(true);
    setChargeMs(0);
    setStatusText('Charging. Move the mouse to aim, then release to shoot.');
    playCue('charge');
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (ballRef.current || completeText) return;

    const point = readPointer(event, level);
    updateAimPoint(point);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (!chargingRef.current || ballRef.current || completeText) {
      stopCharging();
      return;
    }

    const point = readPointer(event, level);
    updateAimPoint(point);
    const heldMs = Math.min(
      MAX_CHARGE_MS,
      chargeStartedAtRef.current === null ? chargeMs : performance.now() - chargeStartedAtRef.current,
    );
    const origin = createLaunchOrigin(shooterPosition, heldMs);
    const velocity = toChargedLaunchVelocity(origin, point, heldMs);
    const power = calculateChargePercent(heldMs);
    const createdBall = createBall(origin, velocity);

    stopCharging();
    ballRef.current = createdBall;
    setBall(createdBall);
    setAttempts((current) => current + 1);
    setStatusText(`Shot released at ${power}%. Track the arc and adjust your aim.`);
  };

  const toggleAudio = () => {
    const nextEnabled = !audioEnabled;
    setSfxEnabled(nextEnabled);
    setMusicEnabled(nextEnabled);
    setStatusText(nextEnabled ? 'Sound on.' : 'Sound off.');
  };

  return (
    <section className="home-game-page">
      <h1 className="sr-only">Hold-to-shoot basketball</h1>
      <div className="home-game-shell">
        <div
          className="home-game-board"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          role="application"
          aria-label="Basketball charge shot game area"
          data-testid="home-game-board"
        >
          <div className="board-top-overlay">
            <div className="shoot-sticker">
              <div className="shoot-sticker-screen">
                <div
                  className="mini-ball"
                  style={{ transform: `translateY(${-chargePercent * 0.22}px) scale(${1 + chargePercent / 640})` }}
                />
                <div className="mini-blob" />
              </div>
              <div className="shoot-sticker-footer">
                <strong>{stickerText}</strong>
                <span>{level.label}</span>
              </div>
            </div>

            <div className="world-banner">
              <strong>{stage.label}</strong>
              <div className="world-progress" aria-label="Level progress">
                {progressDots.map((dot) => (
                  <span key={dot.id} className={`world-dot${dot.active ? ' active' : ''}`} />
                ))}
              </div>
            </div>

            <div className="home-game-actions">
              <button type="button" onClick={() => resetBall()} aria-label="Reset shot">
                <RotateCcw size={20} />
              </button>
              <button type="button" onClick={toggleAudio} aria-label="Toggle sound">
                {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button type="button" onClick={() => setShowHelp((current) => !current)} aria-label="Toggle help">
                <Menu size={20} />
              </button>
              <button type="button" onClick={() => navigate('/')} aria-label="Home">
                <Home size={20} />
              </button>
            </div>
          </div>

          <svg viewBox={`0 0 ${level.width} ${level.height}`} className="home-game-svg" aria-hidden="true">
            <defs>
              <pattern id={`court-grid-${level.id}`} width={level.cellSize} height={level.cellSize} patternUnits="userSpaceOnUse">
                <path d={`M ${level.cellSize} 0 L 0 0 0 ${level.cellSize}`} fill="none" stroke={palette.grid} strokeWidth="2" />
              </pattern>
              <filter id={`soft-shadow-${level.id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="rgba(0,0,0,0.22)" />
              </filter>
              <filter id={`ball-glow-${level.id}`} x="-90%" y="-90%" width="280%" height="280%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="0" y="0" width={activeLevel.width} height={activeLevel.height} fill={palette.background} />
            <rect x="0" y="0" width={activeLevel.width} height={activeLevel.height} fill={`url(#court-grid-${level.id})`} opacity="0.86" />

            {createPalmSilhouettes(activeLevel, palette)}

            {activeLevel.obstacles.map((obstacle, index) => (
              <g key={`${obstacle.x}-${obstacle.y}-${index}`} filter={`url(#soft-shadow-${level.id})`}>
                <rect
                  x={obstacle.x + 1.5}
                  y={obstacle.y + 1.5}
                  width={obstacle.width - 3}
                  height={obstacle.height - 3}
                  fill="#ffffff"
                  stroke="#05070b"
                  strokeWidth="3"
                />
                <rect x={obstacle.x + 3} y={obstacle.y + 3} width="10" height={obstacle.height - 6} fill={palette.wallStripe} />
                <rect
                  x={obstacle.x + 18}
                  y={obstacle.y + 13}
                  width={obstacle.width - 28}
                  height={obstacle.height - 24}
                  fill={palette.wallTile}
                  stroke={palette.wallTileStroke}
                  strokeWidth="1.5"
                />
              </g>
            ))}

            <g transform={`translate(${shooterPosition.x} ${shooterPosition.y - chargePose.lift}) scale(${chargePose.scaleX} ${chargePose.scaleY})`}>
              <ellipse cx="0" cy="22" rx="35" ry="10" fill="rgba(0,0,0,0.2)" />
              <ellipse cx="0" cy="0" rx="28" ry="24" fill="#ffbf47" stroke="#05070b" strokeWidth="4" />
              <circle cx="-7" cy="-3" r="3.7" fill="#05070b" />
              <circle cx="8" cy="-3" r="3.7" fill="#05070b" />
              <circle cx="-10" cy="-8" r="4" fill="#ff9251" opacity="0.62" />
              <circle cx="14" cy="-8" r="4" fill="#ff9251" opacity="0.62" />
              <path d="M -10 8 Q 0 16 10 8" fill="none" stroke="#05070b" strokeWidth="4" strokeLinecap="round" />
            </g>

            {!currentBall ? (
              <g transform={`translate(${launchOrigin.x} ${launchOrigin.y}) scale(${1 + chargePercent / 700})`} filter={`url(#ball-glow-${level.id})`}>
                {isCharging ? (
                  <circle
                    r={28 + chargePercent * 0.08}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="4"
                    opacity={0.35 + chargePercent / 220}
                  />
                ) : null}
                {renderBasketball({ radius: 14 }, '#5ca4ff')}
              </g>
            ) : null}

            {shotPreview.length > 0 ? (
              <g>
                <path
                  d={`M ${launchOrigin.x} ${launchOrigin.y} L ${shotPreview.map((point) => `${point.x} ${point.y}`).join(' L ')}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeDasharray="10 8"
                  opacity="0.96"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {shotPreview.map((point, index) => (
                  <circle
                    key={`shot-preview-${point.x}-${point.y}-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={point.radius}
                    fill="#ffffff"
                    stroke="#05070b"
                    strokeWidth="1.1"
                    opacity={point.opacity}
                  />
                ))}
              </g>
            ) : null}

            <g className="hoop-arrow">
              <path
                d={`M ${rimCenterX} ${rimTopY - 78} L ${rimCenterX} ${rimTopY - 28}`}
                stroke="#ffffff"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d={`M ${rimCenterX - 24} ${rimTopY - 48} L ${rimCenterX} ${rimTopY - 18} L ${rimCenterX + 24} ${rimTopY - 48}`}
                fill="none"
                stroke="#05070b"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`M ${rimCenterX - 18} ${rimTopY - 42} L ${rimCenterX} ${rimTopY - 20} L ${rimCenterX + 18} ${rimTopY - 42}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            <g className="realistic-hoop" filter={`url(#soft-shadow-${level.id})`}>
              <path
                d={`M ${rimCenterX} ${activeLevel.hoop.backboard.y - 34} L ${rimCenterX} ${activeLevel.hoop.leftRim.y - 26}`}
                stroke="#ffffff"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <rect
                x={activeLevel.hoop.backboard.x - 5}
                y={activeLevel.hoop.backboard.y - 6}
                width={activeLevel.hoop.backboard.width + 10}
                height={activeLevel.hoop.backboard.height + 12}
                rx="7"
                fill="#f7fbff"
                stroke="#05070b"
                strokeWidth="3"
              />
              <ellipse
                cx={rimCenterX}
                cy={rimTopY + 7}
                rx={(activeLevel.hoop.sensor.width + 12) / 2}
                ry="13"
                fill={palette.hoop}
                stroke="#05070b"
                strokeWidth="4"
              />
              <ellipse
                cx={rimCenterX}
                cy={rimTopY + 9}
                rx={(activeLevel.hoop.sensor.width - 10) / 2}
                ry="8"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                opacity="0.8"
              />
              {[0, 1, 2, 3, 4, 5].map((column) => {
                const topX = rimCenterX - 30 + column * 12;
                const bottomOffset = column < 3 ? -18 + column * 9 : (column - 3) * 9;
                return (
                  <path
                    key={`net-column-${column}`}
                    d={`M ${topX} ${rimTopY + 20} Q ${topX + bottomOffset * 0.2} ${rimTopY + 58} ${rimCenterX + bottomOffset} ${rimTopY + 118}`}
                    fill="none"
                    stroke="#05070b"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                );
              })}
              {[0, 1, 2, 3].map((row) => {
                const y = rimTopY + 42 + row * 18;
                return (
                  <path
                    key={`net-row-${row}`}
                    d={`M ${rimCenterX - 30 + row * 3} ${y} Q ${rimCenterX} ${y + 8} ${rimCenterX + 30 - row * 3} ${y}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {currentBall ? (
              <g>
                <path
                  d={`M ${currentBall.previousX} ${currentBall.previousY} L ${currentBall.x} ${currentBall.y}`}
                  stroke="#e6fbff"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.38"
                />
                <g transform={`translate(${currentBall.x} ${currentBall.y})`} filter={`url(#ball-glow-${level.id})`}>
                  {renderBasketball(currentBall, '#ff8c1a')}
                </g>
              </g>
            ) : null}
          </svg>

          <div className={`charge-meter${isCharging ? ' charging' : ''}`} aria-label="Shot charge meter">
            <div className="charge-track">
              <span className="perfect-zone" />
              <span className="charge-fill" style={{ width: `${chargePercent}%` }} />
            </div>
            <div className="charge-labels">
              <span>soft</span>
              <strong>{isCharging ? `${chargePercent}%` : 'hold'}</strong>
              <span>hard</span>
            </div>
          </div>

          <div className="board-bottom-overlay">
            <div className="status-pill" data-testid="home-game-status">
              <strong>{announceScore ? 'Scored' : `Attempt ${attempts}`}</strong>
              <span>{statusText}</span>
            </div>
            {showHelp ? (
              <div className="hint-pill">
                <span>Click anywhere to charge, move the mouse to aim, then release.</span>
                <span>Sound: {audioEnabled ? 'on' : 'off'}</span>
              </div>
            ) : null}
          </div>

          {particles.map((particle) => (
            <span
              key={particle.id}
              className="confetti-piece"
              style={{
                left: `${(particle.x / level.width) * 100}%`,
                top: `${(particle.y / level.height) * 100}%`,
                width: `${particle.size}px`,
                height: `${Math.max(6, particle.size * 0.58)}px`,
                background: particle.color,
                opacity: Math.max(0, 1 - particle.life / particle.maxLife),
                transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
              }}
            />
          ))}

          {completeText ? (
            <div className="level-complete" role="status" aria-live="polite">
              <strong>{completeText}</strong>
              <span>Bank!</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
