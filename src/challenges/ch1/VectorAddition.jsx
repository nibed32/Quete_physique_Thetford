import { useRef, useState } from 'react'
import { degToRad, randInt, round, radToDeg } from '../../utils/physics'

const SCALE = 16
const A_ORIGIN = { x: 55, y: 235 }
const SNAP_RADIUS = 20

function genArrow(magRange, angleRange) {
  const magnitude = randInt(...magRange)
  const angle = randInt(...angleRange)
  return { magnitude, angle }
}

function tipOf(origin, arrow) {
  const rad = degToRad(arrow.angle)
  return {
    x: origin.x + Math.cos(rad) * arrow.magnitude * SCALE,
    y: origin.y - Math.sin(rad) * arrow.magnitude * SCALE,
  }
}

function VectorAddition({ onComplete }) {
  const [A] = useState(() => genArrow([4, 8], [20, 70]))
  const [B] = useState(() => genArrow([4, 8], [90, 160]))
  const aTip = tipOf(A_ORIGIN, A)
  const [bTail, setBTail] = useState({ x: 230, y: 90 })
  const [snapped, setSnapped] = useState(false)
  const [misses, setMisses] = useState(0)
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const bTailRef = useRef(bTail)

  const [rMagInput, setRMagInput] = useState('')
  const [rAngleInput, setRAngleInput] = useState('')
  const [calcAttempts, setCalcAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const bTip = {
    x: bTail.x + Math.cos(degToRad(B.angle)) * B.magnitude * SCALE,
    y: bTail.y - Math.sin(degToRad(B.angle)) * B.magnitude * SCALE,
  }

  const svgPoint = (e, el) => {
    const svg = el.ownerSVGElement || el
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 300
    const y = ((e.clientY - rect.top) / rect.height) * 300
    return { x, y }
  }

  const onPointerDown = (e) => {
    if (snapped) return
    e.target.setPointerCapture(e.pointerId)
    dragging.current = true
    const p = svgPoint(e, e.currentTarget)
    dragOffset.current = { x: p.x - bTail.x, y: p.y - bTail.y }
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    const p = svgPoint(e, e.currentTarget)
    const next = { x: p.x - dragOffset.current.x, y: p.y - dragOffset.current.y }
    bTailRef.current = next
    setBTail(next)
  }

  const onPointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    const dx = bTailRef.current.x - aTip.x
    const dy = bTailRef.current.y - aTip.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= SNAP_RADIUS) {
      setBTail({ x: aTip.x, y: aTip.y })
      setSnapped(true)
    } else {
      setMisses((m) => m + 1)
    }
  }

  const rx = A.magnitude * Math.cos(degToRad(A.angle)) + B.magnitude * Math.cos(degToRad(B.angle))
  const ry = A.magnitude * Math.sin(degToRad(A.angle)) + B.magnitude * Math.sin(degToRad(B.angle))
  const correctRMag = Math.sqrt(rx * rx + ry * ry)
  const correctRAngle = radToDeg(Math.atan2(ry, rx))

  const checkResultant = () => {
    const userMag = parseFloat(rMagInput)
    const userAngle = parseFloat(rAngleInput)
    const ok = Math.abs(userMag - correctRMag) <= 0.5 && Math.abs(userAngle - correctRAngle) <= 3
    const next = calcAttempts + 1
    setCalcAttempts(next)
    const extra = misses + Math.max(0, next - 1)
    if (ok) {
      setFeedback({ ok: true })
      const stars = extra === 0 ? 3 : extra === 1 ? 2 : 1
      setTimeout(() => onComplete(stars, `Résultante R = ${round(correctRMag)} m/s à ${round(correctRAngle)}°`), 700)
    } else if (next >= 3) {
      setFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `Résultante R = ${round(correctRMag)} m/s à ${round(correctRAngle)}°`), 1300)
    } else {
      setFeedback({ ok: false })
    }
  }

  return (
    <div className="challenge-columns">
      <svg viewBox="0 0 300 300" className="challenge-svg" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <defs>
          <marker id="arrowA" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="var(--accent)" />
          </marker>
          <marker id="arrowB" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#e0af2f" />
          </marker>
        </defs>

        <line x1={A_ORIGIN.x} y1={A_ORIGIN.y} x2={aTip.x} y2={aTip.y} stroke="var(--accent)" strokeWidth="3.5" markerEnd="url(#arrowA)" />
        <text x={A_ORIGIN.x - 10} y={A_ORIGIN.y + 18} fill="var(--accent)" fontWeight="bold">A ({A.magnitude} m/s, {A.angle}°)</text>

        {snapped && (
          <line x1={A_ORIGIN.x} y1={A_ORIGIN.y} x2={bTip.x} y2={bTip.y} stroke="#7ee787" strokeWidth="3" strokeDasharray="6 4" />
        )}

        <g onPointerDown={onPointerDown} style={{ cursor: snapped ? 'default' : 'grab' }}>
          <line x1={bTail.x} y1={bTail.y} x2={bTip.x} y2={bTip.y} stroke="#e0af2f" strokeWidth="3.5" markerEnd="url(#arrowB)" />
          <circle cx={bTail.x} cy={bTail.y} r="10" fill="#e0af2f" opacity="0.25" />
        </g>
        <text x={bTail.x - 16} y={bTail.y - 10} fill="#e0af2f" fontWeight="bold">B ({B.magnitude} m/s, {B.angle}°)</text>

        {!snapped && <circle cx={aTip.x} cy={aTip.y} r={SNAP_RADIUS} fill="none" stroke="var(--accent)" strokeDasharray="3 3" opacity="0.6" />}
      </svg>

      <div className="challenge-controls">
        {!snapped ? (
          <>
            <span className="step-badge">Étape 1 / 2 — Assembler</span>
            <p>Les propulseurs de correction <b style={{ color: 'var(--accent)' }}>A</b> et <b style={{ color: '#e0af2f' }}>B</b> poussent la station dans des directions différentes. Fais glisser <b style={{ color: '#e0af2f' }}>B</b> pour l'ajouter à la pointe de <b style={{ color: 'var(--accent)' }}>A</b> (méthode bout-à-bout).</p>
            <p className="hint">Tentatives ratées : {misses}</p>
            <p className="hint">Relâche près de la pointe de A pour l'accrocher.</p>
          </>
        ) : (
          <>
            <span className="step-badge">Étape 2 / 2 — Calculer</span>
            <p className="step-complete">✓ Poussées assemblées</p>
            <p>Calcule la magnitude et l'angle de la poussée résultante R (en vert) qui va réellement déplacer la station.</p>
            <label>
              Magnitude |R| (m/s)
              <input type="number" step="0.1" value={rMagInput} onChange={(e) => setRMagInput(e.target.value)} />
            </label>
            <label>
              Angle θ (°)
              <input type="number" step="0.1" value={rAngleInput} onChange={(e) => setRAngleInput(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={checkResultant}>Vérifier</button>
            {feedback && !feedback.ok && (
              <p className="feedback-bad">{feedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct, réessaie.'}</p>
            )}
            {feedback?.ok && <p className="feedback-good">Exact !</p>}
          </>
        )}
      </div>
    </div>
  )
}

export default VectorAddition
