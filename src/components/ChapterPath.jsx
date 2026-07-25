import StarRow from './StarRow'

function ChapterPath({ chapter, progress, onSelectChallenge, onBack }) {
  return (
    <div className="chapter-path" style={{ '--accent': chapter.color }}>
      <div className="chapter-path-header">
        <button className="btn-ghost" onClick={onBack}>← Carte</button>
        <h2>{chapter.icon} {chapter.title}</h2>
        <div style={{ width: 90 }} />
      </div>
      <div className="challenge-list">
        {chapter.challenges.map((challenge, i) => {
          const stars = progress[chapter.id]?.[challenge.id] || 0
          return (
            <button key={challenge.id} className="challenge-node" onClick={() => onSelectChallenge(i)}>
              <span className="challenge-node-num">{i + 1}</span>
              <span className="challenge-node-title">{challenge.title}</span>
              <StarRow stars={stars} size={18} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ChapterPath
