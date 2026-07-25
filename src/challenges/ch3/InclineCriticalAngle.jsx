import { useEffect, useRef, useState } from 'react'
import { degToRad, g, radToDeg, randRange, round } from '../../utils/physics'

const TRACK_LEN = 220

function InclineCriticalAngle({ onComplete }) {
  const [muS] = useState(() => round(randRange(0.25, 0.7), 2))
  const [angle, setAngle] = useState(20)
  const [slidePos, setSlidePos] = useState(0)
  const [testResult, setTestResult] = useState(null)
  const [answer, setAnswer] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const rafRef = useRef(null)

  const criticalAngle = radToDeg(Math.atan(muS))

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const test = () => {
    cancelAnimationFrame(rafRef.current)
    setSlidePos(0)
    const rad = degToRad(angle)
    const a = g * (Math.sin(rad) - muS * Math.cos(rad))
    if (a <= 0) {
      setTestResult('static')
      return
    }
    setTestResult('sliding')
    const start = performance.now()
    const step = (now) => {
      const t = (now - start) / 1000
      const s = 0.5 * a * t * t
      const p = Math.min(s / (TRACK_LEN / 40), 1)
      setSlidePos(p)
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const validate = () => {
    const val = parseFloat(answer)
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const ok = Math.abs(val - criticalAngle) <= 2
    if (ok) {
      const stars = nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1
      setFeedback({ ok: true })
      setTimeout(() => onComplete(stars), 700)
    } else if (nextAttempts >= 3) {
      setFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `Angle critique = ${round(criticalAngle)}°`), 1200)
    } else {
      setFeedback({ ok: false })
    }
  }

  const rad = degToRad(angle)
  const baseX = 40
  const baseY = 250
  const topX = baseX + TRACK_LEN * Math.cos(rad)
  const topY = baseY - TRACK_LEN * Math.sin(rad)
  const blockDist = slidePos * TRACK_LEN * 0.85
  const blockX = baseX + blockDist * Math.cos(rad)
  const blockY = baseY - blockDist * Math.sin(rad) - 10

  return (
    <div className="challenge-columns">
      <svg viewBox="0 0 300 280" className="challenge-svg">
        <polygon points={`40,250 ${topX},${topY} 40,${topY}`} fill="rgba(255,255,255,0.06)" stroke="var(--muted)" />
        <polygon points="0,250 300,250 300,260 0,260" fill="rgba(255,255,255,0.1)" />
        <g transform={`translate(${blockX},${blockY}) rotate(${-angle})`}>
          <rect x="-12" y="-12" width="24" height="24" fill="var(--accent)" rx="3" />
        </g>
        <text x="150" y="20" fill="var(--muted)" fontSize="13">μs = {muS}</text>
      </svg>
      <div className="challenge-controls">
        <p>Trouve l'angle critique où le bloc est sur le point de glisser (μs = {muS}).</p>
        <label>
          Angle d'essai: {angle}°
          <input type="range" min="0" max="60" value={angle} onChange={(e) => { setAngle(+e.target.value); setTestResult(null); setSlidePos(0) }} />
        </label>
        <button className="btn-secondary" onClick={test}>Tester</button>
        {testResult === 'static' && <p className="feedback-good">Le bloc reste immobile.</p>}
        {testResult === 'sliding' && <p className="feedback-bad">Le bloc glisse !</p>}
        <hr />
        <label>
          Ma réponse — angle critique (°)
          <input type="number" step="0.1" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={validate}>Valider</button>
        {feedback && !feedback.ok && (
          <p className="feedback-bad">{feedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct.'}</p>
        )}
        {feedback?.ok && <p className="feedback-good">Exact !</p>}
        <p className="hint">θc = arctan(μs)</p>
      </div>
    </div>
  )
}

export default InclineCriticalAngle
