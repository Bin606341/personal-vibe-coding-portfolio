import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
  advancePlayer,
  calculateChargePercent,
  createShotPath,
  findNearbyEntry,
  getMovementIntent,
  judgeChargedShot,
  movePlayer,
  type MovementKey,
  type PlayerPosition,
  type SceneEntry,
  type ShotPoint,
} from '../utils/homeLogic';

const courtBounds = {
  minX: -11,
  maxX: 11,
  minZ: -6.4,
  maxZ: 7,
};

const sceneEntries: SceneEntry[] = [
  { id: 'players', label: '现役球员区', path: '/players', position: [-9, -4], radius: 2.25 },
  { id: 'hall', label: '历史名人堂区', path: '/hall', position: [9, -4], radius: 2.25 },
  { id: 'training', label: '教学区', path: '/training', position: [-8, 5.5], radius: 2.25 },
  { id: 'tactics', label: '战术区', path: '/tactics', position: [0, 6.2], radius: 2.25 },
  { id: 'clutch', label: '历史经典绝杀区', path: '/clutch', position: [8, 5.5], radius: 2.25 },
];

const entryDescription: Record<string, string> = {
  players: '发光队徽墙',
  hall: '海边荣誉纪念墙',
  training: '训练器材区',
  tactics: '教练战术板',
  clutch: '场边大屏回放',
};

export const HOME_PLAYER_DESIGN = {
  jerseyNumber: '11',
  uniform: {
    primary: '#ffffff',
    accents: ['#0b0f19', '#0077c8'],
  },
  skinTone: '#9b5a3d',
  hair: {
    color: '#11100f',
    style: 'short dread clusters',
  },
  face: {
    beard: true,
    sleepyEyes: true,
    thickBrows: true,
  },
  props: {
    basketball: true,
    blackShoes: true,
    whiteSleeves: true,
  },
} as const;

export const HOME_PLAYER_ANIMATION = {
  dribble: {
    dominantHand: 'right',
    speed: 10,
    bodyDrop: 0.075,
    ballLowY: 0.25,
    ballHighY: 1.08,
    shoulderLean: 0.085,
  },
  shot: {
    loadMs: 420,
    setPointMs: 760,
    followThroughFrames: 18,
  },
} as const;

type MotionVector = {
  x: number;
  y: number;
  z: number;
};

type HomePlayerMotionInput = {
  elapsed: number;
  isMoving: boolean;
  charging: boolean;
  shooting: boolean;
  chargeMs: number;
  shotProgress: number;
};

type HomePlayerMotion = {
  rig: MotionVector;
  leftArm: MotionVector;
  rightArm: MotionVector;
  leftLeg: MotionVector;
  rightLeg: MotionVector;
  ballOffset: MotionVector;
  ballSpin: {
    x: number;
    z: number;
  };
};

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));
const easeOutCubic = (value: number) => 1 - Math.pow(1 - clampUnit(value), 3);
const easeInOutSine = (value: number) => -(Math.cos(Math.PI * clampUnit(value)) - 1) / 2;

