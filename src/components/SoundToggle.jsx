import { useState } from 'react'
import { isMuted, setMuted } from '../utils/sound'

function SoundToggle() {
  const [muted, setMutedState] = useState(isMuted)

  const toggle = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <button className="sound-toggle" onClick={toggle} aria-label={muted ? 'Activer le son' : 'Couper le son'}>
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

export default SoundToggle
