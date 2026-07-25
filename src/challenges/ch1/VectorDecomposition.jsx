import { useState } from 'react'
import { degToRad, randInt, round } from '../../utils/physics'

function genVector() {
  const magnitude = randInt(6, 14)
  const angle = randInt(15, 165)
  return { magnitude, angle }
}

function VectorDecomposition({ onComplete }) {
  const [vec, setVec] = useState(genVector)
  const [vx, setVx] = useState('')
  const [vy, setVy] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const scale = 14
  const originX = 150
  const originY = 240
  const rad = degToRad(vec.angle)
  const tipX = originX + Math.cos(rad) * vec.magnitude * scale
  const tipY = originY - Math.sin(rad) * vec.magnitude * scale

  const correctVx = vec.magnitude * Math.cos(rad)
  const correctVy = vec.magnitude * Math.sin(rad)

  const check = () => {
    const userVx = parseFloat(vx)
    const userVy = parseFloat(vy)
    const okVx = Math.abs(userVx - correctVx) <= 0.4
    const okVy = Math.abs(userVy - correctVy) <= 0.4
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)

    if (okVx && okVy) {
      const stars = nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1
      setFeedback({ ok: true })
      setTimeout(() => onComplete(stars), 700)
    } else if (nextAttempts >= 3) {
      setFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `Réponse: Vx = ${round(correctVx)}, Vy = ${round(correctVy)}`), 1400)
    } else {
      setFeedback({ ok: false, reveal: false })
    }
  }

  return (
    <div className="challenge-columns">
      <svg viewBox="0 0 300 300" className="challenge-svg">
        <line x1="0" y1={originY} x2="300" y2={originY} stroke="var(--grid)" strokeWidth="1" />
        <line x1={originX} y1="0" x2={originX} y2="300" stroke="var(--grid)" strokeWidth="1" />
        {Array.from({ length: 15 }).map((_, i) => (
          <line key={'v' + i} x1={i * 20} y1="0" x2={i * 20} y2="300" stroke="var(--grid)" strokeWidth="0.5" opacity="0.3" />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <line key={'h' + i} x1="0" y1={i * 20} x2="300" y2={i * 20} stroke="var(--grid)" strokeWidth="0.5" opacity="0.3" />
        ))}
        <defs>
          <marker id="arrowhead1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="var(--accent)" />
          </marker>
        </defs>
        <line x1={originX} y1={originY} x2={tipX} y2={tipY} stroke="var(--accent)" strokeWidth="3.5" markerEnd="url(#arrowhead1)" />
        <text x={tipX + 8} y={tipY} fill="var(--accent)" fontWeight="bold">V = {vec.magnitude} m/s</text>
        <text x={originX + 20} y={originY - 10} fill="var(--muted)" fontSize="13">θ = {vec.angle}°</text>
      </svg>

      <div className="challenge-controls">
        <label>
          Composante V<sub>x</sub> (m/s)
          <input type="number" step="0.1" value={vx} onChange={(e) => setVx(e.target.value)} />
        </label>
        <label>
          Composante V<sub>y</sub> (m/s)
          <input type="number" step="0.1" value={vy} onChange={(e) => setVy(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={check}>Vérifier</button>
        {feedback && !feedback.ok && (
          <p className="feedback-bad">
            {feedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct, réessaie.'}
          </p>
        )}
        {feedback && feedback.ok && <p className="feedback-good">Exact !</p>}
        <p className="hint">Astuce: Vx = V·cos(θ), Vy = V·sin(θ)</p>
      </div>
    </div>
  )
}

export default VectorDecomposition
