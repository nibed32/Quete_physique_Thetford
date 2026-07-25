import { useState } from 'react'
import { randInt, round } from '../../utils/physics'

function genScenario() {
  let v0, a, t, vf
  do {
    v0 = randInt(2, 9)
    a = [-3, -2, -1, 1, 2, 3][randInt(0, 5)]
    t = randInt(2, 5)
    vf = v0 + a * t
  } while (vf < 0)
  const x = v0 * t + 0.5 * a * t * t
  return { v0, a, t, vf, x }
}

function MruaPrediction({ onComplete }) {
  const [s] = useState(genScenario)
  const [xAns, setXAns] = useState('')
  const [vAns, setVAns] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [animX, setAnimX] = useState(0)

  const trackLength = Math.max(Math.abs(s.x), 10) * 1.3

  const check = () => {
    const userX = parseFloat(xAns)
    const userV = parseFloat(vAns)
    const okX = Math.abs(userX - s.x) <= 0.5
    const okV = Math.abs(userV - s.vf) <= 0.3
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)

    if (okX && okV) {
      const stars = nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1
      setFeedback({ ok: true })
      setAnimX((s.x / trackLength) * 100)
      setTimeout(() => onComplete(stars), 900)
    } else if (nextAttempts >= 3) {
      setFeedback({ ok: false, reveal: true })
      setAnimX((s.x / trackLength) * 100)
      setTimeout(() => onComplete(1, `x = ${round(s.x)} m, v = ${round(s.vf)} m/s`), 1200)
    } else {
      setFeedback({ ok: false })
    }
  }

  return (
    <div className="challenge-columns">
      <div>
        <div className="mrua-track">
          <div className="mrua-car" style={{ left: `${Math.min(animX, 95)}%` }}>🚗</div>
        </div>
        <div className="scenario-box">
          <p>Une voiture part avec une vitesse initiale <b>v₀ = {s.v0} m/s</b></p>
          <p>et subit une accélération constante <b>a = {s.a} m/s²</b></p>
          <p>pendant <b>t = {s.t} s</b>.</p>
        </div>
      </div>
      <div className="challenge-controls">
        <label>
          Position finale x (m)
          <input type="number" step="0.1" value={xAns} onChange={(e) => setXAns(e.target.value)} />
        </label>
        <label>
          Vitesse finale v (m/s)
          <input type="number" step="0.1" value={vAns} onChange={(e) => setVAns(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={check}>Vérifier</button>
        {feedback && !feedback.ok && (
          <p className="feedback-bad">{feedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct, réessaie.'}</p>
        )}
        {feedback?.ok && <p className="feedback-good">Exact !</p>}
        <p className="hint">x = v₀t + ½at² &nbsp;|&nbsp; v = v₀ + at</p>
      </div>
    </div>
  )
}

export default MruaPrediction
