import { useEffect, useRef, useState } from 'react'
import { randInt, round } from '../../utils/physics'

const W = 500
const H = 200
const TRACK_Y = 100
const CENTER_X = 250

function genScenario() {
  const m1 = randInt(2, 6)
  const m2 = randInt(2, 6)
  const v1 = randInt(4, 12)
  const v2 = round((-m1 * v1) / m2, 1)
  const keTotal = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2
  return { m1, m2, v1, v2, keTotal }
}

function MomentumExplosion({ onComplete }) {
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

  const draw = (x1 = CENTER_X, x2 = CENTER_X, exploded = false) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0f1830'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.beginPath()
    ctx.moveTo(0, TRACK_Y + 18)
    ctx.lineTo(W, TRACK_Y + 18)
    ctx.stroke()

    if (!exploded) {
      ctx.fillStyle = '#c77dff'
      ctx.beginPath()
      ctx.arc(CENTER_X, TRACK_Y, 19, 0, Math.PI * 2)
      ctx.fill()
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
    const val = parseFloat(answer) || 0
    const duration = 1100
    const start = performance.now()
    const x1End = CENTER_X + Math.max(s.v1, 1) * 15
    const x2End = CENTER_X - Math.max(Math.abs(val), 1) * 15 * (val < 0 ? 1 : -1)
    const stepFn = (now) => {
      const p = Math.min((now - start) / duration, 1)
      draw(CENTER_X + (x1End - CENTER_X) * p, CENTER_X + (x2End - CENTER_X) * p, true)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(stepFn)
      } else {
        finish(val)
      }
    }
    rafRef.current = requestAnimationFrame(stepFn)
  }

  const finish = (val) => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const ok = Math.abs(val - s.v2) <= 0.3
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

  const keTolerance = Math.max(2, s.keTotal * 0.08)

  const verifyKE = () => {
    const val = parseFloat(keInput)
    const next = keAttempts + 1
    setKeAttempts(next)
    const ok = Math.abs(val - s.keTotal) <= keTolerance
    const extra = Math.max(0, trialAttempts - 1) + Math.max(0, next - 1)
    if (ok) {
      setKeFeedback({ ok: true })
      const stars = extra === 0 ? 3 : extra === 1 ? 2 : 1
      setTimeout(() => onComplete(stars), 700)
    } else if (next >= 3) {
      setKeFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `Énergie libérée = ${round(s.keTotal)} J`), 1300)
    } else {
      setKeFeedback({ ok: false })
    }
  }

  if (step === 2) {
    return (
      <div className="challenge-columns">
        <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
        <div className="challenge-controls">
          <span className="step-badge">Étape 2 / 2 — Énergie libérée</span>
          <p className="step-complete">✓ v2 = {s.v2} m/s</p>
          <p>Calcule l'énergie cinétique totale libérée par l'explosion (m1 = {s.m1} kg, v1 = {s.v1} m/s, m2 = {s.m2} kg).</p>
          <label>
            KE totale (J)
            <input type="number" step="0.1" value={keInput} onChange={(e) => setKeInput(e.target.value)} />
          </label>
          <button className="btn-primary" onClick={verifyKE}>Vérifier</button>
          {keFeedback && !keFeedback.ok && (
            <p className="feedback-bad">{keFeedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct.'}</p>
          )}
          {keFeedback?.ok && <p className="feedback-good">Exact !</p>}
          <p className="hint">KE = ½m1v1² + ½m2v2²</p>
        </div>
      </div>
    )
  }

  return (
    <div className="challenge-columns">
      <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
      <div className="challenge-controls">
        <span className="step-badge">Étape 1 / 2 — Vitesse v2</span>
        <p>Un objet immobile explose en deux fragments : m1 = {s.m1} kg part vers la <b>droite</b> à v1 = {s.v1} m/s.</p>
        <p>m2 = {s.m2} kg. Trouve v2 (positif = droite, négatif = gauche) pour conserver la quantité de mouvement.</p>
        <label>
          v2 (m/s)
          <input type="number" step="0.1" value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={running} />
        </label>
        <button className="btn-primary" onClick={test} disabled={running}>Tester ma prédiction</button>
        {feedback && !feedback.ok && (
          <p className="feedback-bad">{feedback.reveal ? 'Essais épuisés — passons à la suite.' : 'Pas encore correct, réessaie.'}</p>
        )}
        {feedback?.ok && <p className="feedback-good">Exact !</p>}
        <p className="hint">m1v1 + m2v2 = 0</p>
      </div>
    </div>
  )
}

export default MomentumExplosion
