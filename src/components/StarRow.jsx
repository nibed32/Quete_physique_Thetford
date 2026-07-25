import { motion } from 'framer-motion'

function StarRow({ stars, size = 28, animated = false }) {
  return (
    <div className="star-row" style={{ fontSize: size }}>
      {[1, 2, 3].map((n) =>
        animated ? (
          <motion.span
            key={n}
            className={n <= stars ? 'star filled' : 'star'}
            initial={{ scale: 0, rotate: -60 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15 + n * 0.15, type: 'spring', stiffness: 300, damping: 12 }}
          >
            ★
          </motion.span>
        ) : (
          <span key={n} className={n <= stars ? 'star filled' : 'star'}>
            ★
          </span>
        )
      )}
    </div>
  )
}

export default StarRow
