import { useState } from 'react'
import { degToRad, g, randInt, round } from '../../utils/physics'

function genScenario() {
  const V = randInt(12, 20)
  const theta = randInt(25, 50)
  const m1 = randInt(3, 8)
  const m2 = randInt(4, 10)
  const rad = degToRad(theta)
  const vx = V * Math.cos(rad)
  const vy = V * Math.sin(rad)
  const t = (2 * vy) / g
  const vf = (m1 * vx) / (m1 + m2)
  return { V, theta, m1, m2, vx, vy, t, vf }
}

function FinalSynthesis({ onComplete }) {
  const [s] = useState(genScenario)
  const [step, setStep] = useState(1)

  const [vxAns, setVxAns] = useState('')
  const [vyAns, setVyAns] = useState('')
  const [a1, setA1] = useState(0)
  const [f1, setF1] = useState(null)

  const [tAns, setTAns] = useState('')
  const [a2, setA2] = useState(0)
  const [f2, setF2] = useState(null)

  const [vfAns, setVfAns] = useState('')
  const [a3, setA3] = useState(0)
  const [f3, setF3] = useState(null)

  const checkStep1 = () => {
    const userVx = parseFloat(vxAns)
    const userVy = parseFloat(vyAns)
    const ok = Math.abs(userVx - s.vx) <= 0.4 && Math.abs(userVy - s.vy) <= 0.4
    const next = a1 + 1
    setA1(next)
    if (ok) {
      setF1({ ok: true })
      setTimeout(() => setStep(2), 700)
    } else if (next >= 3) {
      setF1({ ok: false, reveal: true })
      setTimeout(() => setStep(2), 1300)
    } else {
      setF1({ ok: false })
    }
  }

  const checkStep2 = () => {
    const userT = parseFloat(tAns)
    const ok = Math.abs(userT - s.t) <= 0.25
    const next = a2 + 1
    setA2(next)
    if (ok) {
      setF2({ ok: true })
      setTimeout(() => setStep(3), 700)
    } else if (next >= 3) {
      setF2({ ok: false, reveal: true })
      setTimeout(() => setStep(3), 1300)
    } else {
      setF2({ ok: false })
    }
  }

  const checkStep3 = () => {
    const userVf = parseFloat(vfAns)
    const ok = Math.abs(userVf - s.vf) <= 0.3
    const next = a3 + 1
    setA3(next)
    const extra = Math.max(0, a1 - 1) + Math.max(0, a2 - 1) + Math.max(0, next - 1)
    if (ok) {
      setF3({ ok: true })
      const stars = extra === 0 ? 3 : extra <= 2 ? 2 : 1
      setTimeout(() => onComplete(stars), 700)
    } else if (next >= 3) {
      setF3({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `vf = ${round(s.vf)} m/s`), 1300)
    } else {
      setF3({ ok: false })
    }
  }

  const originX = 60
  const originY = 240
  const scale = 10
  const rad = degToRad(s.theta)
  const tipX = originX + Math.cos(rad) * s.V * scale
  const tipY = originY - Math.sin(rad) * s.V * scale

  return (
    <div className="challenge-columns">
      <svg viewBox="0 0 300 280" className="challenge-svg">
        <line x1="0" y1={originY} x2="300" y2={originY} stroke="var(--grid)" strokeWidth="1" />
        <defs>
          <marker id="arrowSyn" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="var(--accent)" />
          </marker>
        </defs>
        {step === 1 && (
          <>
            <line x1={originX} y1={originY} x2={tipX} y2={tipY} stroke="var(--accent)" strokeWidth="3.5" markerEnd="url(#arrowSyn)" />
            <text x={tipX + 6} y={tipY} fill="var(--accent)" fontWeight="bold">V = {s.V} m/s</text>
            <text x={originX + 10} y={originY - 10} fill="var(--muted)" fontSize="12">θ = {s.theta}°</text>
          </>
        )}
        {step === 2 && (
          <text x="30" y="140" fill="var(--muted)" fontSize="13">Le débris retombe au niveau du pont après un vol parabolique…</text>
        )}
        {step === 3 && (
          <text x="20" y="140" fill="var(--muted)" fontSize="13">Il percute alors un module de secours immobile et reste collé.</text>
        )}
      </svg>

      <div className="challenge-controls">
        {step === 1 && (
          <>
            <span className="step-badge">Étape 1 / 3 — Vecteurs</span>
            <p>Un débris est éjecté du bouclier à V = {s.V} m/s, à θ = {s.theta}° au-dessus du pont. Décompose sa vitesse.</p>
            <label>
              Vx (m/s)
              <input type="number" step="0.1" value={vxAns} onChange={(e) => setVxAns(e.target.value)} />
            </label>
            <label>
              Vy (m/s)
              <input type="number" step="0.1" value={vyAns} onChange={(e) => setVyAns(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={checkStep1}>Vérifier</button>
            {f1 && !f1.ok && <p className="feedback-bad">{f1.reveal ? 'Essais épuisés — passons à la suite.' : 'Pas encore correct.'}</p>}
            {f1?.ok && <p className="feedback-good">Exact !</p>}
          </>
        )}
        {step === 2 && (
          <>
            <span className="step-badge">Étape 2 / 3 — Cinématique</span>
            <p className="step-complete">✓ Vx = {round(s.vx)} m/s, Vy = {round(s.vy)} m/s</p>
            <p>Calcule le temps avant que le débris ne retombe au niveau du pont (même hauteur de départ).</p>
            <label>
              Temps de vol (s)
              <input type="number" step="0.01" value={tAns} onChange={(e) => setTAns(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={checkStep2}>Vérifier</button>
            {f2 && !f2.ok && <p className="feedback-bad">{f2.reveal ? 'Essais épuisés — passons à la suite.' : 'Pas encore correct.'}</p>}
            {f2?.ok && <p className="feedback-good">Exact !</p>}
            <p className="hint">t = 2Vy / g</p>
          </>
        )}
        {step === 3 && (
          <>
            <span className="step-badge">Étape 3 / 3 — Collision</span>
            <p className="step-complete">✓ Temps de vol = {round(s.t)} s</p>
            <p>Le débris (masse m1 = {s.m1} kg, vitesse horizontale Vx conservée) percute un module immobile de masse m2 = {s.m2} kg et reste collé. Calcule leur vitesse commune.</p>
            <label>
              Vitesse commune vf (m/s)
              <input type="number" step="0.1" value={vfAns} onChange={(e) => setVfAns(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={checkStep3}>Vérifier</button>
            {f3 && !f3.ok && <p className="feedback-bad">{f3.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct.'}</p>}
            {f3?.ok && <p className="feedback-good">Exact !</p>}
            <p className="hint">vf = m1·Vx / (m1 + m2)</p>
          </>
        )}
      </div>
    </div>
  )
}

export default FinalSynthesis
