import { describe, expect, it } from 'vitest'
import { geometricTunnelState, particleOrbitState, pendulumArrayState } from './generators'

const expectNumericStateClose = (left: object[], right: object[]) => {
  expect(left).toHaveLength(right.length)
  left.forEach((item, index) => {
    const expected = right[index] as Record<string, number>
    Object.entries(item as Record<string, number>).forEach(([key, value]) => {
      expect(value).toBeCloseTo(expected[key], 10)
    })
  })
}

describe('generator determinism and seam equivalence', () => {
  const phase = 0.271828

  it('Particle Orbit is deterministic and periodic', () => {
    const state = particleOrbitState('signal', phase, 24)
    expect(state).toEqual(particleOrbitState('signal', phase, 24))
    expectNumericStateClose(state, particleOrbitState('signal', phase + 1, 24))
    expect(state).not.toEqual(particleOrbitState('different', phase, 24))
  })

  it('Geometric Tunnel is deterministic and periodic', () => {
    const state = geometricTunnelState('signal', phase, 18)
    expect(state).toEqual(geometricTunnelState('signal', phase, 18))
    expectNumericStateClose(state, geometricTunnelState('signal', phase + 1, 18))
    expect(state).not.toEqual(geometricTunnelState('different', phase, 18))
  })

  it('Pendulum Array is deterministic and periodic', () => {
    const state = pendulumArrayState('signal', phase, 11)
    expect(state).toEqual(pendulumArrayState('signal', phase, 11))
    expectNumericStateClose(state, pendulumArrayState('signal', phase + 1, 11))
    expect(state).not.toEqual(pendulumArrayState('different', phase, 11))
  })
})
