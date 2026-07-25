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

  const [step, setStep] = useState(1)
  const [hitStats, setHitStats] = useState(null) // { a, t, trialAttempts }
  const [vInput, setVInput] = useState('')
  const [vAttempts, setVAttempts] = useState(0)
  const [vFeedback, setVFeedback] = useState(null)

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
        finish(t, a, nextAttempts)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const finish = (t, a, nextAttempts) => {
    const ok = Math.abs(t - s.tTarget) <= 0.5
    setLaunching(false)
    if (ok) {
      setFeedback({ ok: true, t: round(t) })
      setTimeout(() => {
        setHitStats({ a, t, trialAttempts: nextAttempts })
        setStep(2)
      }, 800)
    } else if (nextAttempts >= 4) {
      setFeedback({ ok: false, t: round(t) })
      setTimeout(() => onComplete(1, `Force requise ≈ ${s.requiredF} N`), 1100)
    } else {
      setFeedback({ ok: false, t: round(t) })
      setPos(0)
    }
  }

  const correctV = hitStats ? hitStats.a * hitStats.t : 0

  const verifyV = () => {
    const val = parseFloat(vInput)
    const next = vAttempts + 1
    setVAttempts(next)
    const ok = Math.abs(val - correctV) <= 0.5
    const extra = Math.max(0, hitStats.trialAttempts - 1) + Math.max(0, next - 1)
    if (ok) {
      setVFeedback({ ok: true })
      const stars = extra === 0 ? 3 : extra === 1 ? 2 : 1
      setTimeout(() => onComplete(stars), 700)
    } else if (next >= 3) {
      setVFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `v = ${round(correctV)} m/s`), 1300)
    } else {
      setVFeedback({ ok: false })
    }
  }

  if (step === 2) {
    return (
      <div className="challenge-columns">
        <div>
          <div className="mrua-track">
            <div className="mrua-car" style={{ left: '92%' }}>🚀</div>
            <div className="finish-flag">🏁</div>
          </div>
          <div className="scenario-box">
            <p>Objectif atteint en {round(hitStats.t)} s avec une accélération de {round(hitStats.a)} m/s².</p>
          </div>
        </div>
        <div className="challenge-controls">
          <span className="step-badge">Étape 2 / 2 — Vitesse finale</span>
          <p className="step-complete">✓ Distance parcourue avec succès</p>
          <p>Calcule la vitesse atteinte à la fin du trajet.</p>
          <label>
            Vitesse finale (m/s)
            <input type="number" step="0.1" value={vInput} onChange={(e) => setVInput(e.target.value)} />
          </label>
          <button className="btn-primary" onClick={verifyV}>Vérifier</button>
          {vFeedback && !vFeedback.ok && (
            <p className="feedback-bad">{vFeedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct.'}</p>
          )}
          {vFeedback?.ok && <p className="feedback-good">Exact !</p>}
          <p className="hint">v = a·t</p>
        </div>
      </div>
    )
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
        <span className="step-badge">Étape 1 / 2 — Bonne force</span>
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
