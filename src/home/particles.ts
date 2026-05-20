import type { Point } from './levels';

export type ConfettiParticle = Point & {
  id: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
};

const COLORS = ['#ff6b35', '#ffd166', '#06d6a0', '#4cc9f0', '#f72585', '#8338ec'];

export const createConfetti = (origin: Point, count = 36): ConfettiParticle[] =>
  Array.from({ length: count }, (_, index) => {
    const angle = (-Math.PI * 0.95) + (Math.PI * 1.9 * index) / Math.max(count - 1, 1);
    const speed = 180 + (index % 6) * 32 + Math.random() * 40;

    return {
      id: `confetti-${index}-${Math.round(Math.random() * 100000)}`,
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      life: 0,
      maxLife: 1 + Math.random() * 0.8,
      size: 8 + (index % 4) * 2,
      rotation: Math.random() * 360,
      spin: -540 + Math.random() * 1080,
      color: COLORS[index % COLORS.length],
    };
  });

export const stepConfetti = (particles: ConfettiParticle[], deltaSeconds: number): ConfettiParticle[] =>
  particles
    .map((particle) => {
      const nextLife = particle.life + deltaSeconds;
      return {
        ...particle,
        life: nextLife,
        x: particle.x + particle.vx * deltaSeconds,
        y: particle.y + particle.vy * deltaSeconds,
        vy: particle.vy + 680 * deltaSeconds,
        rotation: particle.rotation + particle.spin * deltaSeconds,
      };
    })
    .filter((particle) => particle.life < particle.maxLife);
