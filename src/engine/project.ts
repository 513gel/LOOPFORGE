import type { GeneratorId } from './generators'

export interface Palette {
  name: string
  background: string
  primary: string
  secondary: string
  accent: string
}

export const PALETTES: Palette[] = [
  { name: 'Oni Signal', background: '#06070a', primary: '#f0f2f5', secondary: '#ff334f', accent: '#7c5cff' },
  { name: 'Acid Terminal', background: '#040806', primary: '#d8ffe5', secondary: '#8bff4d', accent: '#12d6a0' },
  { name: 'Cold Shrine', background: '#050812', primary: '#e7f2ff', secondary: '#4fa8ff', accent: '#b562ff' },
  { name: 'Solar Static', background: '#0c0702', primary: '#fff4d6', secondary: '#ffad32', accent: '#ff4057' },
]

export interface LoopProject {
  version: 1
  generator: GeneratorId
  seed: string
  duration: number
  fps: 24 | 30 | 60
  paletteIndex: number
  density: number
  energy: number
}

export const DEFAULT_PROJECT: LoopProject = {
  version: 1,
  generator: 'particle-orbit',
  seed: 'ONI-13',
  duration: 6,
  fps: 30,
  paletteIndex: 0,
  density: 70,
  energy: 65,
}

export function isLoopProject(value: unknown): value is LoopProject {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<LoopProject>
  return item.version === 1
    && ['particle-orbit', 'geometric-tunnel', 'pendulum-array'].includes(item.generator ?? '')
    && typeof item.seed === 'string'
    && typeof item.duration === 'number' && item.duration >= 2 && item.duration <= 12
    && [24, 30, 60].includes(item.fps ?? 0)
    && typeof item.paletteIndex === 'number' && item.paletteIndex >= 0 && item.paletteIndex < PALETTES.length
    && typeof item.density === 'number' && item.density >= 20 && item.density <= 100
    && typeof item.energy === 'number' && item.energy >= 20 && item.energy <= 100
}
