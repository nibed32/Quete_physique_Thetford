import { useEffect, useRef, useState } from 'react'
import { degToRad, g, randInt, round } from '../../utils/physics'

const W = 500
const H = 280
const GROUND_Y = 250
const CANNON_X = 40
const PX_PER_M = 5.5

function ProjectileTarget({ onComplete }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const [angle, setAngle] = useState(45)
  const [speed, setSpeed] = useState(15)
  const [attempts, setAttempts] = useState(0)
  const [firing, setFiring] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [target] = useState(() => {
    const dist = randInt(22, 62)
    return { min: dist - 3, max: dist + 3, center: dist }
  })

  const [phase, setPhase] = useState('aim')
  const [hitStats, setHitStats] = useState(null) // { angle, speed, trialAttempts }
  const [tInput, setTInput] = useState('')
  const [hInput, setHInput] = useState('')
  const [analysisAttempts, setAnalysisAttempts] = useState(0)
  const [analysisFeedback, setAnalysisFeedback] = useState(null)

  const draw = (ballX = null, ballY = null) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0f1830'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.moveTo(0, GROUND_Y)
    ctx.lineTo(W, GROUND_Y)
    ctx.stroke()

    const tx1 = CANNON_X + target.min * PX_PER_M
    const tx2 = CANNON_X + target.max * PX_PER_M
    ctx.fillStyle = 'rgba(126,231,135,0.35)'
    ctx.fillRect(tx1, GROUND_Y - 4, tx2 - tx1, 4)
    ctx.fillStyle = '#7ee787'
    ctx.beginPath()
    ctx.moveTo(CANNON_X + target.center * PX_PER_M, GROUND_Y)
    ctx.lineTo(CANNON_X + target.center * PX_PER_M, GROUND_Y - 30)
    ctx.lineTo(CANNON_X + target.center * PX_PER_M + 14, GROUND_Y - 24)
    ctx.lineTo(CANNON_X + target.center * PX_PER_M, GROUND_Y - 18)
    ctx.fill()

    ctx.fillStyle = '#c9410c'
    ctx.save()
    ctx.translate(CANNON_X, GROUND_Y)
    ctx.rotate(-degToRad(angle))
    ctx.fillRect(0, -5, 28, 10)
    ctx.restore()

    if (ballX !== null) {
      ctx.fillStyle = '#ffd166'
      ctx.beginPath()
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle, target])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const fire = () => {
    if (firing) return
    setFiring(true)
    setFeedback(null)
    const rad = degToRad(angle)
    const vx = speed * Math.cos(rad)
    const vy = speed * Math.sin(rad)
    const start = performance.now()

    const step = (now) => {
      const t = (now - start) / 1000
      const x = vx * t
      const y = vy * t - 0.5 * g * t * t
      if (y >= 0) {
        draw(CANNON_X + x * PX_PER_M, GROUND_Y - y * PX_PER_M)
        rafRef.current = requestAnimationFrame(step)
      } else {
        const landingX = round((vx * vy * 2) / g, 1)
        draw(CANNON_X + landingX * PX_PER_M, GROUND_Y)
        finish(landingX)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const finish = (landingX) => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const hit = landingX >= target.min && landingX <= target.max
    if (hit) {
      setFeedback({ ok: true })
      setTimeout(() => {
        setHitStats({ angle, speed, trialAttempts: nextAttempts })
        setPhase('analyze')
      }, 700)
    } else if (nextAttempts >= 4) {
      setFeedback({ ok: false })
      setTimeout(() => onComplete(1, `Portée obtenue: ${landingX} m (cible: ${target.center} m)`), 900)
    } else {
      setFeedback({ ok: false, retry: true, landingX })
      setFiring(false)
    }
  }

  const rad = hitStats ? degToRad(hitStats.angle) : 0
  const correctT = hitStats ? (2 * hitStats.speed * Math.sin(rad)) / g : 0
  const correctH = hitStats ? Math.pow(hitStats.speed * Math.sin(rad), 2) / (2 * g) : 0

  const checkAnalysis = () => {
    const userT = parseFloat(tInput)
    const userH = parseFloat(hInput)
    const ok = Math.abs(userT - correctT) <= 0.25 && Math.abs(userH - correctH) <= 0.6
    const next = analysisAttempts + 1
    setAnalysisAttempts(next)
    const extra = Math.max(0, hitStats.trialAttempts - 1) + Math.max(0, next - 1)
    if (ok) {
      setAnalysisFeedback({ ok: true })
      const stars = extra === 0 ? 3 : extra === 1 ? 2 : 1
      setTimeout(() => onComplete(stars), 700)
    } else if (next >= 3) {
      setAnalysisFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `t = ${round(correctT)} s, h_max = ${round(correctH)} m`), 1300)
    } else {
      setAnalysisFeedback({ ok: false })
    }
  }

  if (phase === 'analyze') {
    return (
      <div className="challenge-columns">
        <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
        <div className="challenge-controls">
          <span className="step-badge">Étape 2 / 2 — Analyser le tir</span>
          <p className="step-complete">✓ Cible atteinte (angle {hitStats.angle}°, vitesse {hitStats.speed} m/s)</p>
          <p>Calcule le temps de vol total et la hauteur maximale de ce tir.</p>
          <label>
            Temps de vol total (s)
            <input type="number" step="0.01" value={tInput} onChange={(e) => setTInput(e.target.value)} />
          </label>
          <label>
            Hauteur maximale (m)
            <input type="number" step="0.1" value={hInput} onChange={(e) => setHInput(e.target.value)} />
          </label>
          <button className="btn-primary" onClick={checkAnalysis}>Vérifier</button>
          {analysisFeedback && !analysisFeedback.ok && (
            <p className="feedback-bad">{analysisFeedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct, réessaie.'}</p>
          )}
          {analysisFeedback?.ok && <p className="feedback-good">Exact !</p>}
          <p className="hint">t = 2v·sin(θ)/g &nbsp; | &nbsp; h_max = (v·sin(θ))² / (2g)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="challenge-columns">
      <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
      <div className="challenge-controls">
        <span className="step-badge">Étape 1 / 2 — Viser</span>
        <p>Ajuste l'angle et la vitesse pour atteindre la cible verte à {target.center} m.</p>
        <label>
          Angle: {angle}°
          <input type="range" min="10" max="80" value={angle} onChange={(e) => setAngle(+e.target.value)} disabled={firing} />
        </label>
        <label>
          Vitesse: {speed} m/s
          <input type="range" min="5" max="30" value={speed} onChange={(e) => setSpeed(+e.target.value)} disabled={firing} />
        </label>
        <button className="btn-primary" onClick={fire} disabled={firing}>Tirer</button>
        {feedback?.retry && <p className="feedback-bad">Raté ! Portée obtenue: {feedback.landingX} m. Essais restants: {3 - attempts}</p>}
        {feedback?.ok && <p className="feedback-good">Cible atteinte !</p>}
      </div>
    </div>
  )
}

export default ProjectileTarget
