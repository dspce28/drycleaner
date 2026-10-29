import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { Arrow } from './Brand.jsx'
import { FadeUp, RevealText } from './Interaction.jsx'
import { moments, wardrobe, waLink } from '../data.js'

// Slow-moving gold threads, like light catching zari. Pauses when off screen.
export function SilkThreads({ color = '215, 162, 51', lines = 14, opacity = 0.5, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0, visible = true, t = Math.random() * 100
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < lines; i++) {
        const p = i / lines
        ctx.beginPath()
        for (let x = -20; x <= w + 20; x += 16) {
          const y =
            h * (0.2 + p * 0.65) +
            Math.sin(x * 0.0032 + t * 0.6 + p * 4) * h * 0.09 +
            Math.sin(x * 0.0011 - t * 0.35 + p * 2) * h * 0.06
          x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(${color}, ${opacity * (0.25 + 0.75 * Math.sin(p * Math.PI))})`
        ctx.lineWidth = 0.7 + Math.sin(p * Math.PI) * 0.8
        ctx.stroke()
      }
    }
    const loop = () => {
      if (visible) { t += 0.008; draw() }
      raf = requestAnimationFrame(loop)
    }
    resize()
    draw()
    if (!reduce) raf = requestAnimationFrame(loop)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(canvas)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', resize) }
  }, [color, lines, opacity])
  return <canvas ref={ref} className={`threads ${className}`} aria-hidden="true" />
}

// Image that uncovers itself with a curtain wipe as it enters the viewport.
export function RevealImage({ src, alt = '', className = '', delay = 0 }) {
  return (
    <motion.div
      className={`reveal-img ${className}`}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.2, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        initial={{ scale: 1.3 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1.8, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  )
}

// Large garment index; hovering a row floats its photograph beside the cursor.
export function Wardrobe() {
  const ref = useRef(null)
  const [active, setActive] = useState(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 150, damping: 20, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 150, damping: 20, mass: 0.6 })
  const rot = useSpring(0, { stiffness: 120, damping: 14 })
  const last = useRef(0)
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
    rot.set(Math.max(-10, Math.min(10, (e.clientX - last.current) * 0.6)))
    last.current = e.clientX
  }
  return (
    <section className="wardrobe" id="wardrobe">
      <div className="wrap">
        <div className="section-head section-head--split">
          <div>
            <p className="eyebrow">An Indian wardrobe</p>
            <h2 className="h2"><RevealText text="Specialist care for" /> <RevealText text="special garments." className="serif-italic gold-text" delay={0.15} /></h2>
          </div>
          <FadeUp as="p" className="section-head__lede">
            From a grandmother's Kanjeevaram to this season's sherwani, we know how each piece is made and what it needs.
          </FadeUp>
        </div>
        <div className="wardrobe__list" ref={ref} onPointerMove={move} onPointerLeave={() => setActive(null)}>
          {wardrobe.map((w, i) => (
            <a
              key={w.name}
              href={waLink(`Hello Aspen Cleaners, I would like to send my ${w.name.toLowerCase()} for care.`)}
              target="_blank"
              rel="noreferrer"
              className={`wardrobe__row ${active === i ? 'is-active' : ''} ${active !== null && active !== i ? 'is-dim' : ''}`}
              onPointerEnter={() => setActive(i)}
              data-cursor="Book"
            >
              <span className="wardrobe__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="wardrobe__name">{w.name}</span>
              <span className="wardrobe__note">{w.note}</span>
              <img className="wardrobe__thumb" src={w.image} alt="" loading="lazy" />
              <span className="wardrobe__arrow"><Arrow size={20} /></span>
            </a>
          ))}
          <motion.div className="wardrobe__float" style={{ x: sx, y: sy, rotate: rot }} aria-hidden="true">
            <AnimatePresence>
              {active !== null && (
                <motion.img
                  key={active}
                  src={wardrobe[active].image}
                  alt=""
                  initial={{ opacity: 0, scale: 0.85, clipPath: 'inset(50% 0 50% 0 round 18px)' }}
                  animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0 0% 0 round 18px)' }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// A framed photograph that opens to full bleed as you scroll, then two companion moments.
export function Moments() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const inset = useTransform(scrollYProgress, [0, 0.6], [14, 0])
  const radius = useTransform(scrollYProgress, [0, 0.6], [28, 0])
  const clip = useTransform([inset, radius], ([i, r]) => `inset(${i}% ${i * 1.6}% ${i}% ${i * 1.6}% round ${r}px)`)
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1])
  const textOpacity = useTransform(scrollYProgress, [0.35, 0.65], [0, 1])
  const textY = useTransform(scrollYProgress, [0.35, 0.7], [60, 0])
  const [first, ...rest] = moments
  return (
    <section className="moments">
      <div className="moments__pin" ref={ref}>
        <div className="moments__sticky">
          <motion.div className="moments__frame" style={{ clipPath: clip }}>
            <motion.img src={first.image} alt="Bride in an embroidered red and gold lehenga" style={{ scale }} />
            <div className="moments__shade" />
          </motion.div>
          <motion.div className="wrap moments__copy" style={{ opacity: textOpacity, y: textY }}>
            <p className="eyebrow eyebrow--light">Aspen moments</p>
            <h2 className="moments__line">{first.line}</h2>
            <p className="moments__sub">{first.sub}</p>
          </motion.div>
        </div>
      </div>
      <div className="wrap moments__pair">
        {rest.map((m, i) => (
          <MomentCard key={m.line} m={m} offset={i === 1} />
        ))}
      </div>
    </section>
  )
}

function MomentCard({ m, offset }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], offset ? ['10%', '-14%'] : ['0%', '-6%'])
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <motion.figure className={`moment ${offset ? 'moment--offset' : ''}`} ref={ref} style={{ y }}>
      <div className="moment__media">
        <motion.img src={m.image} alt="" loading="lazy" style={{ y: imgY }} />
      </div>
      <figcaption>
        <h3 className="moment__line">{m.line}</h3>
        <p>{m.sub}</p>
      </figcaption>
    </motion.figure>
  )
}
