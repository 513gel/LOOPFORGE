import { describe, expect, it } from 'vitest'
import { exportFramePhases, framePhase, normalizePhase, seededValue } from './loop'

describe('loop clock', () => {
  it('normalizes any whole-cycle offset to the same phase', () => {
    expect(normalizePhase(0.375)).toBeCloseTo(normalizePhase(14.375), 12)
    expect(normalizePhase(-0.625)).toBeCloseTo(0.375, 12)
  })

  it('exports exactly N unique phases without a duplicate terminal frame', () => {
    const phases = exportFramePhases(180)
    expect(phases).toHaveLength(180)
    expect(new Set(phases).size).toBe(180)
    expect(phases[0]).toBe(0)
    expect(phases.at(-1)).toBe(179 / 180)
    expect(phases).not.toContain(1)
  })

  it('rejects frame indices outside the export range', () => {
    expect(() => framePhase(60, 60)).toThrow(RangeError)
    expect(() => framePhase(-1, 60)).toThrow(RangeError)
  })

  it('derives stable deterministic values from seed and index', () => {
    expect(seededValue('ONI-13', 42)).toBe(seededValue('ONI-13', 42))
    expect(seededValue('ONI-13', 42)).not.toBe(seededValue('ONI-14', 42))
  })
})
