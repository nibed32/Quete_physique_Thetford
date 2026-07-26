import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StarRow from './StarRow'
import Confetti from './Confetti'
import { playClick, playStars } from '../utils/sound'

function ChallengeShell({ title, instructions, color, onExit, onFinish, children: renderChallenge }) {
  const [result, setResult] = useState(null) // { stars, message }

  const handleComplete = (stars, message) => {
    setResult({ stars, message })
  }

  useEffect(() => {
    if (result) playStars(result.stars)
  }, [result])

  const handleExit = () => {
    playClick()
    onExit()
  }

  const handleFinish = () => {
    playClick()
    onFinish(result.stars)
  }

  return (
    <div className="challenge-shell" style={{ '--accent': color }}>
      <div className="challenge-header">
        <button className="btn-ghost" onClick={handleExit}>← Retour</button>
        <h2>{title}</h2>
        <div style={{ width: 90 }} />
      </div>
      <p className="challenge-instructions">{instructions}</p>
      <div className="challenge-body">
        {renderChallenge({ onComplete: handleComplete })}
      </div>

      {result && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <Confetti active={result.stars >= 2} count={result.stars === 3 ? 90 : 55} />
          <motion.div
            className={`overlay-card${result.stars === 3 ? ' perfect' : ''}`}
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <h3>{result.stars > 0 ? 'Défi réussi !' : 'Pas tout à fait...'}</h3>
            <StarRow stars={result.stars} size={40} animated />
            {result.message && <p>{result.message}</p>}
            <div className="overlay-actions">
              {result.stars === 0 ? (
                <button className="btn-primary" onClick={() => setResult(null)}>
                  Réessayer
                </button>
              ) : (
                <button className="btn-primary" onClick={handleFinish}>
                  Continuer
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default ChallengeShell
