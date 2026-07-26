import { useState } from 'react'
import { degToRad, radToDeg, randInt, randSigned, normalizeAngle360, round } from '../../utils/physics'

function genVector() {
  const magnitude = randInt(6, 14)
  const angle = randInt(15, 165)
  return { magnitude, angle }
}

function genComponents() {
  const wx = randSigned(3, 10)
  const wy = randSigned(3, 10)
  return { wx, wy }
}

function VectorDecomposition({ onComplete }) {
  const [step, setStep] = useState(1)
  const [vec] = useState(genVector)
  const [w] = useState(genComponents)

  const [vx, setVx] = useState('')
  const [vy, setVy] = useState('')
  const [attempts1, setAttempts1] = useState(0)
  const [feedback1, setFeedback1] = useState(null)

  const [wMag, setWMag] = useState('')
  const [wAngle, setWAngle] = useState('')
  const [attempts2, setAttempts2] = useState(0)
  const [feedback2, setFeedback2] = useState(null)

  const scale = 10
  const originX = 150
  const originY = 240
  const originY2 = 150
  const rad = degToRad(vec.angle)
  const tipX = originX + Math.cos(rad) * vec.magnitude * scale
  const tipY = originY - Math.sin(rad) * vec.magnitude * scale

  const correctVx = vec.magnitude * Math.cos(rad)
  const correctVy = vec.magnitude * Math.sin(rad)

  const wTipX = originX + w.wx * scale
  const wTipY = originY2 - w.wy * scale
  const correctWMag = Math.sqrt(w.wx * w.wx + w.wy * w.wy)
  const correctWAngle = normalizeAngle360(radToDeg(Math.atan2(w.wy, w.wx)))

  const finish = (extraAttempts) => {
    const stars = extraAttempts === 0 ? 3 : extraAttempts === 1 ? 2 : 1
    onComplete(stars)
  }

  const checkStep1 = () => {
    const userVx = parseFloat(vx)
    const userVy = parseFloat(vy)
    const ok = Math.abs(userVx - correctVx) <= 0.4 && Math.abs(userVy - correctVy) <= 0.4
    const next = attempts1 + 1
    setAttempts1(next)
    if (ok) {
      setFeedback1({ ok: true })
      setTimeout(() => setStep(2), 600)
    } else if (next >= 3) {
      setFeedback1({ ok: false, reveal: true })
      setTimeout(() => setStep(2), 1200)
    } else {
      setFeedback1({ ok: false })
    }
  }

  const checkStep2 = () => {
    const userMag = parseFloat(wMag)
    const userAngle = parseFloat(wAngle)
    const ok = Math.abs(userMag - correctWMag) <= 0.4 && Math.abs(((userAngle - correctWAngle + 540) % 360) - 180) <= 3
    const next = attempts2 + 1
    setAttempts2(next)
    if (ok) {
      setFeedback2({ ok: true })
      const extra = Math.max(0, attempts1 - 1) + Math.max(0, next - 1)
      setTimeout(() => finish(extra), 700)
    } else if (next >= 3) {
      setFeedback2({ ok: false, reveal: true })
      const extra = Math.max(0, attempts1 - 1) + Math.max(0, next - 1)
      setTimeout(() => finish(extra, `Réponse: |W| = ${round(correctWMag)}, θ = ${round(correctWAngle)}°`), 1400)
    } else {
      setFeedback2({ ok: false })
    }
  }

  return (
    <div className="challenge-columns">
      {step === 1 ? (
        <svg viewBox="0 0 300 300" className="challenge-svg">
          <line x1="0" y1={originY} x2="300" y2={originY} stroke="var(--grid)" strokeWidth="1" />
          <line x1={originX} y1="0" x2={originX} y2="300" stroke="var(--grid)" strokeWidth="1" />
          <defs>
            <marker id="arrowhead1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="var(--accent)" />
            </marker>
          </defs>
          <line x1={originX} y1={originY} x2={tipX} y2={tipY} stroke="var(--accent)" strokeWidth="3.5" markerEnd="url(#arrowhead1)" />
          <text x={tipX + 8} y={tipY} fill="var(--accent)" fontWeight="bold">V = {vec.magnitude} m/s</text>
          <text x={originX + 20} y={originY - 10} fill="var(--muted)" fontSize="13">θ = {vec.angle}°</text>
        </svg>
      ) : (
        <svg viewBox="0 0 300 300" className="challenge-svg">
          <line x1="0" y1={originY2} x2="300" y2={originY2} stroke="var(--grid)" strokeWidth="1" />
          <line x1={originX} y1="0" x2={originX} y2="300" stroke="var(--grid)" strokeWidth="1" />
          <defs>
            <marker id="arrowhead2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#e0af2f" />
            </marker>
          </defs>
          <line x1={originX} y1={originY2} x2={wTipX} y2={wTipY} stroke="#e0af2f" strokeWidth="3.5" markerEnd="url(#arrowhead2)" />
          <text x={originX + 20} y={originY2 - 10} fill="var(--muted)" fontSize="13">Wx = {w.wx} m/s, Wy = {w.wy} m/s</text>
        </svg>
      )}

      <div className="challenge-controls">
        {step === 1 ? (
          <>
            <span className="step-badge">Étape 1 / 2 — Décomposer</span>
            <label>
              Composante V<sub>x</sub> (m/s)
              <input type="number" step="0.1" value={vx} onChange={(e) => setVx(e.target.value)} />
            </label>
            <label>
              Composante V<sub>y</sub> (m/s)
              <input type="number" step="0.1" value={vy} onChange={(e) => setVy(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={checkStep1}>Vérifier</button>
            {feedback1 && !feedback1.ok && (
              <p className="feedback-bad">{feedback1.reveal ? 'Essais épuisés — passons à la suite.' : 'Pas encore correct, réessaie.'}</p>
            )}
            {feedback1?.ok && <p className="feedback-good">Exact !</p>}
          </>
        ) : (
          <>
            <span className="step-badge">Étape 2 / 2 — Recomposer</span>
            <p className="step-complete">✓ Premier signal trianguré</p>
            <p>Un second écho arrive avec les composantes Wx et Wy. Retrouve sa magnitude et son angle pour confirmer la position de la station.</p>
            <label>
              Magnitude |W| (m/s)
              <input type="number" step="0.1" value={wMag} onChange={(e) => setWMag(e.target.value)} />
            </label>
            <label>
              Angle θ (0° à 360°)
              <input type="number" step="0.1" value={wAngle} onChange={(e) => setWAngle(e.target.value)} />
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

export default VectorDecomposition
