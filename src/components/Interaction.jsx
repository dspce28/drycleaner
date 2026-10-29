import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

// Pulls its child toward the pointer while hovered.
export function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef(null)
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 })
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 })
  const reduce = useReducedMotion()
  const move = (e) => {
    if (reduce) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * strength)
    y.set((e.clientY - r.top - r.height / 2) * strength)
  }
  const leave = () => { x.set(0); y.set(0) }
  return (
    <motion.span ref={ref} className="magnetic" style={{ x, y }} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </motion.span>
  )
}

// Dot + ring cursor. Elements with data-cursor="Label" grow the ring and show the label.
export function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState('')
  const [hover, setHover] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 })

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return
    setEnabled(true)
    document.documentElement.classList.add('has-cursor')
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target.closest?.('[data-cursor], a, button, label, select, input, textarea')
      setHover(!!t)
      setLabel(t?.getAttribute?.('data-cursor') || '')
    }
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [x, y])

  if (!enabled) return null
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} />
      <motion.div
        className={`cursor-ring ${hover ? 'is-hover' : ''} ${label ? 'has-label' : ''}`}
        style={{ x: rx, y: ry }}
      >
        <span>{label}</span>
      </motion.div>
    </>
  )
}

// Splits text into masked lines/words that rise into place.
export function RevealText({ text, as: Tag = 'span', className, delay = 0, stagger = 0.06, inView = true }) {
  const words = text.split(' ')
  const anim = inView
    ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-10% 0px' } }
    : { initial: 'hidden', animate: 'show' }
  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden="true"
        style={{ display: 'inline' }}
        {...anim}
        variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="mask">
              <motion.span
                className="mask__inner"
                variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
              >
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  )
}

export function FadeUp({ children, delay = 0, className, as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  )
}
