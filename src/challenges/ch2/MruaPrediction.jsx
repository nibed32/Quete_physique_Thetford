import { useState } from 'react'
import { randInt, round } from '../../utils/physics'

function genScenario() {
  let v0, a1, t1, v1, a2, t2
  do {
    v0 = randInt(2, 9)
    a1 = [-3, -2, -1, 1, 2, 3][randInt(0, 5)]
    t1 = randInt(2, 5)
    v1 = v0 + a1 * t1
  } while (v1 < 1 || v1 > 20)
  const x1 = v0 * t1 + 0.5 * a1 * t1 * t1

  do {
    a2 = [-3, -2, -1, 1, 2, 3][randInt(0, 5)]
    t2 = randInt(2, 5)
  } while (v1 + a2 * t2 < -5)

  const x2 = v1 * t2 + 0.5 * a2 * t2 * t2
  const xTotal = x1 + x2
  return { v0, a1, t1, v1, a2, t2, x1, xTotal }
}

function MruaPrediction({ onComplete }) {
  const [s] = useState(genScenario)
  const [step, setStep] = useState(1)
  const [animX, setAnimX] = useState(0)

  const [v1Ans, setV1Ans] = useState('')
  const [attempts1, setAttempts1] = useState(0)
  const [feedback1, setFeedback1] = useState(null)

  const [xAns, setXAns] = useState('')
  const [attempts2, setAttempts2] = useState(0)
  const [feedback2, setFeedback2] = useState(null)

  const trackLength = Math.max(Math.abs(s.xTotal), 10) * 1.3

  const checkStep1 = () => {
    const userV1 = parseFloat(v1Ans)
    const ok = Math.abs(userV1 - s.v1) <= 0.3
    const next = attempts1 + 1
    setAttempts1(next)
    if (ok) {
      setFeedback1({ ok: true })
      setAnimX((s.x1 / trackLength) * 100)
      setTimeout(() => setStep(2), 700)
    } else if (next >= 3) {
      setFeedback1({ ok: false, reveal: true })
      setAnimX((s.x1 / trackLength) * 100)
      setTimeout(() => setStep(2), 1300)
    } else {
      setFeedback1({ ok: false })
    }
  }

  const checkStep2 = () => {
    const userX = parseFloat(xAns)
    const ok = Math.abs(userX - s.xTotal) <= 0.6
    const next = attempts2 + 1
    setAttempts2(next)
    const extra = Math.max(0, attempts1 - 1) + Math.max(0, next - 1)
    if (ok) {
      setFeedback2({ ok: true })
      setAnimX((s.xTotal / trackLength) * 100)
      const stars = extra === 0 ? 3 : extra === 1 ? 2 : 1
      setTimeout(() => onComplete(stars), 900)
    } else if (next >= 3) {
      setFeedback2({ ok: false, reveal: true })
      setAnimX((s.xTotal / trackLength) * 100)
      setTimeout(() => onComplete(1, `x total = ${round(s.xTotal)} m`), 1200)
    } else {
      setFeedback2({ ok: false })
    }
  }

  return (
    <div className="challenge-columns">
      <div>
        <div className="mrua-track">
          <div className="mrua-car" style={{ left: `${Math.min(animX, 95)}%` }}>🚗</div>
        </div>
        {step === 1 ? (
          <div className="scenario-box">
            <p>Une voiture part avec une vitesse initiale <b>v₀ = {s.v0} m/s</b></p>
            <p>et subit une accélération constante <b>a₁ = {s.a1} m/s²</b></p>
            <p>pendant <b>t₁ = {s.t1} s</b>.</p>
          </div>
        ) : (
          <div className="scenario-box">
            <p>À la fin de la phase 1, la voiture roule à <b>v₁ = {round(s.v1)} m/s</b>.</p>
            <p>Elle subit alors une nouvelle accélération <b>a₂ = {s.a2} m/s²</b></p>
            <p>pendant <b>t₂ = {s.t2} s</b>.</p>
          </div>
        )}
      </div>
      <div className="challenge-controls">
        {step === 1 ? (
          <>
            <span className="step-badge">Étape 1 / 2 — Phase 1</span>
            <label>
              Vitesse à la fin de la phase 1 (m/s)
              <input type="number" step="0.1" value={v1Ans} onChange={(e) => setV1Ans(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={checkStep1}>Vérifier</button>
            {feedback1 && !feedback1.ok && (
              <p className="feedback-bad">{feedback1.reveal ? 'Essais épuisés — passons à la suite.' : 'Pas encore correct, réessaie.'}</p>
            )}
            {feedback1?.ok && <p className="feedback-good">Exact !</p>}
          </>
        ) : (
          <>
            <span className="step-badge">Étape 2 / 2 — Phase 2</span>
            <p className="step-complete">✓ Phase 1 terminée</p>
            <label>
              Position finale totale (m, depuis le départ)
              <input type="number" step="0.1" value={xAns} onChange={(e) => setXAns(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={checkStep2}>Vérifier</button>
            {feedback2 && !feedback2.ok && (
              <p className="feedback-bad">{feedback2.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct, réessaie.'}</p>
            )}
            {feedback2?.ok && <p className="feedback-good">Exact !</p>}
          </>
        )}
      </div>
    </div>
  )
}

export default MruaPrediction
