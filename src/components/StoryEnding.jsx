import { motion } from 'framer-motion'
import Confetti from './Confetti'
import { playClick, playStars } from '../utils/sound'
import { useEffect } from 'react'
import { STORY_OUTRO, STATION_NAME, AI_NAME, MAX_STARS } from '../gameData'

function StoryEnding({ onBack }) {
  useEffect(() => {
    playStars(3)
  }, [])

  const handleBack = () => {
    playClick()
    onBack()
  }

  return (
    <div className="title-screen">
      <Confetti active count={120} />
      <motion.div
        className="title-card ending-card"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span
          className="title-emoji"
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🛰️✨
        </motion.span>
        <h1>Mission accomplie !</h1>
        <p className="title-tagline">{STATION_NAME} est de nouveau opérationnelle</p>

        <div className="transmission-box">
          <span className="transmission-tag">📡 Transmission de {AI_NAME}</span>
          <p>{STORY_OUTRO}</p>
        </div>

        <p className="title-progress">⭐ {MAX_STARS} / {MAX_STARS} étoiles — Ingénieur·e en Mécanique certifié·e</p>

        <motion.button
          className="btn-primary btn-large"
          onClick={handleBack}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Retour à la carte
        </motion.button>
      </motion.div>
    </div>
  )
}

export default StoryEnding