export const getHomePlayerMotion = ({
  elapsed,
  isMoving,
  charging,
  shooting,
  chargeMs,
  shotProgress,
}: HomePlayerMotionInput): HomePlayerMotion => {
  const dribble = HOME_PLAYER_ANIMATION.dribble;
  const bounce = (1 - Math.cos(elapsed * dribble.speed)) / 2;
  const compression = 1 - bounce;
  const strideWave = isMoving ? Math.sin(elapsed * 10.5) : 0;
  const strideCounter = isMoving ? Math.cos(elapsed * 10.5) : 0;
  const moveLift = isMoving ? Math.abs(strideWave) * 0.024 : 0;

  const motion: HomePlayerMotion = {
    rig: {
      x: isMoving ? -strideCounter * 0.035 : -compression * 0.012,
      y: -dribble.bodyDrop * compression + moveLift,
      z: -dribble.shoulderLean * compression - strideWave * 0.035,
    },
    leftArm: {
      x: 0.18 + strideWave * 0.12 + compression * 0.08,
      y: 0,
      z: 0.42 + compression * 0.1,
    },
    rightArm: {
      x: -0.35 - compression * 0.72 - strideWave * 0.08,
      y: 0,
      z: -0.5 - compression * 0.18,
    },
    leftLeg: {
      x: strideWave * 0.56 - compression * 0.08,
      y: 0,
      z: -0.045 + strideCounter * 0.025,
    },
    rightLeg: {
      x: -strideWave * 0.56 - compression * 0.08,
      y: 0,
      z: 0.045 - strideCounter * 0.025,
    },
    ballOffset: {
      x: 0.4 + Math.sin(elapsed * 2.8) * 0.025,
      y: dribble.ballLowY + (dribble.ballHighY - dribble.ballLowY) * easeInOutSine(bounce),
      z: 0.52,
    },
    ballSpin: {
      x: 0.16 + compression * 0.08,
      z: 0.09 + Math.abs(strideWave) * 0.04,
    },
  };

  if (charging) {
    const setPoint = easeOutCubic(chargeMs / HOME_PLAYER_ANIMATION.shot.setPointMs);
    const load = easeInOutSine(chargeMs / HOME_PLAYER_ANIMATION.shot.loadMs);
    return {
      rig: {
        x: -0.07 + setPoint * 0.02,
        y: -0.1 + setPoint * 0.035,
        z: -0.035 + setPoint * 0.02,
      },
      leftArm: {
        x: -0.82 - setPoint * 0.82,
        y: 0,
        z: 0.2 - setPoint * 0.07,
      },
      rightArm: {
        x: -0.9 - setPoint * 0.84,
        y: 0,
        z: -0.2 + setPoint * 0.07,
      },
      leftLeg: {
        x: -0.16 - load * 0.08,
        y: 0,
        z: -0.035,
      },
      rightLeg: {
        x: -0.16 - load * 0.08,
        y: 0,
        z: 0.035,
      },
      ballOffset: {
        x: 0.1,
        y: 0.92 + setPoint * 0.82,
        z: 0.3 + setPoint * 0.16,
      },
      ballSpin: {
        x: 0.05,
        z: 0.04,
      },
    };
  }

  if (shooting) {
    const follow = easeOutCubic(shotProgress);
    return {
      rig: {
        x: -0.02 + Math.sin(follow * Math.PI) * 0.035,
        y: Math.sin(follow * Math.PI) * 0.06,
        z: 0,
      },
      leftArm: {
        x: -1.72 - follow * 0.58,
        y: 0,
        z: 0.13 - follow * 0.04,
      },
      rightArm: {
        x: -1.78 - follow * 0.64,
        y: 0,
        z: -0.13 + follow * 0.04,
      },
      leftLeg: {
        x: -0.22 + follow * 0.08,
        y: 0,
        z: -0.02,
      },
      rightLeg: {
        x: -0.2 + follow * 0.08,
        y: 0,
        z: 0.02,
      },
      ballOffset: {
        x: 0.06,
        y: 1.74 + follow * 0.56,
        z: 0.38 - follow * 0.22,
      },
      ballSpin: {
        x: 0.22,
        z: 0.13,
      },
    };
  }

  return motion;
};

const isMovementKey = (key: string): key is MovementKey =>
  key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight';

const createSkyTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#30235f');
  sky.addColorStop(0.24, '#d85b71');
  sky.addColorStop(0.45, '#ff9f55');
  sky.addColorStop(0.64, '#2d7fa5');
  sky.addColorStop(1, '#062638');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sun = ctx.createRadialGradient(530, 330, 10, 530, 330, 190);
  sun.addColorStop(0, 'rgba(255, 245, 182, 1)');
  sun.addColorStop(0.38, 'rgba(255, 176, 93, 0.95)');
  sun.addColorStop(1, 'rgba(255, 176, 93, 0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(530, 330, 190, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 11; i += 1) {
    const x = 120 + i * 150;
    const y = 130 + Math.sin(i * 1.7) * 55;
    const cloud = ctx.createRadialGradient(x, y, 20, x, y, 180);
    cloud.addColorStop(0, 'rgba(255, 218, 201, 0.38)');
    cloud.addColorStop(1, 'rgba(255, 218, 201, 0)');
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.ellipse(x, y, 220, 55, -0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  const ocean = ctx.createLinearGradient(0, 580, 0, canvas.height);
  ocean.addColorStop(0, 'rgba(255, 177, 88, 0.26)');
  ocean.addColorStop(0.08, 'rgba(31, 132, 158, 0.9)');
  ocean.addColorStop(1, 'rgba(3, 38, 62, 1)');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 555, canvas.width, 345);

  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 3;
  for (let y = 600; y < 850; y += 42) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 26) {
      const waveY = y + Math.sin(x * 0.018 + y * 0.02) * 8;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const addLine = (group: THREE.Group, x: number, z: number, width: number, depth: number) => {
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.025, depth),
    new THREE.MeshBasicMaterial({ color: 0xf8fbff, transparent: true, opacity: 0.86 }),
  );
  line.position.set(x, 0.111, z);
  group.add(line);
};

const createCourtLines = () => {
  const group = new THREE.Group();
  addLine(group, 0, -7.35, 24, 0.08);
  addLine(group, 0, 7.35, 24, 0.08);
  addLine(group, -11.95, 0, 0.08, 14.7);
  addLine(group, 11.95, 0, 0.08, 14.7);
  addLine(group, 0, 0, 0.08, 14.7);
  addLine(group, 0, -4.85, 7.6, 0.08);
  addLine(group, 0, 4.85, 7.6, 0.08);
  addLine(group, -3.8, -6.1, 0.08, 2.5);
  addLine(group, 3.8, -6.1, 0.08, 2.5);
  addLine(group, -3.8, 6.1, 0.08, 2.5);
  addLine(group, 3.8, 6.1, 0.08, 2.5);

  const centerCircle = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.035, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.82 }),
  );
  centerCircle.rotation.x = Math.PI / 2;
  centerCircle.position.y = 0.13;
  group.add(centerCircle);

  [-5.65, 5.65].forEach((z) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(3.1, 0.032, 8, 96, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.78 }),
    );
    arc.position.set(0, 0.13, z);
    arc.rotation.x = Math.PI / 2;
    arc.rotation.z = z < 0 ? 0 : Math.PI;
    group.add(arc);
  });

  return group;
};

