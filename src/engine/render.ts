import { geometricTunnelState, particleOrbitState, pendulumArrayState } from './generators'
import { hashSeed, normalizePhase, TAU } from './loop'
import { PALETTES, type LoopProject } from './project'

const polygon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, sides: number, rotation: number) => {
  ctx.beginPath()
  for (let side = 0; side <= sides; side += 1) {
    const angle = rotation + (side / sides) * TAU
    const px = x + Math.cos(angle) * radius
    const py = y + Math.sin(angle) * radius
    if (side === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  ctx.save()
  ctx.globalAlpha = 0.08
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  const spacing = width / 12
  for (let x = 0; x <= width; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = 0; y <= height; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }
  ctx.restore()
}

function drawOrbit(ctx: CanvasRenderingContext2D, width: number, height: number, project: LoopProject, phase: number) {
  const palette = PALETTES[project.paletteIndex]
  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) * (0.8 + project.energy / 500)
  const count = Math.round(project.density * 1.25)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(Math.sin(phase * TAU) * 0.08)
  ctx.translate(-cx, -cy)
  for (let ring = 0; ring < 6; ring += 1) {
    ctx.beginPath()
    ctx.ellipse(cx, cy, scale * (0.11 + ring * 0.065), scale * (0.09 + ring * 0.052), ring * 0.18, 0, TAU)
    ctx.strokeStyle = ring % 2 ? palette.accent : palette.secondary
    ctx.globalAlpha = 0.08 + ring * 0.025
    ctx.lineWidth = 1
    ctx.stroke()
  }
  const states = particleOrbitState(project.seed, phase, count)
  states.forEach((particle, index) => {
    const x = cx + particle.x * scale
    const y = cy + particle.y * scale
    const pulse = 0.68 + Math.sin(phase * TAU * (1 + index % 3) + index) * 0.32
    const radius = particle.size * (width / 540) * (0.7 + project.energy / 170)
    ctx.globalAlpha = 0.15 + particle.glow * 0.55
    ctx.fillStyle = index % 7 === 0 ? palette.secondary : index % 5 === 0 ? palette.accent : palette.primary
    ctx.shadowColor = ctx.fillStyle
    ctx.shadowBlur = radius * 4
    ctx.beginPath(); ctx.arc(x, y, radius * pulse, 0, TAU); ctx.fill()
  })
  ctx.restore()
}

function drawTunnel(ctx: CanvasRenderingContext2D, width: number, height: number, project: LoopProject, phase: number) {
  const palette = PALETTES[project.paletteIndex]
  const states = geometricTunnelState(project.seed, phase, Math.round(10 + project.density / 4))
  const cx = width / 2 + Math.sin(phase * TAU) * width * 0.08
  const cy = height / 2 + Math.cos(phase * TAU) * height * 0.04
  const sorted = [...states].sort((a, b) => b.depth - a.depth)
  sorted.forEach((shape, index) => {
    const eased = shape.depth ** 2
    const radius = 12 + eased * Math.max(width, height) * 0.72
    ctx.globalAlpha = 0.08 + (1 - shape.depth) * 0.75
    ctx.strokeStyle = index % 5 === 0 ? palette.secondary : index % 3 === 0 ? palette.accent : palette.primary
    ctx.lineWidth = Math.max(1, (1 - shape.depth) * width / 120)
    ctx.shadowColor = ctx.strokeStyle
    ctx.shadowBlur = width / 90
    polygon(ctx, cx, cy, radius, shape.sides, shape.rotation * (0.25 + project.energy / 180))
    ctx.stroke()
  })
  ctx.shadowBlur = 0
  ctx.globalAlpha = 0.7
  ctx.strokeStyle = palette.secondary
  ctx.beginPath(); ctx.moveTo(cx - 9, cy); ctx.lineTo(cx + 9, cy); ctx.moveTo(cx, cy - 9); ctx.lineTo(cx, cy + 9); ctx.stroke()
}

function drawPendulums(ctx: CanvasRenderingContext2D, width: number, height: number, project: LoopProject, phase: number) {
  const palette = PALETTES[project.paletteIndex]
  const count = Math.round(7 + project.density / 9)
  const states = pendulumArrayState(project.seed, phase, count)
  const baseline = height * 0.24
  states.forEach((pendulum, index) => {
    const anchorX = width * (0.08 + pendulum.anchorX * 0.84)
    const length = height * pendulum.length
    const boostedAngle = pendulum.angle * (0.45 + project.energy / 90)
    const bobX = anchorX + Math.sin(boostedAngle) * length
    const bobY = baseline + Math.cos(boostedAngle) * length
    ctx.globalAlpha = 0.24 + index / states.length * 0.5
    ctx.strokeStyle = index % 3 === 0 ? palette.secondary : palette.primary
    ctx.lineWidth = Math.max(1, width / 430)
    ctx.beginPath(); ctx.moveTo(anchorX, baseline); ctx.lineTo(bobX, bobY); ctx.stroke()
    ctx.globalAlpha = 0.9
    ctx.fillStyle = index % 4 === 0 ? palette.accent : palette.primary
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = width / 32
    ctx.beginPath(); ctx.arc(bobX, bobY, pendulum.size * width / 540, 0, TAU); ctx.fill()
    ctx.globalAlpha = 0.16
    ctx.beginPath(); ctx.arc(bobX, bobY, pendulum.size * width / 150, 0, TAU); ctx.fill()
  })
  ctx.shadowBlur = 0
  ctx.globalAlpha = 0.18
  ctx.strokeStyle = palette.accent
  for (let row = 0; row < 5; row += 1) {
    const waveY = height * (0.67 + row * 0.035)
    ctx.beginPath()
    for (let x = 0; x <= width; x += 6) {
      const y = waveY + Math.sin((x / width) * TAU * 3 + phase * TAU * (row + 1)) * height * 0.012
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

function drawFrame(ctx: CanvasRenderingContext2D, width: number, height: number, project: LoopProject, phase: number) {
  const palette = PALETTES[project.paletteIndex]
  ctx.save()
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, width, height)
  const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height * 0.65)
  glow.addColorStop(0, `${palette.accent}20`)
  glow.addColorStop(1, `${palette.background}00`)
  ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height)
  drawGrid(ctx, width, height, palette.primary)
  if (project.generator === 'particle-orbit') drawOrbit(ctx, width, height, project, phase)
  if (project.generator === 'geometric-tunnel') drawTunnel(ctx, width, height, project, phase)
  if (project.generator === 'pendulum-array') drawPendulums(ctx, width, height, project, phase)
  ctx.restore()
}

function drawOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, project: LoopProject, phase: number) {
  const palette = PALETTES[project.paletteIndex]
  const unit = width / 540
  ctx.save()
  ctx.globalAlpha = 1
  ctx.fillStyle = palette.primary
  ctx.font = `${11 * unit}px ui-monospace, monospace`
  ctx.textBaseline = 'top'
  ctx.fillText('13OS // LOOPFORGE', 24 * unit, 24 * unit)
  ctx.globalAlpha = 0.45
  ctx.fillText(`SEED ${project.seed.toUpperCase()}  //  ${(phase * 360).toFixed(1).padStart(5, '0')}°`, 24 * unit, 43 * unit)
  ctx.textAlign = 'right'
  ctx.fillText(`${project.duration.toFixed(1)}S / ${project.fps}FPS`, width - 24 * unit, 24 * unit)
  ctx.textAlign = 'left'
  ctx.strokeStyle = palette.secondary
  ctx.globalAlpha = 0.8
  ctx.lineWidth = unit
  const margin = 24 * unit
  const corner = 14 * unit
  ctx.beginPath()
  ctx.moveTo(margin, margin + corner); ctx.lineTo(margin, margin); ctx.lineTo(margin + corner, margin)
  ctx.moveTo(width - margin - corner, margin); ctx.lineTo(width - margin, margin); ctx.lineTo(width - margin, margin + corner)
  ctx.moveTo(margin, height - margin - corner); ctx.lineTo(margin, height - margin); ctx.lineTo(margin + corner, height - margin)
  ctx.moveTo(width - margin - corner, height - margin); ctx.lineTo(width - margin, height - margin); ctx.lineTo(width - margin, height - margin - corner)
  ctx.stroke()
  ctx.globalAlpha = 0.13
  const scanOffset = normalizePhase(phase * 5) * 6 * unit
  for (let y = scanOffset; y < height; y += 6 * unit) ctx.fillRect(0, y, width, unit)
  const noiseSeed = hashSeed(project.seed)
  ctx.globalAlpha = 0.12
  for (let i = 0; i < 28; i += 1) {
    const y = ((i * 83 + noiseSeed) % 960) / 960 * height
    const pulse = Math.sin(phase * TAU * (1 + i % 3) + i)
    if (pulse > 0.82) ctx.fillRect(0, y, width, unit * (1 + i % 2))
  }
  ctx.restore()
}

export function renderProject(ctx: CanvasRenderingContext2D, width: number, height: number, project: LoopProject, phaseValue: number) {
  const phase = normalizePhase(phaseValue)
  ctx.clearRect(0, 0, width, height)
  drawFrame(ctx, width, height, project, phase)
  drawOverlay(ctx, width, height, project, phase)
}
