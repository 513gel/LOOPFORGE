import { normalizePhase, seededValue, TAU } from './loop'

export type GeneratorId = 'particle-orbit' | 'geometric-tunnel' | 'pendulum-array'

export interface ParticleState {
  x: number
  y: number
  size: number
  glow: number
}

export interface PendulumState {
  anchorX: number
  length: number
  angle: number
  size: number
}

export interface TunnelState {
  depth: number
  rotation: number
  sides: number
}

export function particleOrbitState(seed: string, phaseValue: number, count = 72): ParticleState[] {
  const phase = normalizePhase(phaseValue)
  return Array.from({ length: count }, (_, index) => {
    const lane = index % 6
    const randomA = seededValue(seed, index * 4)
    const randomB = seededValue(seed, index * 4 + 1)
    const radius = 0.12 + lane * 0.065 + randomA * 0.035
    const speed = lane % 2 === 0 ? lane + 1 : -(lane + 1)
    const angle = randomB * TAU + phase * TAU * speed
    const verticalScale = 0.72 + seededValue(seed, index * 4 + 2) * 0.18
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * verticalScale,
      size: 1.2 + seededValue(seed, index * 4 + 3) * 4.8,
      glow: 0.3 + randomA * 0.7,
    }
  })
}

export function pendulumArrayState(seed: string, phaseValue: number, count = 13): PendulumState[] {
  const phase = normalizePhase(phaseValue)
  return Array.from({ length: count }, (_, index) => {
    const frequency = 1 + (index % 4)
    const offset = seededValue(seed, index) * TAU
    const amplitude = 0.28 + seededValue(seed, index + 100) * 0.22
    return {
      anchorX: count === 1 ? 0.5 : index / (count - 1),
      length: 0.23 + seededValue(seed, index + 200) * 0.22,
      angle: Math.sin(phase * TAU * frequency + offset) * amplitude,
      size: 7 + seededValue(seed, index + 300) * 8,
    }
  })
}

export function geometricTunnelState(seed: string, phaseValue: number, count = 22): TunnelState[] {
  const phase = normalizePhase(phaseValue)
  const sides = 4 + Math.floor(seededValue(seed, 0) * 4)
  return Array.from({ length: count }, (_, index) => ({
    depth: normalizePhase(index / count + phase),
    rotation: phase * TAU * 2 + index * 0.11 + seededValue(seed, index + 1) * 0.08,
    sides,
  }))
}

export const GENERATORS: Array<{ id: GeneratorId; name: string; code: string; blurb: string }> = [
  { id: 'particle-orbit', name: 'Particle Orbit', code: 'ORBIT_01', blurb: 'Nested orbital swarms with integer-cycle motion.' },
  { id: 'geometric-tunnel', name: 'Geometric Tunnel', code: 'TUNNEL_02', blurb: 'Depth-wrapped wireframes collapsing into infinity.' },
  { id: 'pendulum-array', name: 'Pendulum Array', code: 'PENDULUM_03', blurb: 'Phase-locked kinetic instruments with harmonic timing.' },
]
