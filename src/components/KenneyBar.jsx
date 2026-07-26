import { motion } from 'framer-motion'
import barFillL from '../assets/kenney-ui/bar_fill_l.svg'
import barFillR from '../assets/kenney-ui/bar_fill_r.svg'

function KenneyBar({ pct, delay = 0.3 }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="kenney-bar-track">
      <div className="kenney-bar-fill">
        <img src={barFillL} className="kenney-bar-cap" alt="" />
        <div className="kenney-bar-mid" />
        <img src={barFillR} className="kenney-bar-cap" alt="" />
      </div>
      <motion.div
        className="kenney-bar-cover"
        initial={{ width: '100%' }}
        animate={{ width: `${100 - clamped}%` }}
        transition={{ duration: 0.6, ease: 'easeOut', delay }}
      />
    </div>
  )
}

export default KenneyBar
