import { useEffect, useRef } from 'react'

const COLORS = ['#4f9dff', '#e0af2f', '#7ee787', '#a259e0', '#ff8fa3']

function Confetti({ active, count = 70 }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const w = (canvas.width = canvas.offsetWidth)
    const h = (canvas.height = canvas.offsetHeight)

    const particles = Array.from({ length: count }, () => ({
      x: w / 2,
      y: h * 0.35,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -7 - 3,
      size: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
      life: 1,
    }))

    const start = performance.now()
    const duration = 1600

    const step = (now) => {
      const elapsed = now - start
      const p = Math.min(elapsed / duration, 1)
      ctx.clearRect(0, 0, w, h)
      for (const particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.28
        particle.rot += particle.vrot
        particle.life = 1 - p
        ctx.save()
        ctx.globalAlpha = Math.max(particle.life, 0)
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rot)
        ctx.fillStyle = particle.color
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6)
        ctx.restore()
      }
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        ctx.clearRect(0, 0, w, h)
      }
    }
    rafRef.current = requestAnimationFrame(step)

    return () => cancelAnimationFrame(rafRef.current)
  }, [active, count])

  return <canvas ref={canvasRef} className="confetti-canvas" />
}

export default Confetti