const createPalm = (x: number, z: number, scale = 1) => {
  const palm = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * scale, 0.15 * scale, 2.6 * scale, 9),
    new THREE.MeshStandardMaterial({ color: 0x7a4a24, roughness: 0.8 }),
  );
  trunk.rotation.z = 0.12;
  trunk.position.y = 1.25 * scale;
  palm.add(trunk);

  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x1e8f65, roughness: 0.7, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i += 1) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18 * scale, 1.45 * scale, 4), leafMaterial);
    leaf.position.set(0, 2.58 * scale, 0);
    leaf.rotation.z = Math.PI / 2;
    leaf.rotation.y = (i / 7) * Math.PI * 2;
    leaf.position.x = Math.cos(leaf.rotation.y) * 0.35 * scale;
    leaf.position.z = Math.sin(leaf.rotation.y) * 0.35 * scale;
    palm.add(leaf);
  }

  palm.position.set(x, 0, z);
  return palm;
};

const createJerseyTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = HOME_PLAYER_DESIGN.uniform.accents[0];
  ctx.lineWidth = 24;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(126, 78);
  ctx.lineTo(256, 174);
  ctx.lineTo(386, 78);
  ctx.stroke();

  ctx.strokeStyle = HOME_PLAYER_DESIGN.uniform.accents[1];
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(146, 82);
  ctx.lineTo(256, 156);
  ctx.lineTo(366, 82);
  ctx.stroke();

  ctx.fillStyle = HOME_PLAYER_DESIGN.uniform.accents[1];
  ctx.strokeStyle = HOME_PLAYER_DESIGN.uniform.accents[0];
  ctx.lineWidth = 8;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 76px Arial Black, Arial';
  ctx.strokeText('NETS', 256, 236);
  ctx.fillText('NETS', 256, 236);

  ctx.font = '900 188px Arial Black, Arial';
  ctx.lineWidth = 12;
  ctx.strokeText(HOME_PLAYER_DESIGN.jerseyNumber, 256, 356);
  ctx.fillText(HOME_PLAYER_DESIGN.jerseyNumber, 256, 356);

  ctx.strokeStyle = 'rgba(11, 15, 25, 0.86)';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(100, 456);
  ctx.lineTo(412, 456);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createBasketballTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#f97316';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#22110a';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 256);
  ctx.moveTo(0, 128);
  ctx.lineTo(256, 128);
  ctx.stroke();

  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.ellipse(68, 128, 34, 132, 0, 0, Math.PI * 2);
  ctx.ellipse(188, 128, 34, 132, 0, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createPlayer = () => {
  const player = new THREE.Group();
  const jerseyTexture = createJerseyTexture();
  const outline = new THREE.MeshBasicMaterial({ color: 0x050506, side: THREE.BackSide });
  const jersey = new THREE.MeshStandardMaterial({
    color: HOME_PLAYER_DESIGN.uniform.primary,
    roughness: 0.48,
    metalness: 0.03,
  });
  const jerseyDecal = new THREE.MeshBasicMaterial({
    map: jerseyTexture ?? undefined,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const skin = new THREE.MeshStandardMaterial({ color: HOME_PLAYER_DESIGN.skinTone, roughness: 0.72 });
  const skinLight = new THREE.MeshStandardMaterial({ color: 0xc47a58, roughness: 0.7 });
  const hair = new THREE.MeshStandardMaterial({ color: HOME_PLAYER_DESIGN.hair.color, roughness: 0.82 });
  const hairHighlight = new THREE.MeshStandardMaterial({ color: 0x2a1c17, roughness: 0.86 });
  const beard = new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.82 });
  const black = new THREE.MeshStandardMaterial({ color: HOME_PLAYER_DESIGN.uniform.accents[0], roughness: 0.58 });
  const blue = new THREE.MeshStandardMaterial({ color: HOME_PLAYER_DESIGN.uniform.accents[1], roughness: 0.48 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.44 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.36 });

  const torsoGeometry = new THREE.CapsuleGeometry(0.36, 0.68, 7, 24);
  const torsoOutline = new THREE.Mesh(torsoGeometry, outline);
  torsoOutline.position.y = 1.08;
  torsoOutline.scale.set(1.23, 1.02, 0.84);
  const torso = new THREE.Mesh(torsoGeometry, jersey);
  torso.position.y = 1.08;
  torso.scale.set(1.12, 0.96, 0.76);

  const chest = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.82), jerseyDecal);
  chest.position.set(0, 1.1, 0.305);
  const leftJerseyStripe = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.76, 0.035), blue);
  leftJerseyStripe.position.set(-0.34, 1.03, 0.29);
  const rightJerseyStripe = leftJerseyStripe.clone();
  rightJerseyStripe.position.x = 0.34;
  const collarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.035, 0.045), black);
  collarLeft.position.set(-0.08, 1.43, 0.31);
  collarLeft.rotation.z = -0.54;
  const collarRight = collarLeft.clone();
  collarRight.position.x = 0.08;
  collarRight.rotation.z = 0.54;

  const shortsOutline = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.35, 0.56), outline);
  shortsOutline.position.y = 0.7;
  shortsOutline.scale.set(1.06, 1.06, 1.06);
  const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.3, 0.5), jersey);
  shorts.position.y = 0.7;
  const leftShortStripe = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.53), blue);
  leftShortStripe.position.set(-0.39, 0.7, 0);
  const rightShortStripe = leftShortStripe.clone();
  rightShortStripe.position.x = 0.39;
  const shortHem = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.035, 0.53), black);
  shortHem.position.set(0, 0.55, 0);

  const headGeometry = new THREE.SphereGeometry(0.42, 36, 26);
  const headOutline = new THREE.Mesh(headGeometry, outline);
  headOutline.position.y = 1.74;
  headOutline.scale.set(1.12, 1.18, 1.02);
  const head = new THREE.Mesh(headGeometry, skin);
  head.position.y = 1.74;
  head.scale.set(1.02, 1.08, 0.94);

  const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 12), skin);
  leftEar.position.set(-0.43, 1.72, 0.03);
  leftEar.scale.set(0.72, 1.1, 0.42);
  const rightEar = leftEar.clone();
  rightEar.position.x = 0.43;
  const leftInnerEar = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 10), skinLight);
  leftInnerEar.position.set(-0.446, 1.715, 0.065);
  leftInnerEar.scale.set(0.5, 0.9, 0.22);
  const rightInnerEar = leftInnerEar.clone();
  rightInnerEar.position.x = 0.446;

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.43, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.56), hair);
  hairCap.position.y = 1.91;
  hairCap.scale.set(1.08, 0.84, 0.98);
  const hairLocks = new THREE.Group();
  const lockGeometry = new THREE.CapsuleGeometry(0.044, 0.18, 5, 12);
  const lockLayout = [
    [-0.3, 2.03, 0.08, 0.75, -0.85, 1.14],
    [-0.18, 2.08, 0.17, 1.05, -0.38, 1.05],
    [-0.04, 2.1, 0.2, 1.18, -0.05, 1.18],
    [0.12, 2.08, 0.16, 1.0, 0.36, 1.05],
    [0.28, 2.02, 0.08, 0.72, 0.78, 1.1],
    [-0.35, 1.9, 0.18, 1.28, -0.72, 0.98],
    [-0.16, 1.94, 0.32, 1.34, -0.24, 0.92],
    [0.03, 1.96, 0.34, 1.4, 0.08, 0.94],
    [0.22, 1.94, 0.28, 1.22, 0.44, 0.98],
    [0.36, 1.88, 0.1, 1.05, 0.74, 0.94],
  ];
  lockLayout.forEach(([x, y, z, rx, rz, scale], index) => {
    const lock = new THREE.Mesh(lockGeometry, index % 2 === 0 ? hairHighlight : hair);
    lock.position.set(x, y, z);
    lock.rotation.x = rx;
    lock.rotation.z = rz;
    lock.scale.setScalar(scale);
    hairLocks.add(lock);
  });

  const makeEye = (side: number) => {
    const group = new THREE.Group();
    group.position.set(side * 0.135, 1.78, 0.365);

    const outlineEye = new THREE.Mesh(new THREE.SphereGeometry(0.082, 20, 12), black);
    outlineEye.scale.set(1.28, 0.62, 0.12);
    const whiteEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 12), eyeWhite);
    whiteEye.position.z = 0.012;
    whiteEye.scale.set(1.24, 0.52, 0.1);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 10), black);
    pupil.position.set(0.018 * side, -0.01, 0.031);
    pupil.scale.set(0.95, 1.05, 0.16);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.026, 0.028), skin);
    lid.position.set(0, 0.038, 0.04);
    lid.rotation.z = -0.05 * side;

    group.add(outlineEye, whiteEye, pupil, lid);
    return group;
  };

  const leftEye = makeEye(-1);
  const rightEye = makeEye(1);
  const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.042, 0.038), black);
  leftBrow.position.set(-0.14, 1.89, 0.37);
  leftBrow.rotation.z = -0.08;
  const rightBrow = leftBrow.clone();
  rightBrow.position.x = 0.14;
  rightBrow.rotation.z = 0.08;

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.046, 16, 10), skinLight);
  nose.position.set(0, 1.69, 0.405);
  nose.scale.set(0.82, 0.65, 0.42);

  const beardPatch = new THREE.Mesh(new THREE.SphereGeometry(0.285, 28, 16), beard);
  beardPatch.position.set(0, 1.52, 0.32);
  beardPatch.scale.set(1.08, 0.62, 0.28);
  const leftCheekBeard = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.22, 5, 12), beard);
  leftCheekBeard.position.set(-0.27, 1.58, 0.315);
  leftCheekBeard.rotation.z = 0.48;
  const rightCheekBeard = leftCheekBeard.clone();
  rightCheekBeard.position.x = 0.27;
  rightCheekBeard.rotation.z = -0.48;
  const moustacheLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.023, 0.11, 4, 10), beard);
  moustacheLeft.position.set(-0.055, 1.6, 0.43);
  moustacheLeft.rotation.z = Math.PI / 2 - 0.18;
  const moustacheRight = moustacheLeft.clone();
  moustacheRight.position.x = 0.055;
  moustacheRight.rotation.z = Math.PI / 2 + 0.18;
  const lip = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.12, 4, 10), skinLight);
  lip.position.set(0, 1.545, 0.45);
  lip.rotation.z = Math.PI / 2;
  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10), skinLight);
  chin.position.set(0, 1.46, 0.435);
  chin.scale.set(1.15, 0.52, 0.28);

  const createArm = (side: -1 | 1, sleeved: boolean) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.48, 1.22, 0.05);
    arm.rotation.z = side === -1 ? 0.32 : -0.32;

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.27, 5, 12), skin);
    upper.position.y = -0.14;
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.067, 0.32, 5, 12), sleeved ? white : skin);
    forearm.position.set(side * 0.025, -0.43, 0.015);
    forearm.rotation.z = side * 0.06;
    const wrist = new THREE.Mesh(new THREE.TorusGeometry(0.069, 0.012, 8, 18), sleeved ? black : white);
    wrist.position.set(side * 0.038, -0.62, 0.015);
    wrist.rotation.x = Math.PI / 2;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 12), skin);
    hand.position.set(side * 0.045, -0.69, 0.02);
    hand.scale.set(1.0, 0.82, 0.92);

    arm.add(upper, forearm, wrist, hand);
    return arm;
  };

  const leftArm = createArm(-1, false);
  const rightArm = createArm(1, true);

  const createLeg = (side: -1 | 1) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.2, 0.67, 0);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.084, 0.26, 5, 12), white);
    thigh.position.y = -0.12;
    thigh.rotation.z = side * 0.05;
    const calf = new THREE.Mesh(new THREE.CapsuleGeometry(0.074, 0.34, 5, 12), white);
    calf.position.set(side * 0.015, -0.38, 0.015);
    const kneeBand = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.011, 8, 18), black);
    kneeBand.position.set(side * 0.008, -0.25, 0.014);
    kneeBand.rotation.x = Math.PI / 2;

    const shoe = new THREE.Group();
    shoe.position.set(side * 0.035, -0.59, 0.09);
    const shoeBody = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.15, 0.48), black);
    shoeBody.rotation.x = -0.08;
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.035, 0.52), new THREE.MeshStandardMaterial({ color: 0x20242d, roughness: 0.64 }));
    sole.position.y = -0.08;
    const laceOne = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.018, 0.018), new THREE.MeshBasicMaterial({ color: 0x59606b }));
    laceOne.position.set(0, 0.04, 0.05);
    laceOne.rotation.y = side * 0.32;
    const laceTwo = laceOne.clone();
    laceTwo.position.z = -0.035;
    laceTwo.rotation.y = -side * 0.32;
    shoe.add(shoeBody, sole, laceOne, laceTwo);

    leg.add(thigh, calf, kneeBand, shoe);
    return leg;
  };

  const leftLeg = createLeg(-1);
  const rightLeg = createLeg(1);

  player.add(
    torsoOutline,
    torso,
    chest,
    leftJerseyStripe,
    rightJerseyStripe,
    collarLeft,
    collarRight,
    shortsOutline,
    shorts,
    leftShortStripe,
    rightShortStripe,
    shortHem,
    headOutline,
    head,
    leftEar,
    rightEar,
    leftInnerEar,
    rightInnerEar,
    hairCap,
    hairLocks,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    nose,
    beardPatch,
    leftCheekBeard,
    rightCheekBeard,
    moustacheLeft,
    moustacheRight,
    lip,
    chin,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  );
  player.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
    }
  });
  player.scale.setScalar(1.12);
  player.userData = { leftArm, rightArm, leftLeg, rightLeg };
  return player;
};

