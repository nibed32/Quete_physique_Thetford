import { useEffect, useRef, useState } from 'react'
import { randInt, round } from '../../utils/physics'

const W = 500
const H = 200
const TRACK_Y = 120
const COLLIDE_X = 220
const START_X = 50
const END_X = 460

function genScenario() {
  const m1 = randInt(2, 6)
  const m2 = randInt(2, 6)
  const v1 = randInt(4, 14)
  const vf = round((m1 * v1) / (m1 + m2), 1)
  const deltaKE = 0.5 * m1 * v1 * v1 - 0.5 * (m1 + m2) * vf * vf
  return { m1, m2, v1, vf, deltaKE }
}

function InelasticCollision({ onComplete }) {
  const [s] = useState(genScenario)
  const [answer, setAnswer] = useState('')
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const [step, setStep] = useState(1)
  const [trialAttempts, setTrialAttempts] = useState(0)
  const [keInput, setKeInput] = useState('')
  const [keAttempts, setKeAttempts] = useState(0)
  const [keFeedback, setKeFeedback] = useState(null)

  const draw = (x1 = START_X, x2 = COLLIDE_X, merged = false) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0f1830'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.beginPath()
    ctx.moveTo(0, TRACK_Y + 18)
    ctx.lineTo(W, TRACK_Y + 18)
    ctx.stroke()

    if (merged) {
      ctx.fillStyle = '#c77dff'
      ctx.beginPath()
      ctx.arc(x1, TRACK_Y, 19, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.font = '11px sans-serif'
      ctx.fillText('m1+m2', x1 - 16, TRACK_Y + 4)
    } else {
      ctx.fillStyle = 'var(--accent)'
      ctx.beginPath()
      ctx.arc(x1, TRACK_Y, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '11px sans-serif'
      ctx.fillText('m1', x1 - 9, TRACK_Y + 4)

      ctx.fillStyle = '#e0af2f'
      ctx.beginPath()
      ctx.arc(x2, TRACK_Y, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.fillText('m2', x2 - 9, TRACK_Y + 4)
    }
  }

  useEffect(() => { draw() }, [])
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const test = () => {
    if (running) return
    setRunning(true)
    setFeedback(null)
    const duration = 1000
    const start = performance.now()
    const stepFn = (now) => {
      const p = Math.min((now - start) / duration, 1)
      draw(START_X + (COLLIDE_X - START_X) * p, COLLIDE_X)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(stepFn)
      } else {
        phase2()
      }
    }
    rafRef.current = requestAnimationFrame(stepFn)
  }

  const phase2 = () => {
    const duration = 900
    const start = performance.now()
    const stepFn = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const x = COLLIDE_X + (END_X - COLLIDE_X) * p
      draw(x, x, true)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(stepFn)
      } else {
        finish()
      }
    }
    rafRef.current = requestAnimationFrame(stepFn)
  }

  const finish = () => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const val = parseFloat(answer)
    const ok = Math.abs(val - s.vf) <= 0.3
    setRunning(false)
    if (ok) {
      setFeedback({ ok: true })
      setTimeout(() => {
        setTrialAttempts(nextAttempts)
        setStep(2)
      }, 700)
    } else if (nextAttempts >= 3) {
      setFeedback({ ok: false, reveal: true })
      setTimeout(() => {
        setTrialAttempts(nextAttempts)
        setStep(2)
      }, 1200)
    } else {
      setFeedback({ ok: false })
    }
  }

  const keTolerance = Math.max(2, s.deltaKE * 0.08)

  const verifyKE = () => {
    const val = parseFloat(keInput)
    const next = keAttempts + 1
    setKeAttempts(next)
    const ok = Math.abs(val - s.deltaKE) <= keTolerance
    const extra = Math.max(0, trialAttempts - 1) + Math.max(0, next - 1)
    if (ok) {
      setKeFeedback({ ok: true })
      const stars = extra === 0 ? 3 : extra === 1 ? 2 : 1
      setTimeout(() => onComplete(stars), 700)
    } else if (next >= 3) {
      setKeFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `Énergie perdue = ${round(s.deltaKE)} J`), 1300)
    } else {
      setKeFeedback({ ok: false })
    }
  }

  if (step === 2) {
    return (
      <div className="challenge-columns">
        <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
        <div className="challenge-controls">
          <span className="step-badge">Étape 2 / 2 — Énergie perdue</span>
          <p className="step-complete">✓ vf = {s.vf} m/s</p>
          <p>Calcule l'énergie cinétique perdue lors du choc (m1 = {s.m1} kg, v1 = {s.v1} m/s, m2 = {s.m2} kg).</p>
          <label>
            ΔKE perdue (J)
            <input type="number" step="0.1" value={keInput} onChange={(e) => setKeInput(e.target.value)} />
          </label>
          <button className="btn-primary" onClick={verifyKE}>Vérifier</button>
          {keFeedback && !keFeedback.ok && (
            <p className="feedback-bad">{keFeedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct.'}</p>
          )}
          {keFeedback?.ok && <p className="feedback-good">Exact !</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="challenge-columns">
      <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
      <div className="challenge-controls">
        <span className="step-badge">Étape 1 / 2 — Vitesse commune</span>
        <p>m1 = {s.m1} kg à v1 = {s.v1} m/s percute m2 = {s.m2} kg (au repos). Choc parfaitement mou — ils restent collés.</p>
        <label>
          Prédis la vitesse finale commune (m/s)
          <input type="number" step="0.1" value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={running} />
        </label>
        <button className="btn-primary" onClick={test} disabled={running}>Tester ma prédiction</button>
        {feedback && !feedback.ok && (
          <p className="feedback-bad">{feedback.reveal ? 'Essais épuisés — passons à la suite.' : 'Pas encore correct, réessaie.'}</p>
        )}
        {feedback?.ok && <p className="feedback-good">Exact !</p>}
      </div>
    </div>
  )
}

export default InelasticCollision
