export const degToRad = (deg) => (deg * Math.PI) / 180
export const radToDeg = (rad) => (rad * 180) / Math.PI
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
export const randRange = (min, max) => Math.random() * (max - min) + min
export const randInt = (min, max) => Math.floor(randRange(min, max + 1))
export const randSigned = (min, max) => randInt(min, max) * (Math.random() < 0.5 ? -1 : 1)
export const normalizeAngle360 = (deg) => ((deg % 360) + 360) % 360
export const round = (v, decimals = 1) => {
  const f = Math.pow(10, decimals)
  return Math.round(v * f) / f
}
export const g = 9.8
