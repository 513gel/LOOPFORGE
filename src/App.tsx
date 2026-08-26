import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { GENERATORS, type GeneratorId } from './engine/generators'
import { renderProject } from './engine/render'
import { DEFAULT_PROJECT, isLoopProject, PALETTES, type LoopProject } from './engine/project'
import { normalizePhase } from './engine/loop'

const STORAGE_KEY = '13os:loopforge:project:v1'

function readStoredProject(): LoopProject {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return isLoopProject(saved) ? saved : DEFAULT_PROJECT
  } catch {
    return DEFAULT_PROJECT
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function App() {
  const [project, setProject] = useState<LoopProject>(readStoredProject)
  const [phase, setPhase] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [notice, setNotice] = useState('SYSTEM READY')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const phaseRef = useRef(phase)
  const projectRef = useRef(project)

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => {
    projectRef.current = project
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
  }, [project])

  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const elapsed = Math.min(100, now - previous)
      previous = now
      if (playing) {
        const next = normalizePhase(phaseRef.current + elapsed / 1000 / projectRef.current.duration)
        phaseRef.current = next
        setPhase(next)
      }
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      if (canvas && context) renderProject(context, canvas.width, canvas.height, projectRef.current, phaseRef.current)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  const update = useCallback(<K extends keyof LoopProject>(key: K, value: LoopProject[K]) => {
    setProject((current) => ({ ...current, [key]: value }))
  }, [])

  const setGenerator = (generator: GeneratorId) => {
    update('generator', generator)
    setPhase(0)
    phaseRef.current = 0
    setNotice('GENERATOR LOADED')
  }

  const randomizeSeed = () => {
    const seed = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()
    update('seed', seed)
    setNotice(`SEED ${seed}`)
  }

  const saveSnapshot = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const context = canvas.getContext('2d')
    if (!context) return
    renderProject(context, canvas.width, canvas.height, project, phase)
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `loopforge-${project.generator}-${project.seed}.png`)
    }, 'image/png')
    setNotice('SNAPSHOT RENDERED 1080×1920')
  }

  const exportProject = () => {
    downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `loopforge-${project.seed}.json`)
    setNotice('PROJECT EXPORTED')
  }

  const importProject = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const candidate = JSON.parse(await file.text())
      if (!isLoopProject(candidate)) throw new Error('Invalid project')
      setProject(candidate)
      setPhase(0)
      setNotice('PROJECT IMPORTED')
    } catch {
      setNotice('IMPORT REJECTED — INVALID PROJECT')
    } finally {
      event.target.value = ''
    }
  }

  const activeGenerator = GENERATORS.find((item) => item.id === project.generator)!
  const totalFrames = Math.round(project.duration * project.fps)

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="https://13thoni.com" aria-label="13th Oni home">
          <span className="brand-mark">十三</span>
          <span><strong>LOOPFORGE</strong><small>13OS GENERATIVE SYSTEMS</small></span>
        </a>
        <div className="system-readout"><i /> LOCAL PROCESSING <span>V0.1</span></div>
      </header>

      <main className="workspace">
        <aside className="panel generator-panel">
          <div className="panel-heading"><span>01</span> GENERATOR</div>
          <nav className="generator-list" aria-label="Loop generators">
            {GENERATORS.map((generator, index) => (
              <button
                className={generator.id === project.generator ? 'generator active' : 'generator'}
                key={generator.id}
                onClick={() => setGenerator(generator.id)}
              >
                <span className="index">0{index + 1}</span>
                <span><strong>{generator.name}</strong><small>{generator.code}</small></span>
              </button>
            ))}
          </nav>
          <div className="spec-card">
            <span>ACTIVE MODULE</span>
            <strong>{activeGenerator.code}</strong>
            <p>{activeGenerator.blurb}</p>
          </div>
        </aside>

        <section className="stage-column">
          <div className="stage-header">
            <span>LIVE LOOP // {activeGenerator.name.toUpperCase()}</span>
            <span className="frame-counter">FRAME {Math.floor(phase * totalFrames).toString().padStart(3, '0')} / {totalFrames}</span>
          </div>
          <div className="canvas-shell">
            <canvas ref={canvasRef} width="540" height="960" aria-label="Generated seamless loop preview" />
            <div className="canvas-badge">9:16</div>
            <div className="signal-bars"><i /><i /><i /><i /></div>
          </div>
          <div className="transport">
            <button className="transport-button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? 'Ⅱ' : '▶'}
            </button>
            <label className="timeline">
              <span className="sr-only">Loop phase</span>
              <input
                type="range" min="0" max="0.9999" step="0.0001" value={phase}
                onChange={(event) => { setPlaying(false); setPhase(Number(event.target.value)) }}
              />
            </label>
            <button className="mini-button" onClick={() => { setPhase(0); phaseRef.current = 0 }}>↺</button>
            <span className="timecode">{(phase * project.duration).toFixed(2)} / {project.duration.toFixed(2)} SEC</span>
          </div>
        </section>

        <aside className="panel controls-panel">
          <div className="panel-heading"><span>02</span> PARAMETERS</div>
          <div className="control-group">
            <label htmlFor="seed">SEED</label>
            <div className="input-row">
              <input id="seed" value={project.seed} maxLength={24} onChange={(event) => update('seed', event.target.value || '0')} />
              <button className="dice" onClick={randomizeSeed} title="Randomize seed">✣</button>
            </div>
          </div>
          <div className="control-split">
            <label>DURATION<select value={project.duration} onChange={(event) => update('duration', Number(event.target.value))}>
              {[2, 4, 6, 8, 10, 12].map((value) => <option key={value} value={value}>{value} SEC</option>)}
            </select></label>
            <label>FRAME RATE<select value={project.fps} onChange={(event) => update('fps', Number(event.target.value) as LoopProject['fps'])}>
              {[24, 30, 60].map((value) => <option key={value} value={value}>{value} FPS</option>)}
            </select></label>
          </div>
          <Slider label="DENSITY" value={project.density} onChange={(value) => update('density', value)} />
          <Slider label="ENERGY" value={project.energy} onChange={(value) => update('energy', value)} />
          <div className="control-group palette-control">
            <label>PALETTE</label>
            <div className="palette-grid">
              {PALETTES.map((palette, index) => (
                <button
                  key={palette.name}
                  className={index === project.paletteIndex ? 'palette active' : 'palette'}
                  onClick={() => update('paletteIndex', index)} title={palette.name}
                >
                  <i style={{ background: palette.background }} /><i style={{ background: palette.primary }} />
                  <i style={{ background: palette.secondary }} /><i style={{ background: palette.accent }} />
                </button>
              ))}
            </div>
            <span className="palette-name">{PALETTES[project.paletteIndex].name}</span>
          </div>
          <div className="export-stack">
            <button className="primary-action" onClick={saveSnapshot}><span>↓</span> EXPORT PNG <small>1080 × 1920</small></button>
            <div className="project-actions">
              <button onClick={exportProject}>SAVE PROJECT</button>
              <button onClick={() => fileRef.current?.click()}>LOAD PROJECT</button>
            </div>
            <input className="sr-only" ref={fileRef} type="file" accept="application/json,.json" onChange={importProject} />
          </div>
        </aside>
      </main>

      <footer className="statusbar">
        <span><i /> {notice}</span>
        <span>DETERMINISTIC // {totalFrames} UNIQUE FRAMES // NO CLOUD</span>
      </footer>
    </div>
  )
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="slider-control">
      <span>{label}<b>{value}%</b></span>
      <input type="range" min="20" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}
