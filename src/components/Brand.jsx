import { motion } from 'framer-motion'

// Vector redraw of the Aspen mark: gold peak with the green sweep beneath.
export const MARK_GOLD = 'M405 50 L506 288 C440 282 340 318 268 392 Z'
// Brand colours for the mark. The logo is never recoloured; on dark surfaces it sits on an ivory plate.
const BRAND_GOLD = '#D7A233'
const BRAND_GREEN = '#113C26'

export const MARK_GREEN = 'M396 354 C440 326 486 312 516 312 L549 394 C512 366 455 350 396 354 Z'

export function Mark({ size = 40, className, draw = false }) {
  const common = draw
    ? {
        initial: { pathLength: 0, fillOpacity: 0 },
        animate: { pathLength: 1, fillOpacity: 1 },
        transition: { pathLength: { duration: 1.1, ease: [0.65, 0, 0.35, 1] }, fillOpacity: { delay: 0.9, duration: 0.5 } },
      }
    : {}
  return (
    <svg className={className} width={size} height={size * 1.15} viewBox="258 42 300 360" aria-hidden="true">
      <motion.path d={MARK_GOLD} fill={BRAND_GOLD} stroke={BRAND_GOLD} strokeWidth={draw ? 3 : 0} {...common} />
      <motion.path d={MARK_GREEN} fill={BRAND_GREEN} stroke={BRAND_GREEN} strokeWidth={draw ? 3 : 0} {...common} />
    </svg>
  )
}

export function Wordmark({ inverse = false, compact = false }) {
  return (
    <span className={`wordmark ${inverse ? 'is-inverse' : ''} ${compact ? 'is-compact' : ''}`}>
      <Mark size={compact ? 26 : 32} />
      <span className="wordmark__text">
        <span className="wordmark__aspen">ASPEN</span>
        <span className="wordmark__cleaners">CLEANERS</span>
      </span>
    </span>
  )
}

// Garment care-label symbols (ISO 3758 style), drawn as simple strokes.
export function CareSymbol({ type, size = 34 }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const cross = <path d="M6 6 L34 34 M34 6 L6 34" {...s} />
  const tub = <path d="M5 12 L9 32 H31 L35 12 M5 12 C9 16 13 16 16 12 C19 16 23 16 26 12 C29 16 32 16 35 12" {...s} />
  const iron = <path d="M6 30 H34 C34 22 30 14 22 14 H12 C10 14 9 16 9 18 L6 30 Z" {...s} />
  const dot = (cx) => <circle key={cx} cx={cx} cy="24" r="1.6" fill="currentColor" />
  const map = {
    dryclean: (<><circle cx="20" cy="20" r="14" {...s} /><text x="20" y="25.5" textAnchor="middle" fontSize="15" fontFamily="Manrope, sans-serif" fontWeight="700" fill="currentColor">P</text></>),
    noWash: (<>{tub}{cross}</>),
    wash: (<>{tub}</>),
    wash40: (<>{tub}<text x="20" y="27" textAnchor="middle" fontSize="10" fontFamily="Manrope, sans-serif" fontWeight="700" fill="currentColor">40</text></>),
    iron: (<>{iron}{dot(20)}{dot(26)}</>),
    ironLow: (<>{iron}{dot(22)}</>),
    ironMid: (<>{iron}{dot(18)}{dot(25)}</>),
    ironHigh: (<>{iron}{dot(16)}{dot(22)}{dot(28)}</>),
    noIron: (<>{iron}{cross}</>),
    hand: (<>{tub}<path d="M16 16 C16 12 24 12 24 16 V22 M20 14 V22" {...s} /></>),
    noBleach: (<><path d="M20 6 L35 33 H5 Z" {...s} />{cross}</>),
    noTumble: (<><rect x="6" y="6" width="28" height="28" {...s} /><circle cx="20" cy="20" r="9" {...s} />{cross}</>),
    tumble: (<><rect x="6" y="6" width="28" height="28" {...s} /><circle cx="20" cy="20" r="9" {...s} /></>),
    leather: (<><circle cx="20" cy="20" r="14" {...s} /><text x="20" y="25" textAnchor="middle" fontSize="13" fontFamily="Manrope, sans-serif" fontWeight="700" fill="currentColor">L</text></>),
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="care-symbol">
      {map[type]}
    </svg>
  )
}

export function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z" />
    </svg>
  )
}

export function Arrow({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}
