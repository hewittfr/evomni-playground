import { Theme } from '@mui/material'

// Deterministic HSL color generator by label/name.
// Produces a wide range of distinct colors (hue based on hash) so different labels map to different hues.
export function getColorForLabel(name: string, theme: Theme) {
  // FNV-1a 32-bit hash
  let h = 2166136261 >>> 0
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619)
  const num = (h >>> 0)

  // Use golden angle to spread hues across labels deterministically and avoid clustering
  // golden angle in degrees ~ 137.50776405003785
  const golden = 137.50776405003785
  // Primary hue candidate
  const hueCandidate = (num * golden) % 360
  // Secondary deterministic offset to further separate similar hashes (-15..+15 deg)
  const offset = ((num >>> 8) % 31) - 15
  const hue = Math.round((hueCandidate + offset + 360) % 360)

  // Add a tiny deterministic variation to saturation and lightness so similar names don't look identical
  const satBase = 62
  const lightBase = theme.palette.mode === 'dark' ? 58 : 48
  const satVariance = (num % 7) - 3 // -3..3
  const lightVariance = ((num >> 3) % 5) - 2 // -2..2
  const saturation = Math.min(88, Math.max(40, satBase + satVariance * 3))
  const lightness = Math.min(68, Math.max(36, lightBase + lightVariance * 2))

  // Use hsl with spaces for modern CSS parsing
  return `hsl(${hue} ${saturation}% ${lightness}%)`
}
