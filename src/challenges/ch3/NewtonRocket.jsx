import { useEffect, useRef, useState } from 'react'
import { randInt, round } from '../../utils/physics'

function genScenario() {
  let d, m, f, tTarget, requiredF
  do {
    d = randInt(30, 70)
    m = randInt(20, 60)
    f = randInt(5, 20)
    tTarget = randInt(3, 8)
    const a = (2 * d) / (tTarget * tTarget)
    requiredF = a * m + f
  } while (requiredF < f + 5 || requiredF > 195)
  return { d, m, f, tTarget, requiredF: round(requiredF) }
}

function NewtonRocket({ onComplete }) {
  const [s] = useState(genScenario)
  const [force, setForce] = useState(50)
  const [pos, setPos] = useState(0)
  const [launching, setLaunching] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const rafRef = useRef(null)

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const launch = () => {
    if (launching) return
    const a = (force - s.f) / s.m
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setFeedback(null)

    if (a <= 0) {
      setFeedback({ ok: false, tooWeak: true })
      if (nextAttempts >= 4) {
        setTimeout(() => onComplete(1, `Force requise ≈ ${s.requiredF} N`), 900)
      }
      return
    }

    const t = Math.sqrt((2 * s.d) / a)
    setLaunching(true)
    const duration = Math.min(Math.max(t * 180, 700), 3200)
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      setPos(p * 100)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        finish(t, nextAttempts)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const finish = (t, nextAttempts) => {
    const ok = Math.abs(t - s.tTarget) <= 0.5
    setLaunching(false)
    if (ok) {
      const stars = nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1
      setFeedback({ ok: true, t: round(t) })
      setTimeout(() => onComplete(stars, `Temps: ${round(t)} s`), 800)
    } else if (nextAttempts >= 4) {
      setFeedback({ ok: false, t: round(t) })
      setTimeout(() => onComplete(1, `Force requise ≈ ${s.requiredF} N`), 1100)
    } else {
      setFeedback({ ok: false, t: round(t) })
      setPos(0)
    }
  }

  return (
    <div className="challenge-columns">
      <div>
        <div className="mrua-track">
          <div className="mrua-car" style={{ left: `${Math.min(pos, 95)}%` }}>🚀</div>
          <div className="finish-flag">🏁</div>
        </div>
        <div className="scenario-box">
          <p>Masse: <b>{s.m} kg</b> &nbsp; Friction: <b>{s.f} N</b> &nbsp; Distance: <b>{s.d} m</b></p>
          <p>Objectif: parcourir la distance en <b>{s.tTarget} s</b> (± 0.5 s)</p>
        </div>
      </div>
      <div className="challenge-controls">
        <label>
          Force appliquée: {force} N
          <input type="range" min="0" max="200" value={force} onChange={(e) => setForce(+e.target.value)} disabled={launching} />
        </label>
        <button className="btn-primary" onClick={launch} disabled={launching}>Lancer</button>
        {feedback?.tooWeak && <p className="feedback-bad">Force trop faible pour vaincre le frottement !</p>}
        {feedback?.ok && <p className="feedback-good">Objectif atteint en {feedback.t} s !</p>}
        {feedback && !feedback.ok && !feedback.tooWeak && (
          <p className="feedback-bad">Temps obtenu: {feedback.t} s. Essais restants: {Math.max(0, 3 - attempts)}</p>
        )}
        <p className="hint">a = (F − f) / m &nbsp; | &nbsp; d = ½at²</p>
      </div>
    </div>
  )
}

export default NewtonRocket
