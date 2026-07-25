const MUTE_KEY = 'quete-physique-muted'

let ctx = null
function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function isMuted() {
  return localStorage.getItem(MUTE_KEY) === '1'
}

export function setMuted(muted) {
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
}

function tone(freq, start, duration, type = 'sine', gainPeak = 0.12) {
  if (isMuted()) return
  try {
    const audioCtx = getCtx()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, audioCtx.currentTime + start)
    gain.gain.linearRampToValueAtTime(gainPeak, audioCtx.currentTime + start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(audioCtx.currentTime + start)
    osc.stop(audioCtx.currentTime + start + duration + 0.05)
  } catch {
    // audio unavailable, ignore
  }
}

export function playClick() {
  tone(440, 0, 0.08, 'triangle', 0.08)
}

export function playGood() {
  tone(523.25, 0, 0.12, 'sine')
  tone(659.25, 0.09, 0.14, 'sine')
}

export function playBad() {
  tone(220, 0, 0.16, 'sawtooth', 0.06)
}

export function playStars(stars) {
  const notes = [523.25, 659.25, 783.99]
  for (let i = 0; i < stars; i++) {
    tone(notes[i], i * 0.11, 0.22, 'sine', 0.1)
  }
  if (stars === 0) playBad()
}
