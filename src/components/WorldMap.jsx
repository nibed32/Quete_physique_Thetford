import { motion } from 'framer-motion'
import StarRow from './StarRow'
import { playClick } from '../utils/sound'

function chapterStars(chapter, progress) {
  return chapter.challenges.reduce((sum, ch) => sum + (progress[chapter.id]?.[ch.id] || 0), 0)
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

function WorldMap({ chapters, progress, isUnlocked, onSelectChapter }) {
  const handleSelect = (i, unlocked) => {
    if (!unlocked) return
    playClick()
    onSelectChapter(i)
  }

  return (
    <div className="world-map">
      <h2 className="map-title">Choisis un chapitre</h2>
      <motion.div className="chapter-grid" variants={container} initial="hidden" animate="show">
        {chapters.map((chapter, i) => {
          const unlocked = isUnlocked(i)
          const stars = chapterStars(chapter, progress)
          const maxStars = chapter.challenges.length * 3
          const pct = maxStars ? (stars / maxStars) * 100 : 0
          return (
            <motion.button
              key={chapter.id}
              variants={item}
              className={`chapter-node ${unlocked ? '' : 'locked'}`}
              style={{ '--accent': chapter.color }}
              onClick={() => handleSelect(i, unlocked)}
              disabled={!unlocked}
              whileHover={unlocked ? { y: -6, boxShadow: `0 16px 36px color-mix(in srgb, ${chapter.color} 35%, transparent)` } : {}}
              whileTap={unlocked ? { scale: 0.97 } : {}}
            >
              <span className="chapter-icon">{unlocked ? chapter.icon : '🔒'}</span>
              <span className="chapter-title">{chapter.title}</span>
              <span className="chapter-subtitle">{chapter.subtitle}</span>
              {unlocked && (
                <>
                  <StarRow stars={stars === maxStars ? 3 : stars > 0 ? Math.ceil((stars / maxStars) * 3) : 0} size={16} />
                  <div className="chapter-progress-track">
                    <motion.div
                      className="chapter-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                  <span className="chapter-score">{stars} / {maxStars} ⭐</span>
                </>
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

export default WorldMap
