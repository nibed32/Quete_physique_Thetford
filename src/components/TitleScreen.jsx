function TitleScreen({ onStart, totalStars, maxStars }) {
  return (
    <div className="title-screen">
      <div className="title-card">
        <h1>⚛️ Quête Physique</h1>
        <p className="title-tagline">Une aventure à travers la mécanique</p>
        {totalStars > 0 && (
          <p className="title-progress">⭐ {totalStars} / {maxStars} étoiles récoltées</p>
        )}
        <button className="btn-primary btn-large" onClick={onStart}>
          {totalStars > 0 ? 'Continuer l\'aventure' : 'Commencer l\'aventure'}
        </button>
      </div>
    </div>
  )
}

export default TitleScreen
