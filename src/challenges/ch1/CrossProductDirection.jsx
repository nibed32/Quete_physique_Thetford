import { useState } from 'react'
import { degToRad, randInt } from '../../utils/physics'

const TOTAL_ROUNDS = 5
const ORIGIN = { x: 150, y: 150 }
const SCALE = 9

function genRound() {
  let angleA, angleB
  do {
    angleA = randInt(0, 359)
    angleB = randInt(0, 359)
  } while (Math.abs(((angleA - angleB + 540) % 360) - 180) < 15)
  const magA = randInt(5, 9)
  const magB = randInt(5, 9)
  return { angleA, angleB, magA, magB }
}

function CrossProductDirection({ onComplete }) {
  const [round, setRound] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [data, setData] = useState(genRound)
  const [feedback, setFeedback] = useState(null)

  const tip = (angle, mag) => ({
    x: ORIGIN.x + Math.cos(degToRad(angle)) * mag * SCALE,
    y: ORIGIN.y - Math.sin(degToRad(angle)) * mag * SCALE,
  })
  const tipA = tip(data.angleA, data.magA)
  const tipB = tip(data.angleB, data.magB)

  const rad = (d) => (d * Math.PI) / 180
  const cross =
    data.magA * Math.cos(rad(data.angleA)) * data.magB * Math.sin(rad(data.angleB)) -
    data.magA * Math.sin(rad(data.angleA)) * data.magB * Math.cos(rad(data.angleB))
  const answerOut = cross > 0

  const choose = (chooseOut) => {
    const isCorrect = chooseOut === answerOut
    if (isCorrect) setCorrectCount((c) => c + 1)
    setFeedback(isCorrect ? 'ok' : 'bad')
    setTimeout(() => {
      setFeedback(null)
      if (round + 1 >= TOTAL_ROUNDS) {
        const finalCorrect = correctCount + (isCorrect ? 1 : 0)
        const stars = finalCorrect === TOTAL_ROUNDS ? 3 : finalCorrect >= TOTAL_ROUNDS - 1 ? 2 : 1
        onComplete(stars, `${finalCorrect} / ${TOTAL_ROUNDS} correctes`)
      } else {
        setRound((r) => r + 1)
        setData(genRound())
      }
    }, 650)
  }

  return (
    <div className="challenge-columns">
      <svg viewBox="0 0 300 300" className="challenge-svg">
        <defs>
          <marker id="arrowXA" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="var(--accent)" />
          </marker>
          <marker id="arrowXB" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#e0af2f" />
          </marker>
        </defs>
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r="3" fill="var(--muted)" />
        <line x1={ORIGIN.x} y1={ORIGIN.y} x2={tipA.x} y2={tipA.y} stroke="var(--accent)" strokeWidth="3.5" markerEnd="url(#arrowXA)" />
        <text x={tipA.x + 6} y={tipA.y} fill="var(--accent)" fontWeight="bold">A</text>
        <line x1={ORIGIN.x} y1={ORIGIN.y} x2={tipB.x} y2={tipB.y} stroke="#e0af2f" strokeWidth="3.5" markerEnd="url(#arrowXB)" />
        <text x={tipB.x + 6} y={tipB.y} fill="#e0af2f" fontWeight="bold">B</text>
      </svg>
      <div className="challenge-controls">
        <p>Manche {round + 1} / {TOTAL_ROUNDS} — Utilise la règle de la main droite : dans quel sens pointe <b>A × B</b> ?</p>
        <div className="choice-row">
          <button className="btn-choice" onClick={() => choose(true)}>⊙ Vers toi (hors de l'écran)</button>
          <button className="btn-choice" onClick={() => choose(false)}>⊗ Vers l'écran</button>
        </div>
        {feedback === 'ok' && <p className="feedback-good">Correct !</p>}
        {feedback === 'bad' && <p className="feedback-bad">Pas cette fois.</p>}
        <p className="hint">Score actuel : {correctCount} / {round}</p>
      </div>
    </div>
  )
}

export default CrossProductDirection
