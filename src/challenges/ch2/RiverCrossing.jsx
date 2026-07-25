import { useEffect, useRef, useState } from 'react'
import { degToRad, randInt, round } from '../../utils/physics'

const W = 500
const H = 280
const TOP_Y = 25
const BOTTOM_Y = 255
const START_X = 250
const PX_PER_M = (BOTTOM_Y - TOP_Y) / 40
const RIVER_WIDTH_M = 40
const TOLERANCE_M = 4

function RiverCrossing({ onComplete }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const [vR] = useState(() => randInt(2, 4))
  const [vK] = useState(() => randInt(6, 9))
  const [angle, setAngle] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [paddling, setPaddling] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const draw = (kayakX = START_X, kayakY = BOTTOM_Y) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#5c4a33'
    ctx.fillRect(0, 0, W, TOP_Y)
    ctx.fillRect(0, BOTTOM_Y, W, H - BOTTOM_Y)
    ctx.fillStyle = '#1a4f7a'
    ctx.fillRect(0, TOP_Y, W, BOTTOM_Y - TOP_Y)

    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1.5
    for (let y = TOP_Y + 20; y < BOTTOM_Y; y += 35) {
      for (let x = 20; x < W - 20; x += 70) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 20, y)
        ctx.lineTo(x + 14, y - 4)
        ctx.moveTo(x + 20, y)
        ctx.lineTo(x + 14, y + 4)
        ctx.stroke()
      }
    }

    const tolPx = TOLERANCE_M * PX_PER_M
    ctx.fillStyle = 'rgba(126,231,135,0.35)'
    ctx.fillRect(START_X - tolPx, TOP_Y - 6, tolPx * 2, 6)
    ctx.fillStyle = '#e0af2f'
    ctx.beginPath()
    ctx.arc(START_X, BOTTOM_Y, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = '20px sans-serif'
    ctx.fillText('🛶', kayakX - 10, kayakY + 6)
  }

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const paddle = () => {
    if (paddling) return
    setPaddling(true)
    setFeedback(null)
    const theta = degToRad(angle)
    const gx = vR - vK * Math.sin(theta)
    const gyMag = vK * Math.cos(theta)
    const time = RIVER_WIDTH_M / gyMag
    const driftM = gx * time
    const endX = START_X + driftM * PX_PER_M

    const duration = 1800
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const x = START_X + (endX - START_X) * p
      const y = BOTTOM_Y + (TOP_Y - BOTTOM_Y) * p
      draw(x, y)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        finish(round(driftM, 1))
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const finish = (driftM) => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const hit = Math.abs(driftM) <= TOLERANCE_M
    if (hit) {
      const stars = nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1
      setFeedback({ ok: true })
      setTimeout(() => onComplete(stars, `Dérive: ${driftM} m`), 700)
    } else if (nextAttempts >= 4) {
      setFeedback({ ok: false })
      const idealAngle = round((Math.asin(vR / vK) * 180) / Math.PI)
      setTimeout(() => onComplete(1, `Angle idéal ≈ ${idealAngle}° vers l'amont`), 900)
    } else {
      setFeedback({ ok: false, retry: true, driftM })
      setPaddling(false)
    }
  }

  return (
    <div className="challenge-columns">
      <canvas ref={canvasRef} width={W} height={H} className="challenge-canvas" />
      <div className="challenge-controls">
        <p>Courant: {vR} m/s → &nbsp; Vitesse du kayak: {vK} m/s</p>
        <p>Oriente le kayak pour accoster pile dans la zone verte, en face du départ.</p>
        <label>
          Angle vers l'amont: {angle}°
          <input type="range" min="-50" max="50" value={angle} onChange={(e) => setAngle(+e.target.value)} disabled={paddling} />
        </label>
        <button className="btn-primary" onClick={paddle} disabled={paddling}>Pagayer</button>
        {feedback?.retry && <p className="feedback-bad">Dérive de {feedback.driftM} m. Essais restants: {3 - attempts}</p>}
        {feedback?.ok && <p className="feedback-good">Accosté avec précision !</p>}
      </div>
    </div>
  )
}

export default RiverCrossing
