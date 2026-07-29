import { useRef, useState } from 'react'
import { degToRad, randInt, round, radToDeg } from '../../utils/physics'

const SNAP_RADIUS = 20
const MARGIN = 34
const CANVAS = 300
const DRAW = CANVAS - 2 * MARGIN
const MAX_SCALE = 24

const LABELS = ['A', 'B', 'C', 'D']
const COLORS = ['var(--accent)', '#e0af2f', '#c77dff', '#5fd68a']
const START_SPOTS = [
  { x: 254, y: 46 },
  { x: 46, y: 254 },
  { x: 254, y: 254 },
]

function genArrow(magRange, angleRange) {
  const magnitude = randInt(...magRange)
  const angle = randInt(...angleRange)
  return { magnitude, angle }
}

function vecXY(v) {
  const rad = degToRad(v.angle)
  return { x: Math.cos(rad) * v.magnitude, y: Math.sin(rad) * v.magnitude }
}

function VectorAddition({ onComplete }) {
  const [vectors] = useState(() => [
    genArrow([4, 9], [15, 75]),
    genArrow([4, 9], [-65, 65]),
    genArrow([4, 9], [-65, 65]),
    genArrow([4, 9], [-65, 65]),
  ])

  // Path in physics-space (origin at 0,0), one point per vector tip.
  const points = [{ x: 0, y: 0 }]
  vectors.forEach((v) => {
    const d = vecXY(v)
    const prev = points[points.length - 1]
    points.push({ x: prev.x + d.x, y: prev.y + d.y })
  })

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = maxX - minX
  const spanY = maxY - minY
  // Scale is derived from the actual generated path so it always fits the viewBox, whatever the random values.
  const scale = Math.min(spanX > 0.01 ? DRAW / spanX : MAX_SCALE, spanY > 0.01 ? DRAW / spanY : MAX_SCALE, MAX_SCALE)

  const toScreen = (p) => ({
    x: MARGIN + (p.x - minX) * scale,
    y: CANVAS - MARGIN - (p.y - minY) * scale,
  })

  const anchors = points.map(toScreen) // anchors[0] = départ, anchors[4] = arrivée

  const [tails, setTails] = useState(START_SPOTS)
  const [snapped, setSnapped] = useState([false, false, false])
  const tailsRef = useRef(tails)
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragging = useRef(null)
  const [misses, setMisses] = useState(0)

  const [rMagInput, setRMagInput] = useState('')
  const [rAngleInput, setRAngleInput] = useState('')
  const [calcAttempts, setCalcAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const activeIndex = snapped.findIndex((s) => !s)
  const allSnapped = activeIndex === -1

  const tipOfDraggable = (i, tail) => {
    const d = vecXY(vectors[i + 1])
    return { x: tail.x + d.x * scale, y: tail.y - d.y * scale }
  }

  const svgPoint = (e, el) => {
    const svg = el.ownerSVGElement || el
    const rect = svg.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS,
    }
  }

  const onPointerDown = (i) => (e) => {
    if (i !== activeIndex) return
    e.target.setPointerCapture(e.pointerId)
    dragging.current = i
    const p = svgPoint(e, e.currentTarget)
    dragOffset.current = { x: p.x - tails[i].x, y: p.y - tails[i].y }
  }

  const onPointerMove = (e) => {
    if (dragging.current === null) return
    const i = dragging.current
    const p = svgPoint(e, e.currentTarget)
    const next = { x: p.x - dragOffset.current.x, y: p.y - dragOffset.current.y }
    const nextTails = tailsRef.current.map((t, idx) => (idx === i ? next : t))
    tailsRef.current = nextTails
    setTails(nextTails)
  }

  const onPointerUp = () => {
    if (dragging.current === null) return
    const i = dragging.current
    dragging.current = null
    const target = anchors[i + 1]
    const cur = tailsRef.current[i]
    const dx = cur.x - target.x
    const dy = cur.y - target.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= SNAP_RADIUS) {
      const nextTails = tailsRef.current.map((t, idx) => (idx === i ? target : t))
      tailsRef.current = nextTails
      setTails(nextTails)
      setSnapped((s) => s.map((v, idx) => (idx === i ? true : v)))
    } else {
      setMisses((m) => m + 1)
    }
  }

  const rx = points[4].x
  const ry = points[4].y
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
      setTimeout(() => onComplete(stars, `Résultante R = ${round(correctRMag)} m à ${round(correctRAngle)}°`), 700)
    } else if (next >= 3) {
      setFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `Résultante R = ${round(correctRMag)} m à ${round(correctRAngle)}°`), 1300)
    } else {
      setFeedback({ ok: false })
    }
  }

  const origin = anchors[0]
  const destination = anchors[4]
  const originLabelDy = origin.y < 150 ? 26 : -14
  const destLabelDy = destination.y < 150 ? 26 : -14

  return (
    <div className="challenge-columns">
      <svg viewBox="0 0 300 300" className="challenge-svg" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <defs>
          {LABELS.map((l, i) => (
            <marker key={l} id={`arrow${l}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill={COLORS[i]} />
            </marker>
          ))}
        </defs>

        {/* Vector A: fixed, already placed from the origin */}
        <line x1={origin.x} y1={origin.y} x2={anchors[1].x} y2={anchors[1].y} stroke={COLORS[0]} strokeWidth="3.5" markerEnd="url(#arrowA)" />
        <text x={anchors[1].x + 8} y={anchors[1].y} fill={COLORS[0]} fontWeight="bold" style={{ pointerEvents: 'none' }}>A ({vectors[0].magnitude} m, {vectors[0].angle}°)</text>

        {/* Vectors B, C, D: fixed once snapped, draggable when active, dimmed otherwise */}
        {[0, 1, 2].map((i) => {
          const tail = tails[i]
          const tip = tipOfDraggable(i, tail)
          const isActive = i === activeIndex
          const isDone = snapped[i]
          return (
            <g key={LABELS[i + 1]}>
              <g
                onPointerDown={onPointerDown(i)}
                style={{ cursor: isActive ? 'grab' : 'default', opacity: isDone || isActive ? 1 : 0.35 }}
              >
                <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} stroke={COLORS[i + 1]} strokeWidth="3.5" markerEnd={`url(#arrow${LABELS[i + 1]})`} />
                {isActive && <circle cx={tail.x} cy={tail.y} r="10" fill={COLORS[i + 1]} opacity="0.25" />}
              </g>
              <text x={tail.x + (isDone ? -16 : 8)} y={tail.y - 10} fill={COLORS[i + 1]} fontWeight="bold" opacity={isDone || isActive ? 1 : 0.35} style={{ pointerEvents: 'none' }}>
                {LABELS[i + 1]} ({vectors[i + 1].magnitude} m, {vectors[i + 1].angle}°)
              </text>
            </g>
          )
        })}

        {!allSnapped && (
          <circle cx={anchors[activeIndex + 1].x} cy={anchors[activeIndex + 1].y} r={SNAP_RADIUS} fill="none" stroke={COLORS[activeIndex + 1]} strokeDasharray="3 3" opacity="0.6" style={{ pointerEvents: 'none' }} />
        )}

        {allSnapped && (
          <line x1={origin.x} y1={origin.y} x2={destination.x} y2={destination.y} stroke="#7ee787" strokeWidth="3" strokeDasharray="6 4" style={{ pointerEvents: 'none' }} />
        )}

        <circle cx={origin.x} cy={origin.y} r="6" fill="#fff" stroke="var(--muted)" strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
        <text x={origin.x} y={origin.y + originLabelDy} fill="var(--muted)" fontSize="12" textAnchor="middle" style={{ pointerEvents: 'none' }}>Départ</text>

        <circle cx={destination.x} cy={destination.y} r="9" fill="none" stroke={allSnapped ? '#7ee787' : 'var(--muted)'} strokeWidth="2" strokeDasharray={allSnapped ? '0' : '3 3'} style={{ pointerEvents: 'none' }} />
        <text x={destination.x} y={destination.y + destLabelDy} fill={allSnapped ? '#7ee787' : 'var(--muted)'} fontSize="12" textAnchor="middle" style={{ pointerEvents: 'none' }}>Arrimage</text>
      </svg>

      <div className="challenge-controls">
        {!allSnapped ? (
          <>
            <span className="step-badge">Étape 1 / 2 — Assembler</span>
            <p>Pour rejoindre le point d'arrimage depuis la position de départ, la station enchaîne quatre poussées de correction (<b style={{ color: COLORS[0] }}>A</b>, <b style={{ color: COLORS[1] }}>B</b>, <b style={{ color: COLORS[2] }}>C</b>, <b style={{ color: COLORS[3] }}>D</b>) bout-à-bout. <b style={{ color: COLORS[0] }}>A</b> est déjà en place.</p>
            <p className="hint">Fais glisser <b style={{ color: COLORS[activeIndex + 1] }}>{LABELS[activeIndex + 1]}</b> jusqu'à la pointe de <b style={{ color: COLORS[activeIndex] }}>{LABELS[activeIndex]}</b> pour l'accrocher.</p>
            <p className="hint">Tentatives ratées : {misses}</p>
          </>
        ) : (
          <>
            <span className="step-badge">Étape 2 / 2 — Calculer</span>
            <p className="step-complete">✓ Trajectoire assemblée</p>
            <p>Calcule la magnitude et l'angle du déplacement résultant R (en vert) entre le départ et le point d'arrimage.</p>
            <label>
              Magnitude |R| (m)
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
