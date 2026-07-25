import StarRow from './StarRow'

function chapterStars(chapter, progress) {
  return chapter.challenges.reduce((sum, ch) => sum + (progress[chapter.id]?.[ch.id] || 0), 0)
}

function WorldMap({ chapters, progress, isUnlocked, onSelectChapter }) {
  return (
    <div className="world-map">
      <h2 className="map-title">Choisis un chapitre</h2>
      <div className="chapter-grid">
        {chapters.map((chapter, i) => {
          const unlocked = isUnlocked(i)
          const stars = chapterStars(chapter, progress)
          const maxStars = chapter.challenges.length * 3
          return (
            <button
              key={chapter.id}
              className={`chapter-node ${unlocked ? '' : 'locked'}`}
              style={{ '--accent': chapter.color }}
              onClick={() => unlocked && onSelectChapter(i)}
              disabled={!unlocked}
            >
              <span className="chapter-icon">{unlocked ? chapter.icon : '🔒'}</span>
              <span className="chapter-title">{chapter.title}</span>
              <span className="chapter-subtitle">{chapter.subtitle}</span>
              {unlocked && <StarRow stars={stars === maxStars ? 3 : stars > 0 ? Math.ceil((stars / maxStars) * 3) : 0} size={16} />}
              {unlocked && <span className="chapter-score">{stars} / {maxStars} ⭐</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default WorldMap
