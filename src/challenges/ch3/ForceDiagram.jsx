import { useState } from 'react'

const FORCES = [
  { id: 'poids', label: 'Poids (Fg)' },
  { id: 'normale', label: 'Normale (FN)' },
  { id: 'frottement', label: 'Frottement (Ff)' },
  { id: 'applique', label: 'Force appliquée (F)' },
]

function ForceDiagram({ onComplete }) {
  const [appliedRight] = useState(() => Math.random() < 0.5)
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
      const stars = nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1
      setFeedback({ ok: true })
      setTimeout(() => onComplete(stars), 700)
    } else if (nextAttempts >= 3) {
      setFeedback({ ok: false, reveal: true })
      setTimeout(() => onComplete(1, 'Consulte le corrigé pour la prochaine fois.'), 1400)
    } else {
      setFeedback({ ok: false })
    }
  }

  const zoneLabel = (zone) => {
    const id = assignment[zone]
    return id ? FORCES.find((f) => f.id === id)?.label : '—'
  }

  return (
    <div className="challenge-columns">
      <div className="force-diagram">
        <div className={`force-zone zone-up ${assignment.up ? 'filled' : ''}`} onClick={() => clickZone('up')}>
          ↑ {zoneLabel('up')}
        </div>
        <div className="force-diagram-row">
          <div className={`force-zone zone-left ${assignment.left ? 'filled' : ''}`} onClick={() => clickZone('left')}>
            ← {zoneLabel('left')}
          </div>
          <div className="force-block">📦{appliedRight ? '→' : '←'}</div>
          <div className={`force-zone zone-right ${assignment.right ? 'filled' : ''}`} onClick={() => clickZone('right')}>
            → {zoneLabel('right')}
          </div>
        </div>
        <div className={`force-zone zone-down ${assignment.down ? 'filled' : ''}`} onClick={() => clickZone('down')}>
          ↓ {zoneLabel('down')}
        </div>
      </div>

      <div className="challenge-controls">
        <p>Le bloc est tiré {appliedRight ? 'vers la droite' : 'vers la gauche'} sur une surface avec friction. Place chaque force dans la bonne direction.</p>
        <div className="chip-tray">
          {tray.map((f) => (
            <button key={f.id} className={`force-chip ${selected === f.id ? 'selected' : ''}`} onClick={() => clickChip(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={verify} disabled={!allFilled}>Vérifier</button>
        {feedback && !feedback.ok && (
          <p className="feedback-bad">{feedback.reveal ? 'Essais épuisés.' : 'Une ou plusieurs forces sont mal placées.'}</p>
        )}
        {feedback?.ok && <p className="feedback-good">Diagramme correct !</p>}
      </div>
    </div>
  )
}

export default ForceDiagram
