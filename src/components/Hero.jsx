import { useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity, useAnimationFrame } from 'framer-motion'
import { Arrow, Mark, WhatsAppIcon } from './Brand.jsx'
import { Magnetic, RevealText } from './Interaction.jsx'
import { garments, img, waLink } from '../data.js'
import { SilkThreads } from './Showcase.jsx'

export function Hero({ ready }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 20 })
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 20 })
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const show = ready ? 'show' : 'hidden'

  return (
    <section className="hero" id="top" ref={ref} onPointerMove={onMove}>
      <div className="hero__glow" aria-hidden="true" />
      <SilkThreads className="hero__threads" lines={12} opacity={0.42} />
      <div className="wrap hero__grid">
        <motion.div className="hero__copy" style={{ y: textY }}>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            <Mark size={14} /> Dry Cleaning &amp; Garment Care · Ahmedabad
          </motion.p>
          {ready && (
            <h1 className="hero__title">
              <RevealText text="Clothes worth" inView={false} className="line" delay={0.15} />
              <span className="line">
                <RevealText text="caring" inView={false} className="serif-italic gold-text shimmer" delay={0.35} />{' '}
                <RevealText text="for." inView={false} delay={0.45} />
              </span>
            </h1>
          )}
          {!ready && <h1 className="hero__title hero__title--placeholder">Clothes worth caring for.</h1>}
          <motion.p
            className="hero__lede"
            initial={{ opacity: 0, y: 16 }}
            animate={show === 'show' ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.75, duration: 0.9 }}
          >
            Silk sarees, bridal lehengas, tailored suits and everyday shirts, each cleaned for its fabric and finished by hand.
            Picked up from your door. Returned ready to wear.
          </motion.p>
          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={show === 'show' ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.9 }}
          >
            <Magnetic>
              <a href="#book" className="btn btn--gold btn--lg" data-cursor="Book">
                Schedule a Pickup <Arrow />
              </a>
            </Magnetic>
            <a className="btn btn--ghost btn--lg" href={waLink('Hello Aspen Cleaners, I would like to know more about your services.')} target="_blank" rel="noreferrer">
              <WhatsAppIcon /> Send us a WhatsApp
            </a>
          </motion.div>
          <motion.ul
            className="hero__facts"
            initial={{ opacity: 0 }}
            animate={show === 'show' ? { opacity: 1 } : {}}
            transition={{ delay: 1.1, duration: 1 }}
          >
            <li><strong>Free</strong> pickup &amp; delivery</li>
            <li><strong>Fabric-first</strong> cleaning</li>
            <li><strong>Hand</strong> finished</li>
          </motion.ul>
        </motion.div>

        <div className="hero__visual">
          <motion.div
            className="hero__arch"
            style={{ rotateX: rotX, rotateY: rotY }}
            initial={{ clipPath: 'inset(100% 0 0 0 round 999px 999px 24px 24px)' }}
            animate={ready ? { clipPath: 'inset(0% 0 0 0 round 999px 999px 24px 24px)' } : {}}
            transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
          >
            <motion.img src={img.sareeGreen} alt="Woman in an emerald silk saree with a heavy gold zari border" style={{ y: imgY, scale: imgScale }} />
          </motion.div>
          <motion.div
            className="care-tag"
            initial={{ opacity: 0, y: -30, rotate: -14 }}
            animate={ready ? { opacity: 1, y: 0, rotate: [-14, 7, -4, 2, 0] } : {}}
            transition={{ delay: 1.1, duration: 2.2, ease: 'easeOut' }}
            drag
            dragSnapToOrigin
            dragElastic={0.4}
            whileDrag={{ rotate: 8, scale: 1.05 }}
            data-cursor="Drag"
          >
            <span className="care-tag__hole" />
            <Mark size={20} />
            <span className="care-tag__brand">ASPEN</span>
            <span className="care-tag__line">Expert care.<br />Impeccable finish.</span>
            <span className="care-tag__no">No. 001 · AHD</span>
          </motion.div>
          <RotatingBadge />
        </div>
      </div>
      <motion.a
        href="#intro"
        className="scroll-cue"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1.6 }}
        aria-label="Scroll to learn more"
      >
        <span />
      </motion.a>
    </section>
  )
}

function RotatingBadge() {
  const text = 'FREE PICKUP & DELIVERY · AHMEDABAD · '
  return (
    <div className="badge" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs><path id="circlePath" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" /></defs>
        <text><textPath href="#circlePath">{text + text}</textPath></text>
      </svg>
      <span className="badge__core"><Mark size={22} /></span>
    </div>
  )
}

// Marquee whose speed and direction follow scroll velocity.
export function Marquee() {
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(vel, [-1000, 0, 1000], [-4, 1, 4], { clamp: false })
  const dir = useRef(1)
  useAnimationFrame((_, delta) => {
    let f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 1.05) dir.current = 1
    const move = dir.current * 2.2 * (delta / 1000) * Math.max(1, Math.abs(f))
    let v = base.get() - move
    if (v < -50) v += 50
    if (v > 0) v -= 50
    base.set(v)
  })
  const x = useTransform(base, (v) => `${v}%`)
  const row = garments.map((g) => (
    <span className="marquee__item" key={g}>
      {g}
      <i className="marquee__dot" aria-hidden="true">✦</i>
    </span>
  ))
  return (
    <div className="marquee" aria-label={`We care for ${garments.join(', ')}`}>
      <motion.div className="marquee__track" style={{ x }} aria-hidden="true">
        {row}{row}
      </motion.div>
    </div>
  )
}

// Paragraph whose words brighten as it scrolls through the viewport.
export function Statement() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const text =
    'Cleaning is only part of the job. At Aspen, every garment is inspected, treated for its fabric and construction, finished by hand and returned ready to wear. Some clothes deserve a little more care.'
  const words = text.split(' ')
  return (
    <section className="statement" id="intro">
      <div className="wrap">
        <p className="eyebrow eyebrow--muted">The Aspen standard</p>
        <p className="statement__text" ref={ref}>
          {words.map((w, i) => {
            const start = i / words.length
            return <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]} accent={/care\.?$/.test(w)}>{w}</Word>
          })}
        </p>
      </div>
    </section>
  )
}

function Word({ children, progress, range, accent }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <span className={`statement__word ${accent ? 'serif-italic gold-text' : ''}`}>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </span>
  )
}
