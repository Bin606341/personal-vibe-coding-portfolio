import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { describe, expect, test } from 'vitest';
import { computeVisibleGeometryBounds, fitObjectToVisibleHeight } from './basketballCharacter';

const modelPath = join(process.cwd(), 'public', 'models', 'basketball-player', 'player.glb');
const sourcePath = join(process.cwd(), 'public', 'models', 'basketball-player', 'player.source.json');

const parseGlbJson = (buffer: Buffer) => {
  expect(buffer.toString('utf8', 0, 4)).toBe('glTF');
  expect(buffer.readUInt32LE(4)).toBe(2);
  expect(buffer.readUInt32LE(8)).toBe(buffer.byteLength);

  const jsonChunkLength = buffer.readUInt32LE(12);
  const jsonChunkType = buffer.toString('utf8', 16, 20);
  expect(jsonChunkType).toBe('JSON');

  return JSON.parse(buffer.toString('utf8', 20, 20 + jsonChunkLength).trim());
};

describe('basketball player GLB asset', () => {
  test('ships a real animated player.glb with CC0 source metadata', () => {
    expect(existsSync(modelPath)).toBe(true);
    expect(existsSync(sourcePath)).toBe(true);

    const gltf = parseGlbJson(readFileSync(modelPath));
    expect(gltf.asset?.version).toBe('2.0');
    expect(gltf.nodes?.length ?? 0).toBeGreaterThan(0);
    expect(gltf.meshes?.length ?? 0).toBeGreaterThan(0);
    expect(gltf.animations?.length ?? 0).toBeGreaterThan(0);

    const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
    expect(source.license).toBe('CC0 1.0');
    expect(source.sourceUrl).toBe('https://poly.pizza/m/HMnuH5geEG');
    expect(source.downloadUrl).toMatch(/\.glb$/);
  });

  test('normalizes the shipped player by visible geometry instead of skinned animation bounds', async () => {
    const buffer = readFileSync(modelPath);
    const gltf = await new Promise<Awaited<ReturnType<GLTFLoader['parseAsync']>>>((resolve, reject) => {
      const arrayBuffer = new ArrayBuffer(buffer.byteLength);
      new Uint8Array(arrayBuffer).set(buffer);
      new GLTFLoader().parse(arrayBuffer, '', resolve, reject);
    });

    const animationBounds = new THREE.Box3().setFromObject(gltf.scene);
    const animationSize = new THREE.Vector3();
    animationBounds.getSize(animationSize);
    const rawVisibleBounds = computeVisibleGeometryBounds(gltf.scene);
    const rawVisibleSize = new THREE.Vector3();
    rawVisibleBounds?.getSize(rawVisibleSize);

    const fit = fitObjectToVisibleHeight(gltf.scene, 2.02);
    const normalizedVisibleBounds = computeVisibleGeometryBounds(gltf.scene);
    const normalizedVisibleSize = new THREE.Vector3();
    normalizedVisibleBounds?.getSize(normalizedVisibleSize);

    expect(rawVisibleBounds).toBeTruthy();
    expect(animationSize.y).toBeGreaterThan(rawVisibleSize.y * 10);
    expect(fit.visible).toBe(true);
    expect(normalizedVisibleSize.y).toBeCloseTo(2.02, 2);
    expect(normalizedVisibleBounds?.min.y).toBeCloseTo(0);
  });
});
