import { useEffect, useRef, useState } from 'react'
import { randInt, round } from '../../utils/physics'

const W = 500
const H = 200
const TRACK_Y = 120
const COLLIDE_X = 220
const START_X = 50
const END_X = 470

function genScenario() {
  const m1 = randInt(1, 5)
  const m2 = randInt(1, 5)
  const hiddenV1 = randInt(4, 14)
  const targetV2 = round((2 * m1 * hiddenV1) / (m1 + m2), 1)
  return { m1, m2, targetV2 }
}

function ElasticCollision({ onComplete }) {
  const [s] = useState(genScenario)
  const [v1, setV1] = useState(8)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const [step, setStep] = useState(1)
  const [hitStats, setHitStats] = useState(null) // { v1used, trialAttempts }
  const [v1pInput, setV1pInput] = useState('')
  const [v1pAttempts, setV1pAttempts] = useState(0)
  const [v1pFeedback, setV1pFeedback] = useState(null)

  const draw = (x1 = START_X, x2 = COLLIDE_X) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0f1830'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.beginPath()
    ctx.moveTo(0, TRACK_Y + 18)
    ctx.lineTo(W, TRACK_Y + 18)
    ctx.stroke()

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

  useEffect(() => { draw() }, [])
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const v1p = ((s.m1 - s.m2) / (s.m1 + s.m2)) * v1
  const v2p = (2 * s.m1 / (s.m1 + s.m2)) * v1

  const launch = () => {
    if (running) return
    setRunning(true)
    setFeedback(null)
    const phase1Duration = 1000
    const start = performance.now()

    const step1 = (now) => {
      const p = Math.min((now - start) / phase1Duration, 1)
      draw(START_X + (COLLIDE_X - START_X) * p, COLLIDE_X)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step1)
      } else {
        phase2()
      }
    }
    rafRef.current = requestAnimationFrame(step1)
  }

  const phase2 = () => {
    const phase2Duration = 900
    const start = performance.now()
    const x1End = v1p >= 0 ? COLLIDE_X + 40 : START_X
    const step2 = (now) => {
      const p = Math.min((now - start) / phase2Duration, 1)
      const x1 = COLLIDE_X + (x1End - COLLIDE_X) * p
      const x2 = COLLIDE_X + (END_X - COLLIDE_X) * p
      draw(x1, x2)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step2)
      } else {
        finish()
      }
    }
    rafRef.current = requestAnimationFrame(step2)
  }

  const finish = () => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const ok = Math.abs(v2p - s.targetV2) <= 0.3
    setRunning(false)
    if (ok) {
      setFeedback({ ok: true })
      setTimeout(() => {
        setHitStats({ v1used: v1, trialAttempts: nextAttempts })
        setStep(2)
      }, 700)
    } else if (nextAttempts >= 4) {
      setFeedback({ ok: false })
      setTimeout(() => onComplete(1, `v2' obtenue: ${round(v2p, 1)} m/s (visé: ${s.targetV2} m/s)`), 1000)
    } else {
      setFeedback({ ok: false, v2p: round(v2p, 1) })
    }
  }

  const correctV1p = hitStats ? ((s.m1 - s.m2) / (s.m1 + s.m2)) * hitStats.v1used : 0

  const verifyV1p = () => {
    const val = parseFloat(v1pInput)
    const next = v1pAttempts + 1
    setV1pAttempts(next)
    const ok = Math.abs(val - correctV1p) <= 0.3
    const extra = Math.max(0, hitStats.trialAttempts - 1) + Math.max(0, next - 1)
    if (ok) {
      setV1pFeedback({ ok: true })
      const stars = extra === 0 ? 3 : extra === 1 ? 2 : 1
      setTimeout(() => onComplete(stars), 700)
    } else if (next >= 3) {
      setV1pFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `v1' = ${round(correctV1p, 1)} m/s`), 1300)
    } else {
      setV1pFeedback({ ok: false })
    }
  }

  if (step === 2) {
    return (
      <div className="challenge-columns">
        <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
        <div className="challenge-controls">
          <span className="step-badge">Étape 2 / 2 — Rebond de m1</span>
          <p className="step-complete">✓ v2' obtenue avec v1 = {hitStats.v1used} m/s</p>
          <p>Calcule maintenant la vitesse de m1 après le choc (v1').</p>
          <label>
            v1' (m/s, le signe indique la direction)
            <input type="number" step="0.1" value={v1pInput} onChange={(e) => setV1pInput(e.target.value)} />
          </label>
          <button className="btn-primary" onClick={verifyV1p}>Vérifier</button>
          {v1pFeedback && !v1pFeedback.ok && (
            <p className="feedback-bad">{v1pFeedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct.'}</p>
          )}
          {v1pFeedback?.ok && <p className="feedback-good">Exact !</p>}
          <p className="hint">v1' = (m1 − m2)v1 / (m1 + m2)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="challenge-columns">
      <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
      <div className="challenge-controls">
        <span className="step-badge">Étape 1 / 2 — Viser v2'</span>
        <p>m1 = {s.m1} kg, m2 = {s.m2} kg (choc élastique, m2 au repos).</p>
        <p>Trouve la vitesse initiale v1 pour que le palet 2 reparte à <b>{s.targetV2} m/s</b>.</p>
        <label>
          Vitesse initiale v1: {v1} m/s
          <input type="range" min="1" max="15" value={v1} onChange={(e) => setV1(+e.target.value)} disabled={running} />
        </label>
        <button className="btn-primary" onClick={launch} disabled={running}>Lancer</button>
        {feedback && !feedback.ok && <p className="feedback-bad">v2' obtenue: {feedback.v2p} m/s. Essais restants: {Math.max(0, 3 - attempts)}</p>}
        {feedback?.ok && <p className="feedback-good">Précis !</p>}
        <p className="hint">v2' = 2m1v1 / (m1+m2)</p>
      </div>
    </div>
  )
}

export default ElasticCollision