const createBasketball = () => {
  const texture = createBasketballTexture();
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 36, 28),
    new THREE.MeshStandardMaterial({ color: 0xf97316, map: texture ?? undefined, roughness: 0.5 }),
  );
};

const createEntryObject = (entry: SceneEntry, index: number) => {
  const group = new THREE.Group();
  const [x, z] = entry.position;
  const colors = [0xffb02e, 0x79d8ff, 0xe85dff, 0x68ffab, 0xff5d8f];
  const color = colors[index];
  const boardMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.42,
    roughness: 0.28,
    metalness: 0.18,
  });

  const board = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.2, 0.18), boardMaterial);
  const glow = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.045, 16, 72),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 }),
  );
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.05, 0.2, 32),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.25 }),
  );

  board.position.y = 0.92;
  glow.position.y = 0.95;
  glow.rotation.x = Math.PI / 2;
  pedestal.position.y = 0.1;
  group.position.set(x, 0, z);
  group.add(pedestal, board, glow);
  group.userData = { baseY: 0, color };
  return group;
};

export const HomeScene = () => {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const ballRef = useRef<THREE.Mesh | null>(null);
  const pressedKeysRef = useRef<Set<MovementKey>>(new Set());
  const shotRef = useRef<{ path: ShotPoint[]; frame: number; made: boolean } | null>(null);
  const chargeStartRef = useRef<number | null>(null);
  const positionRef = useRef<PlayerPosition>({ x: 0, z: 1.8 });
  const activeEntryRef = useRef<SceneEntry | null>(null);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ x: 0, z: 1.8 });
  const [activeEntry, setActiveEntry] = useState<SceneEntry | null>(null);
  const [shotFeedback, setShotFeedback] = useState('按住 D 键蓄力，松开出手');
  const [chargePercent, setChargePercent] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [webglFallback, setWebglFallback] = useState(false);

  const entryLabels = useMemo(
    () =>
      sceneEntries.map((entry, index) => ({
        ...entry,
        style: {
          left: `${10 + index * 19.5}%`,
        },
      })),
    [],
  );

  const updateActiveEntry = useCallback((position: PlayerPosition) => {
    const next = findNearbyEntry(position, sceneEntries);
    if (next?.id !== activeEntryRef.current?.id) {
      activeEntryRef.current = next;
      setActiveEntry(next);
    }
  }, []);

  const move = useCallback(
    (key: MovementKey) => {
      setPlayerPosition((current) => {
        const next = movePlayer(current, key, 0.72, courtBounds);
        positionRef.current = next;
        updateActiveEntry(next);
        return next;
      });
    },
    [updateActiveEntry],
  );

  const releaseShot = useCallback((heldMs: number) => {
    const result = judgeChargedShot(heldMs);
    const start = {
      x: positionRef.current.x,
      y: 1.42,
      z: positionRef.current.z - 0.35,
    };
    const rim = {
      x: result.quality === 'too-long' ? 0.82 : result.made ? 0 : -0.48,
      y: result.quality === 'too-long' ? 3.22 : result.made ? 2.83 : 2.48,
      z: result.quality === 'too-long' ? -5.62 : result.made ? -5.82 : -6.08,
    };

    shotRef.current = { path: createShotPath(start, rim, 48, result.made ? 4.45 : 3.6), frame: 0, made: result.made };
    setShotFeedback(result.feedback);
  }, []);

  const startCharge = useCallback(() => {
    if (chargeStartRef.current !== null || shotRef.current) return;
    chargeStartRef.current = performance.now();
    setChargePercent(0);
    setIsCharging(true);
    setShotFeedback('蓄力中，绿色区域松开就是完美投篮');
  }, []);

  const finishCharge = useCallback(() => {
    if (chargeStartRef.current === null) return;
    const heldMs = performance.now() - chargeStartRef.current;
    chargeStartRef.current = null;
    setChargePercent(calculateChargePercent(heldMs));
    setIsCharging(false);
    releaseShot(heldMs);
  }, [releaseShot]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isMovementKey(event.key)) {
        event.preventDefault();
        pressedKeysRef.current.add(event.key);
      }

      if (event.key.toLowerCase() === 'd' && !event.repeat) {
        event.preventDefault();
        startCharge();
      }

      if (event.key === 'Enter' && activeEntryRef.current) {
        event.preventDefault();
        navigate(activeEntryRef.current.path);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isMovementKey(event.key)) {
        pressedKeysRef.current.delete(event.key);
      }

      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        finishCharge();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [finishCharge, navigate, startCharge]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer: THREE.WebGLRenderer;
    let animationId = 0;

    if (import.meta.env.MODE === 'test') {
      setWebglFallback(true);
      return undefined;
    }

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch {
      setWebglFallback(true);
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x111a34, 24, 70);

    const camera = new THREE.PerspectiveCamera(46, mount.clientWidth / mount.clientHeight, 0.1, 120);
    camera.position.set(0, 6.9, 11.5);
    camera.lookAt(0, 1.05, -1.6);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x1f2c55, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const skyTexture = createSkyTexture();
    if (skyTexture) {
      const skyPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(95, 54),
        new THREE.MeshBasicMaterial({ map: skyTexture, depthWrite: false }),
      );
      skyPlane.position.set(0, 15, -39);
      scene.add(skyPlane);
    }

    const hemi = new THREE.HemisphereLight(0xffd3ad, 0x0f4766, 2.4);
    const sun = new THREE.DirectionalLight(0xffa35b, 3.3);
    sun.position.set(-8, 12, 10);
    sun.castShadow = true;
    scene.add(hemi, sun);

    const sunDisc = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 32, 20),
      new THREE.MeshBasicMaterial({ color: 0xffdf91, transparent: true, opacity: 0.92 }),
    );
    sunDisc.position.set(-8.4, 8.8, -30);
    scene.add(sunDisc);

    const oceanGeometry = new THREE.PlaneGeometry(96, 50, 80, 40);
    const ocean = new THREE.Mesh(
      oceanGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x0d7897,
        roughness: 0.28,
        metalness: 0.08,
        emissive: 0x082f49,
        emissiveIntensity: 0.12,
      }),
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, -0.16, -21);
    scene.add(ocean);

    const beach = new THREE.Mesh(
      new THREE.PlaneGeometry(42, 10),
      new THREE.MeshStandardMaterial({ color: 0xc98b55, roughness: 0.76 }),
    );
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(0, -0.12, 11.2);
    scene.add(beach);

    scene.add(createPalm(-14, 8.5, 1.1), createPalm(14.5, 8.1, 1), createPalm(-17, -1, 0.9));

    const court = new THREE.Mesh(
      new THREE.BoxGeometry(24.4, 0.16, 15.2),
      new THREE.MeshStandardMaterial({ color: 0xb85f2a, roughness: 0.48, metalness: 0.08 }),
    );
    court.position.y = 0;
    court.receiveShadow = true;
    scene.add(court, createCourtLines());

    const sidelineGlow = new THREE.Mesh(
      new THREE.BoxGeometry(24.8, 0.03, 15.6),
      new THREE.MeshBasicMaterial({ color: 0xffb02e, transparent: true, opacity: 0.12 }),
    );
    sidelineGlow.position.y = 0.14;
    scene.add(sidelineGlow);

    const hoopGroup = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.11, 3.25, 18),
      new THREE.MeshStandardMaterial({ color: 0x273044, metalness: 0.42, roughness: 0.24 }),
    );
    pole.position.set(0, 1.55, -7.35);
    pole.castShadow = true;
    const backboard = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 1.28, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xd8f2ff, transparent: true, opacity: 0.74 }),
    );
    backboard.position.set(0, 3.08, -6.55);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.44, 0.035, 16, 72),
      new THREE.MeshStandardMaterial({ color: 0xff6a00, emissive: 0xff3d00, emissiveIntensity: 0.3 }),
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 2.78, -5.85);
    const net = new THREE.Mesh(
      new THREE.ConeGeometry(0.43, 0.62, 18, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.45 }),
    );
    net.position.set(0, 2.44, -5.85);
    hoopGroup.add(pole, backboard, rim, net);
    scene.add(hoopGroup);

    const player = createPlayer();
    player.position.set(positionRef.current.x, 0, positionRef.current.z);
    scene.add(player);
    playerGroupRef.current = player;

    const ball = createBasketball();
    ball.castShadow = true;
    scene.add(ball);
    ballRef.current = ball;

    const entryObjects = sceneEntries.map((entry, index) => {
      const object = createEntryObject(entry, index);
      scene.add(object);
      return object;
    });

    const clock = new THREE.Clock();
    let stateTick = 0;

    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', onResize);

    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const nextPosition = advancePlayer(positionRef.current, pressedKeysRef.current, 4.4, delta, courtBounds);
      positionRef.current = nextPosition;
      updateActiveEntry(nextPosition);

      stateTick += delta;
      if (stateTick > 0.08) {
        stateTick = 0;
        setPlayerPosition(nextPosition);
        if (chargeStartRef.current !== null) {
          setChargePercent(calculateChargePercent(performance.now() - chargeStartRef.current));
        }
      }

      const intent = getMovementIntent(pressedKeysRef.current);
      const isMoving = Math.hypot(intent.x, intent.z) > 0.01;
      const shot = shotRef.current;
      const shooting = Boolean(shot);
      const charging = chargeStartRef.current !== null;
      const chargeMs = chargeStartRef.current === null ? 0 : performance.now() - chargeStartRef.current;
      const shotProgress = shot ? Math.min(1, shot.frame / Math.max(1, HOME_PLAYER_ANIMATION.shot.followThroughFrames)) : 0;
      const motion = getHomePlayerMotion({ elapsed, isMoving, charging, shooting, chargeMs, shotProgress });

      player.position.lerp(new THREE.Vector3(nextPosition.x, motion.rig.y, nextPosition.z), 0.34);
      if (isMoving) {
        const targetAngle = Math.atan2(intent.x, intent.z);
        player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetAngle, 0.18);
      }
      player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, motion.rig.x, 0.2);
      player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, motion.rig.z, 0.2);

      const leftLeg = player.userData.leftLeg as THREE.Object3D;
      const rightLeg = player.userData.rightLeg as THREE.Object3D;
      const leftArm = player.userData.leftArm as THREE.Object3D;
      const rightArm = player.userData.rightArm as THREE.Object3D;
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, motion.leftLeg.x, 0.26);
      leftLeg.rotation.z = THREE.MathUtils.lerp(leftLeg.rotation.z, motion.leftLeg.z, 0.22);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, motion.rightLeg.x, 0.26);
      rightLeg.rotation.z = THREE.MathUtils.lerp(rightLeg.rotation.z, motion.rightLeg.z, 0.22);
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, motion.leftArm.x, 0.28);
      leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, motion.leftArm.z, 0.24);
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, motion.rightArm.x, 0.28);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, motion.rightArm.z, 0.24);

      if (shotRef.current && ballRef.current) {
        const currentShot = shotRef.current;
        const point = currentShot.path[Math.min(currentShot.frame, currentShot.path.length - 1)];
        ballRef.current.position.set(point.x, point.y, point.z);
        ballRef.current.rotation.x += motion.ballSpin.x;
        ballRef.current.rotation.z += motion.ballSpin.z;
        currentShot.frame += 1;

        if (currentShot.frame >= currentShot.path.length + HOME_PLAYER_ANIMATION.shot.followThroughFrames) {
          shotRef.current = null;
        }
      } else if (ballRef.current) {
        const localOffset = new THREE.Vector3(motion.ballOffset.x, motion.ballOffset.y, motion.ballOffset.z);
        localOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
        const ballPosition = player.position.clone().add(localOffset);
        ballRef.current.position.lerp(ballPosition, charging ? 0.5 : 0.78);
        ballRef.current.rotation.x += motion.ballSpin.x;
        ballRef.current.rotation.z += motion.ballSpin.z;
      }

      const oceanPositions = oceanGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < oceanPositions.count; i += 1) {
        const x = oceanPositions.getX(i);
        const y = oceanPositions.getY(i);
        oceanPositions.setZ(i, Math.sin(x * 0.35 + elapsed * 1.35) * 0.08 + Math.cos(y * 0.55 + elapsed) * 0.05);
      }
      oceanPositions.needsUpdate = true;

      entryObjects.forEach((object, index) => {
        object.rotation.y += 0.004 + index * 0.001;
        object.position.y = Math.sin(elapsed * 1.8 + index) * 0.05;
        const selected = activeEntryRef.current?.id === sceneEntries[index].id;
        const target = selected ? 1.22 : 1;
        object.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
      });

      camera.position.lerp(new THREE.Vector3(nextPosition.x * 0.2, 6.9, nextPosition.z + 10.3), 0.045);
      camera.lookAt(nextPosition.x * 0.18, 1.08, nextPosition.z - 2.2);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      skyTexture?.dispose();
      mount.removeChild(renderer.domElement);
      playerGroupRef.current = null;
      ballRef.current = null;
    };
  }, [updateActiveEntry]);

  useEffect(() => {
    positionRef.current = playerPosition;
    updateActiveEntry(playerPosition);
  }, [playerPosition, updateActiveEntry]);

  return (
    <section className="home-scene-page">
      <div className="sunset-backdrop" aria-hidden="true" />
      <div className="home-copy">
        <span className="eyebrow">SEASIDE SUNSET COURT</span>
        <h1>HoopVerse 篮球宇宙</h1>
        <p>海边夕阳球场、动态大海、3D 球员移动和投篮，把五大 NBA 知识入口放进一个可探索场景。</p>
      </div>

      <div className="scene-frame">
        <div ref={mountRef} className="three-mount" data-testid="three-mount">
          {webglFallback ? (
            <div className="webgl-fallback">
              <strong>3D 渲染不可用</strong>
              <span>当前浏览器或测试环境未开启 WebGL，真实浏览器访问本地服务即可看到球场。</span>
            </div>
          ) : null}
        </div>

        <div className="entry-ribbon" aria-label="首页场景入口">
          {entryLabels.map((entry) => (
            <button
              key={entry.id}
              className={`entry-chip${activeEntry?.id === entry.id ? ' active' : ''}`}
              style={entry.style}
              onClick={() => navigate(entry.path)}
              type="button"
            >
              <strong>{entry.label}</strong>
              <span>{entryDescription[entry.id]}</span>
            </button>
          ))}
        </div>

        <div className="control-panel">
          <div>
            <strong>方向键移动</strong>
            <span>支持斜向移动，按住 D 蓄力，松开 D 出手</span>
          </div>
          <div className="control-buttons" aria-label="触控移动按钮">
            <button type="button" onClick={() => move('ArrowUp')} aria-label="向上移动">
              <ArrowUp size={18} />
            </button>
            <button type="button" onClick={() => move('ArrowLeft')} aria-label="向左移动">
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onMouseDown={startCharge}
              onMouseUp={finishCharge}
              onMouseLeave={finishCharge}
              onTouchStart={startCharge}
              onTouchEnd={finishCharge}
              aria-label="投篮蓄力"
            >
              D
            </button>
            <button type="button" onClick={() => move('ArrowRight')} aria-label="向右移动">
              <ArrowRight size={18} />
            </button>
            <button type="button" onClick={() => move('ArrowDown')} aria-label="向下移动">
              <ArrowDown size={18} />
            </button>
          </div>
        </div>

        <div className="scene-status">
          <span>{shotFeedback}</span>
          {activeEntry ? (
            <button type="button" onClick={() => navigate(activeEntry.path)}>
              <CornerDownLeft size={16} />
              进入 {activeEntry.label}
            </button>
          ) : (
            <span>靠近发光区域会出现入口提示</span>
          )}
        </div>

        <div className={`charge-meter${isCharging ? ' charging' : ''}`} aria-label="投篮蓄力条">
          <div className="charge-track">
            <span className="perfect-zone" />
            <span className="charge-fill" style={{ width: `${chargePercent}%` }} />
          </div>
          <div className="charge-labels">
            <span>太短</span>
            <strong>{isCharging ? `${chargePercent}%` : '按住 D'}</strong>
            <span>太长</span>
          </div>
        </div>
      </div>
    </section>
  );
};
