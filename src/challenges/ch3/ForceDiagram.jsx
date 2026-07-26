import { useState } from 'react'
import { g, randInt, randRange, round } from '../../utils/physics'

const FORCES = [
  { id: 'poids', label: 'Poids (Fg)' },
  { id: 'normale', label: 'Normale (FN)' },
  { id: 'frottement', label: 'Frottement (Ff)' },
  { id: 'applique', label: 'Force appliquée (F)' },
]

function genDynamics() {
  let m, F, muK, a
  do {
    m = randInt(5, 20)
    muK = round(randRange(0.1, 0.4), 2)
    F = randInt(20, 90)
    a = (F - muK * m * g) / m
  } while (Math.abs(a) < 0.5)
  return { m, F, muK, a }
}

function ForceDiagram({ onComplete }) {
  const [appliedRight] = useState(() => Math.random() < 0.5)
  const [dyn] = useState(genDynamics)
  const correct = {
    up: 'normale',
    down: 'poids',
    right: appliedRight ? 'applique' : 'frottement',
    left: appliedRight ? 'frottement' : 'applique',
  }

  const [assignment, setAssignment] = useState({ up: null, down: null, left: null, right: null })
  const [selected, setSelected] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const [step, setStep] = useState(1)
  const [accelInput, setAccelInput] = useState('')
  const [accelAttempts, setAccelAttempts] = useState(0)
  const [accelFeedback, setAccelFeedback] = useState(null)

  const assignedIds = Object.values(assignment).filter(Boolean)
  const tray = FORCES.filter((f) => !assignedIds.includes(f.id))
  const allFilled = Object.values(assignment).every(Boolean)

  const clickChip = (id) => setSelected(selected === id ? null : id)

  const clickZone = (zone) => {
    if (selected) {
      setAssignment((prev) => ({ ...prev, [zone]: selected }))
      setSelected(null)
    } else if (assignment[zone]) {
      setAssignment((prev) => ({ ...prev, [zone]: null }))
    }
  }

  const verify = () => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const ok = Object.keys(correct).every((z) => assignment[z] === correct[z])
    if (ok) {
      setFeedback({ ok: true })
      setTimeout(() => setStep(2), 700)
    } else if (nextAttempts >= 3) {
      setFeedback({ ok: false, reveal: true })
      setTimeout(() => setStep(2), 1400)
    } else {
      setFeedback({ ok: false })
    }
  }

  const verifyAccel = () => {
    const val = parseFloat(accelInput)
    const next = accelAttempts + 1
    setAccelAttempts(next)
    const ok = Math.abs(val - dyn.a) <= 0.3
    const extra = Math.max(0, attempts - 1) + Math.max(0, next - 1)
    if (ok) {
      setAccelFeedback({ ok: true })
      const stars = extra === 0 ? 3 : extra === 1 ? 2 : 1
      setTimeout(() => onComplete(stars), 700)
    } else if (next >= 3) {
      setAccelFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, `a = ${round(dyn.a)} m/s²`), 1300)
    } else {
      setAccelFeedback({ ok: false })
    }
  }

  const zoneLabel = (zone) => {
    const id = assignment[zone]
    return id ? FORCES.find((f) => f.id === id)?.label : '—'
  }

  return (
    <div className="challenge-columns">
      <div className="force-diagram">
        <div className={`force-zone zone-up ${assignment.up ? 'filled' : ''}`} onClick={() => step === 1 && clickZone('up')}>
          ↑ {zoneLabel('up')}
        </div>
        <div className="force-diagram-row">
          <div className={`force-zone zone-left ${assignment.left ? 'filled' : ''}`} onClick={() => step === 1 && clickZone('left')}>
            ← {zoneLabel('left')}
          </div>
          <div className="force-block">📦{appliedRight ? '→' : '←'}</div>
          <div className={`force-zone zone-right ${assignment.right ? 'filled' : ''}`} onClick={() => step === 1 && clickZone('right')}>
            → {zoneLabel('right')}
          </div>
        </div>
        <div className={`force-zone zone-down ${assignment.down ? 'filled' : ''}`} onClick={() => step === 1 && clickZone('down')}>
          ↓ {zoneLabel('down')}
        </div>
      </div>

      <div className="challenge-controls">
        {step === 1 ? (
          <>
            <span className="step-badge">Étape 1 / 2 — Diagramme</span>
            <p>Une caisse est tirée {appliedRight ? 'vers la droite' : 'vers la gauche'} sur le convoyeur grippé de la salle des machines. Place chaque force dans la bonne direction pour comprendre pourquoi il peine.</p>
            <div className="chip-tray">
              {tray.map((f) => (
                <button key={f.id} className={`force-chip ${selected === f.id ? 'selected' : ''}`} onClick={() => clickChip(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={verify} disabled={!allFilled}>Vérifier</button>
            {feedback && !feedback.ok && (
              <p className="feedback-bad">{feedback.reveal ? 'Essais épuisés — passons à la suite.' : 'Une ou plusieurs forces sont mal placées.'}</p>
            )}
            {feedback?.ok && <p className="feedback-good">Diagramme correct !</p>}
          </>
        ) : (
          <>
            <span className="step-badge">Étape 2 / 2 — Calculer</span>
            <p className="step-complete">✓ Diagramme validé</p>
            <p>m = {dyn.m} kg, F = {dyn.F} N, μk = {dyn.muK}. Calcule l'accélération de la caisse sur le convoyeur.</p>
            <label>
              Accélération (m/s², + si dans le sens de F)
              <input type="number" step="0.1" value={accelInput} onChange={(e) => setAccelInput(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={verifyAccel}>Vérifier</button>
            {accelFeedback && !accelFeedback.ok && (
              <p className="feedback-bad">{accelFeedback.reveal ? 'Essais épuisés — voici la réponse.' : 'Pas encore correct.'}</p>
            )}
            {accelFeedback?.ok && <p className="feedback-good">Exact !</p>}
          </>
        )}
      </div>
    </div>
  )
}

export default ForceDiagram
