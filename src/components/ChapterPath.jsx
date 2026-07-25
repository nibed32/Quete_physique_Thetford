import { motion } from 'framer-motion'
import StarRow from './StarRow'
import { playClick } from '../utils/sound'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}
const item = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

function ChapterPath({ chapter, progress, onSelectChallenge, onBack }) {
  const handleSelect = (i) => {
    playClick()
    onSelectChallenge(i)
  }

  return (
    <div className="chapter-path" style={{ '--accent': chapter.color }}>
      <div className="chapter-path-header">
        <button className="btn-ghost" onClick={onBack}>← Carte</button>
        <h2>{chapter.icon} {chapter.title}</h2>
        <div style={{ width: 90 }} />
      </div>
      <motion.div className="challenge-list" variants={container} initial="hidden" animate="show">
        {chapter.challenges.map((challenge, i) => {
          const stars = progress[chapter.id]?.[challenge.id] || 0
          return (
            <motion.div key={challenge.id} className="challenge-node-wrap" variants={item}>
              <motion.button
                className="challenge-node"
                onClick={() => handleSelect(i)}
                whileHover={{ x: 6, borderColor: 'var(--accent)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="challenge-node-num">{i + 1}</span>
                <span className="challenge-node-title">{challenge.title}</span>
                <StarRow stars={stars} size={18} />
              </motion.button>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default ChapterPath
