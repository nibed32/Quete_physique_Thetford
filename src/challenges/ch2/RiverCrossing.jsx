import { useEffect, useRef, useState } from 'react'
import { degToRad, randInt, round } from '../../utils/physics'

const W = 500
const H = 280
const TOP_Y = 25
const BOTTOM_Y = 255
const START_X = 250
const PX_PER_M = (BOTTOM_Y - TOP_Y) / 40
const RIVER_WIDTH_M = 40
const TOLERANCE_M = 4

function driftAndTime(vR, vK, angleDeg) {
  const theta = degToRad(angleDeg)
  const gx = vR - vK * Math.sin(theta)
  const gyMag = vK * Math.cos(theta)
  const time = RIVER_WIDTH_M / gyMag
  return { drift: gx * time, time }
}

function RiverCrossing({ onComplete }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const [vR] = useState(() => randInt(2, 4))
  const [vK] = useState(() => randInt(6, 9))
  const [testAngle] = useState(() => randInt(15, 35))
  const [angle, setAngle] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [paddling, setPaddling] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [step, setStep] = useState(1)
  const [driftInput, setDriftInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [predAttempts, setPredAttempts] = useState(0)
  const [predFeedback, setPredFeedback] = useState(null)

  const testResult = driftAndTime(vR, vK, testAngle)

  const draw = (kayakX = START_X, kayakY = BOTTOM_Y) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#5c4a33'
    ctx.fillRect(0, 0, W, TOP_Y)
    ctx.fillRect(0, BOTTOM_Y, W, H - BOTTOM_Y)
    ctx.fillStyle = '#1a4f7a'
    ctx.fillRect(0, TOP_Y, W, BOTTOM_Y - TOP_Y)

    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1.5
    for (let y = TOP_Y + 20; y < BOTTOM_Y; y += 35) {
      for (let x = 20; x < W - 20; x += 70) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 20, y)
        ctx.lineTo(x + 14, y - 4)
        ctx.moveTo(x + 20, y)
        ctx.lineTo(x + 14, y + 4)
        ctx.stroke()
      }
    }

    const tolPx = TOLERANCE_M * PX_PER_M
    ctx.fillStyle = 'rgba(126,231,135,0.35)'
    ctx.fillRect(START_X - tolPx, TOP_Y - 6, tolPx * 2, 6)
    ctx.fillStyle = '#e0af2f'
    ctx.beginPath()
    ctx.arc(START_X, BOTTOM_Y, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = '20px sans-serif'
    ctx.fillText('🤖', kayakX - 10, kayakY + 6)
  }

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const checkPrediction = () => {
    const userDrift = parseFloat(driftInput)
    const userTime = parseFloat(timeInput)
    const ok = Math.abs(userDrift - testResult.drift) <= 0.8 && Math.abs(userTime - testResult.time) <= 0.3
    const next = predAttempts + 1
    setPredAttempts(next)
    if (ok) {
      setPredFeedback({ ok: true })
      setTimeout(() => setStep(2), 700)
    } else if (next >= 3) {
      setPredFeedback({ ok: false, reveal: true })
      setTimeout(() => setStep(2), 1300)
    } else {
      setPredFeedback({ ok: false })
    }
  }

  const paddle = () => {
    if (paddling) return
    setPaddling(true)
    setFeedback(null)
    const { drift: driftM, time } = driftAndTime(vR, vK, angle)
    const endX = START_X + driftM * PX_PER_M

    const duration = 1800
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const x = START_X + (endX - START_X) * p
      const y = BOTTOM_Y + (TOP_Y - BOTTOM_Y) * p
      draw(x, y)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        finish(round(driftM, 1))
      }
    }
    rafRef.current = requestAnimationFrame(step)
    void time
  }

  const finish = (driftM) => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const hit = Math.abs(driftM) <= TOLERANCE_M
    const extra = Math.max(0, predAttempts - 1) + Math.max(0, nextAttempts - 1)
    if (hit) {
      const stars = extra === 0 ? 3 : extra === 1 ? 2 : 1
      setFeedback({ ok: true })
      setTimeout(() => onComplete(stars, `Dérive: ${driftM} m`), 700)
    } else if (nextAttempts >= 4) {
      setFeedback({ ok: false })
      const idealAngle = round((Math.asin(vR / vK) * 180) / Math.PI)
      setTimeout(() => onComplete(1, `Angle idéal ≈ ${idealAngle}° vers l'amont`), 900)
    } else {
      setFeedback({ ok: false, retry: true, driftM })
      setPaddling(false)
    }
  }

  return (
    <div className="challenge-columns">
      <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
      <div className="challenge-controls">
        <p>Flux de refroidissement: {vR} m/s → &nbsp; Vitesse du drone: {vK} m/s &nbsp; | &nbsp; Largeur du canal: {RIVER_WIDTH_M} m</p>
        {step === 1 ? (
          <>
            <span className="step-badge">Étape 1 / 2 — Prédire</span>
            <p>Si le drone de maintenance part avec un angle de <b>{testAngle}°</b> vers l'amont, calcule sa dérive et le temps de traversée du canal.</p>
            <label>
              Dérive (m, + = aval, − = amont)
              <input type="number" step="0.1" value={driftInput} onChange={(e) => setDriftInput(e.target.value)} />
            </label>
            <label>
              Temps de traversée (s)
              <input type="number" step="0.1" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={checkPrediction}>Vérifier</button>
            {predFeedback && !predFeedback.ok && (
              <p className="feedback-bad">{predFeedback.reveal ? 'Essais épuisés — passons à la suite.' : 'Pas encore correct, réessaie.'}</p>
            )}
            {predFeedback?.ok && <p className="feedback-good">Exact !</p>}
          </>
        ) : (
          <>
            <span className="step-badge">Étape 2 / 2 — Traverser</span>
            <p className="step-complete">✓ Prédiction validée</p>
            <p>Oriente le drone pour qu'il arrive pile dans la zone verte, en face de son point de départ.</p>
            <label>
              Angle vers l'amont: {angle}°
              <input type="range" min="-50" max="50" value={angle} onChange={(e) => setAngle(+e.target.value)} disabled={paddling} />
            </label>
            <button className="btn-primary" onClick={paddle} disabled={paddling}>Avancer</button>
            {feedback?.retry && <p className="feedback-bad">Dérive de {feedback.driftM} m. Essais restants: {3 - attempts}</p>}
            {feedback?.ok && <p className="feedback-good">Drone arrimé avec précision !</p>}
          </>
        )}
      </div>
    </div>
  )
}

export default RiverCrossing
