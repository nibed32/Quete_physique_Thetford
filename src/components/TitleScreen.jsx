import { motion } from 'framer-motion'
import { playClick } from '../utils/sound'
import { STORY_INTRO, STATION_NAME, AI_NAME } from '../gameData'

function TitleScreen({ onStart, totalStars, maxStars }) {
  const handleStart = () => {
    playClick()
    onStart()
  }

  return (
    <div className="title-screen">
      <motion.div
        className="title-card"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span
          className="title-emoji"
          animate={{ y: [0, -8, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⚛️
        </motion.span>
        <h1>Quête Physique</h1>
        <p className="title-tagline">{STATION_NAME} — Une aventure à travers la mécanique</p>

        <motion.div
          className="transmission-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span className="transmission-tag">📡 Transmission de {AI_NAME}</span>
          <p>{STORY_INTRO}</p>
        </motion.div>

        {totalStars > 0 && (
          <motion.p
            className="title-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            ⭐ {totalStars} / {maxStars} étoiles récoltées
          </motion.p>
        )}
        <motion.button
          className="btn-primary btn-large"
          onClick={handleStart}
          whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(79,157,255,0.4)' }}
          whileTap={{ scale: 0.97 }}
        >
          {totalStars > 0 ? "Continuer l'aventure" : "Commencer l'aventure"}
        </motion.button>
      </motion.div>
    </div>
  )
}

export default TitleScreen
