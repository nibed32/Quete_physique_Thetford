import { useState } from 'react'
import StarRow from './StarRow'

function ChallengeShell({ title, instructions, color, onExit, onFinish, children: renderChallenge }) {
  const [result, setResult] = useState(null) // { stars, message }

  const handleComplete = (stars, message) => {
    setResult({ stars, message })
  }

  return (
    <div className="challenge-shell" style={{ '--accent': color }}>
      <div className="challenge-header">
        <button className="btn-ghost" onClick={onExit}>← Retour</button>
        <h2>{title}</h2>
        <div style={{ width: 90 }} />
      </div>
      <p className="challenge-instructions">{instructions}</p>
      <div className="challenge-body">
        {renderChallenge({ onComplete: handleComplete })}
      </div>

      {result && (
        <div className="overlay">
          <div className="overlay-card">
            <h3>{result.stars > 0 ? 'Défi réussi !' : 'Pas tout à fait...'}</h3>
            <StarRow stars={result.stars} size={40} />
            {result.message && <p>{result.message}</p>}
            <div className="overlay-actions">
              {result.stars === 0 ? (
                <button className="btn-primary" onClick={() => setResult(null)}>
                  Réessayer
                </button>
              ) : (
                <button className="btn-primary" onClick={() => onFinish(result.stars)}>
                  Continuer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChallengeShell
