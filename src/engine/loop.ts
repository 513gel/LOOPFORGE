export const TAU = Math.PI * 2

export function normalizePhase(value: number): number {
  return ((value % 1) + 1) % 1
}

export function framePhase(frameIndex: number, frameCount: number): number {
  if (!Number.isInteger(frameCount) || frameCount < 1) {
    throw new RangeError('frameCount must be a positive integer')
  }
  if (!Number.isInteger(frameIndex) || frameIndex < 0 || frameIndex >= frameCount) {
    throw new RangeError('frameIndex must be within the exported frame range')
  }
  return frameIndex / frameCount
}

export function exportFramePhases(frameCount: number): number[] {
  return Array.from({ length: frameCount }, (_, index) => framePhase(index, frameCount))
}

export function hashSeed(seed: string): number {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function seededValue(seed: string, index: number): number {
  let value = hashSeed(`${seed}:${index}`) + 0x6d2b79f5
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296
}
