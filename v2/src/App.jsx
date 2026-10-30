import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence, MotionConfig, motion, useAnimationFrame, useMotionValue, useMotionValueEvent,
  useScroll, useSpring, useTransform, useVelocity,
} from 'framer-motion'
import Lenis from 'lenis'
import {
  chapters, clip, contact, garments, qr, services, shirt, anarkali, slots, tech, wa, wall, wallLabels,
} from './content.js'

const ease = [0.76, 0, 0.24, 1]
const soft = [0.22, 1, 0.36, 1]
const pad = (n) => String(n).padStart(2, '0')

/* ---------- Primitives ---------- */

// Muted looping clip. Plays only while on screen, and only when `playing` is not false.
function Clip({ k, className = '', eager = false, label, playing = true }) {
  const ref = useRef(null)
  const seen = useRef(false)
  const { src, poster } = clip(k)
  useEffect(() => {
    const v = ref.current
    const sync = () => (seen.current && playing ? v.play().catch(() => {}) : v.pause())
    const io = new IntersectionObserver(([e]) => { seen.current = e.isIntersecting; sync() }, { threshold: 0.1 })
    io.observe(v)
    sync()
    return () => io.disconnect()
  }, [playing])
  return (
    <video ref={ref} className={`clip ${className}`} src={src} poster={poster} muted loop playsInline
      preload={eager ? 'auto' : 'metadata'} aria-label={label} />
  )
}

// The Aspen mark in its brand colours only: Aspen Gold peak, Aspen Green sweep. Never recoloured.
const BRAND_GOLD = '#D7A233'
const BRAND_GREEN = '#113C26'

function Mark({ size = 28 }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="258 42 300 360" aria-hidden="true">
      <path d="M405 50 L506 288 C440 282 340 318 268 392 Z" fill={BRAND_GOLD} />
      <path d="M396 354 C440 326 486 312 516 312 L549 394 C512 366 455 350 396 354 Z" fill={BRAND_GREEN} />
    </svg>
  )
}

// On dark backgrounds the logo sits on an ivory plate so its green stays visible.
function Wordmark() {
  return (
    <span className="wordmark">
      <Mark size={26} />
      <span><b>ASPEN</b><i>CLEANERS</i></span>
    </span>
  )
}

function Symbol({ type, size = 30 }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const tub = <path d="M5 12 L9 32 H31 L35 12 M5 12 C9 16 13 16 16 12 C19 16 23 16 26 12 C29 16 32 16 35 12" {...s} />
  const map = {
    dryclean: <><circle cx="20" cy="20" r="14" {...s} /><text x="20" y="25.5" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">P</text></>,
    wash: tub,
    hand: <>{tub}<path d="M16 16 C16 12 24 12 24 16 V22 M20 14 V22" {...s} /></>,
    iron: <><path d="M6 30 H34 C34 22 30 14 22 14 H12 C10 14 9 16 9 18 L6 30 Z" {...s} /><circle cx="18" cy="24" r="1.6" fill="currentColor" /><circle cx="24" cy="24" r="1.6" fill="currentColor" /></>,
    leather: <><circle cx="20" cy="20" r="14" {...s} /><text x="20" y="25" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">L</text></>,
  }
  return <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">{map[type]}</svg>
}

function Lines({ text, className = 'h2', delay = 0, as = 'h2', accent }) {
  const Tag = motion[as]
  return (
    <Tag className={className} aria-label={text.replace(/\n/g, ' ')} initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '-8% 0px' }} variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: delay } } }}>
      {text.split('\n').map((line, i) => (
        <span className="line" key={i} aria-hidden="true">
          <motion.span className={`line__in ${accent === i ? 'accent' : ''}`}
            variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 1, ease: soft } } }}>
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

function Rise({ children, delay = 0, className, as = 'div' }) {
  const M = motion[as]
  return (
    <M className={className} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.9, delay, ease: soft }}>
      {children}
    </M>
  )
}

function Magnetic({ children }) {
  const ref = useRef(null)
  const x = useSpring(0, { stiffness: 200, damping: 15 })
  const y = useSpring(0, { stiffness: 200, damping: 15 })
  return (
    <motion.span ref={ref} className="magnetic" style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.3)
        y.set((e.clientY - r.top - r.height / 2) * 0.3)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}>
      {children}
    </motion.span>
  )
}

function Cursor() {
  const [on, setOn] = useState(false)
  const [label, setLabel] = useState(null)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 450, damping: 38 })
  const sy = useSpring(y, { stiffness: 450, damping: 38 })
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setOn(true)
    document.documentElement.classList.add('has-cursor')
    const move = (e) => {
      x.set(e.clientX); y.set(e.clientY)
      const t = e.target.closest?.('[data-cursor], a, button, input, select, textarea')
      setLabel(t ? t.getAttribute('data-cursor') || '' : null)
    }
    addEventListener('pointermove', move)
    return () => removeEventListener('pointermove', move)
  }, [x, y])
  if (!on) return null
  return (
    <motion.div className={`cursor ${label !== null ? 'is-on' : ''} ${label ? 'has-text' : ''}`} style={{ x: sx, y: sy }}>
      <span>{label}</span>
    </motion.div>
  )
}

/* ---------- Intro (first visit of the session only) ---------- */

function Intro({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div className="intro" exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.9, ease } }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: soft }}>
        <span className="intro__plate"><Mark size={64} /></span>
      </motion.div>
      <motion.p className="intro__line" initial={{ opacity: 0, letterSpacing: '0.5em' }} animate={{ opacity: 1, letterSpacing: '0.26em' }} transition={{ delay: 0.3, duration: 1 }}>
        CARE FOR WHAT MATTERS
      </motion.p>
    </motion.div>
  )
}

/* ---------- Nav ---------- */

const links = [['Services', '#services'], ['Stain test', '#stains'], ['Process', '#process'], ['Studio', '#studio-wall'], ['Pricing', '#pricing'], ['Visit', '#book']]

function Nav() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => {
    setSolid(v > 40)
    setHidden(v > (scrollY.getPrevious() ?? 0) && v > 500 && !open)
  })
  return (
    <>
      <motion.header className={`nav ${solid ? 'is-solid' : ''}`} animate={{ y: hidden ? '-110%' : '0%' }} transition={{ duration: 0.45, ease: soft }}>
        <a href="#top" aria-label="Aspen Cleaners home"><Wordmark /></a>
        <nav className="nav__links" aria-label="Main">
          {links.map(([l, h]) => <a key={h} href={h}><span data-text={l}>{l}</span></a>)}
        </nav>
        <div className="nav__right">
          <ThemeSwitch />
          <Magnetic><a className="btn btn--gold btn--sm" href="#book" data-cursor="Book">Schedule a pickup</a></Magnetic>
          <button className={`burger ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><span /><span /></button>
        </div>
      </motion.header>
      <AnimatePresence>
        {open && (
          <motion.div className="menu" initial={{ clipPath: 'circle(0% at 100% 0%)' }} animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }} transition={{ duration: 0.7, ease }}>
            {links.map(([l, h], i) => (
              <motion.a key={h} href={h} onClick={() => setOpen(false)} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.06 }}>{l}</motion.a>
            ))}
            <a className="btn btn--gold" href="#book" onClick={() => setOpen(false)}>Schedule a pickup</a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ThemeSwitch() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')
  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('aspen-theme', next) } catch { /* storage blocked: choice lasts for this visit */ }
    setTheme(next)
  }
  return (
    <button className="theme" onClick={flip} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} data-cursor={theme === 'dark' ? 'Light' : 'Dark'}>
      <motion.span className="theme__knob" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
        {theme === 'dark'
          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>}
      </motion.span>
    </button>
  )
}

/* ---------- Hero: the Aspen mark as a window that opens onto the studio ---------- */

const MARK_MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='360' viewBox='258 42 300 360'><path d='M405 50 L506 288 C440 282 340 318 268 392 Z'/><path d='M396 354 C440 326 486 312 516 312 L549 394 C512 366 455 350 396 354 Z'/></svg>",
)}")`

function Hero({ ready }) {
  const ref = useRef(null)
  const [wide, setWide] = useState(() => matchMedia('(min-aspect-ratio: 1/1)').matches)
  useEffect(() => {
    const mq = matchMedia('(min-aspect-ratio: 1/1)')
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const base = wide ? 64 : 46
  const h = useTransform(p, [0, 0.62], [base, base * 30], { ease: (t) => t * t * t })
  const size = useTransform(h, (v) => `auto ${v}vh`)
  const rimOpacity = useTransform(p, [0, 0.18], [1, 0])
  const sideL = useTransform(p, [0, 0.3], ['0%', '-60%'])
  const sideR = useTransform(p, [0, 0.3], ['0%', '60%'])
  const sideO = useTransform(p, [0, 0.22], [1, 0])
  const shade = useTransform(p, [0.45, 0.7], [0, 1])
  const finalO = useTransform(p, [0.58, 0.75], [0, 1])
  const finalY = useTransform(p, [0.58, 0.8], [40, 0])
  const vidScale = useTransform(p, [0, 0.7], [1.25, 1])
  const src = clip(wide ? 'hero-wide' : 'hero-tall')
  const vref = useRef(null)
  useEffect(() => { vref.current?.play().catch(() => {}) }, [wide])

  return (
    <section className="mh" id="top" ref={ref}>
      <div className="mh__stage">
        <div className="mh__glow" aria-hidden="true" />
        <motion.div className="mh__window" style={{ WebkitMaskImage: MARK_MASK, maskImage: MARK_MASK, WebkitMaskSize: size, maskSize: size }}
          initial={{ opacity: 0, scale: 0.92 }} animate={ready ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 1.4, ease: soft }}>
          <motion.video ref={vref} key={src.src} className="clip" src={src.src} poster={src.poster} muted loop playsInline autoPlay preload="auto"
            style={{ scale: vidScale }} aria-label="Smoothing a white garment with a heavy gold zari border" />
          <motion.div className="mh__shade" style={{ opacity: shade }} />
        </motion.div>
        <motion.svg className="mh__rim" viewBox="258 42 300 360" style={{ height: useTransform(h, (v) => `${v}vh`), opacity: rimOpacity }} aria-hidden="true">
          <motion.path d="M405 50 L506 288 C440 282 340 318 268 392 Z" fill="none" stroke="var(--gold)" strokeWidth="1" vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }} animate={ready ? { pathLength: 1 } : {}} transition={{ duration: 2.4, delay: 0.3, ease: 'easeInOut' }} />
        </motion.svg>

        <motion.div className="mh__side mh__side--l" style={{ x: sideL, opacity: sideO }}>
          <motion.p className="kicker" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}>Sindhubhavan Road · Ahmedabad</motion.p>
          <h1 className="mh__word">
            <span className="line"><motion.span className="line__in" initial={{ y: '110%' }} animate={ready ? { y: '0%' } : {}} transition={{ duration: 1.2, delay: 0.3, ease: soft }}>Care for</motion.span></span>
          </h1>
        </motion.div>
        <motion.div className="mh__side mh__side--r" style={{ x: sideR, opacity: sideO }} aria-hidden="true">
          <p className="mh__word mh__word--accent">
            <span className="line"><motion.span className="line__in accent shimmer" initial={{ y: '110%' }} animate={ready ? { y: '0%' } : {}} transition={{ duration: 1.2, delay: 0.45, ease: soft }}>what</motion.span></span>
            <span className="line"><motion.span className="line__in accent shimmer" initial={{ y: '110%' }} animate={ready ? { y: '0%' } : {}} transition={{ duration: 1.2, delay: 0.55, ease: soft }}>matters.</motion.span></span>
          </p>
        </motion.div>
        <motion.div className="mh__foot" style={{ opacity: sideO }} initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1, duration: 1 }}>
          <span>Dry cleaning &amp; couture garment care</span>
          <span className="mh__scroll" aria-hidden="true"><i /></span>
          <span>Scroll to step inside</span>
        </motion.div>

        <motion.div className="mh__final" style={{ opacity: finalO, y: finalY }}>
          <p className="eyebrow eyebrow--light">Aspen Cleaners · Ahmedabad</p>
          <h2>Every garment,<br /><em>handled like couture.</em></h2>
          <p className="mh__lede">Italian Firbimatic machines. Stains treated by hand. Finished with steam, packed with gloves, returned to your door.</p>
          <div className="mh__ctas">
            <Magnetic><a className="btn btn--gold btn--lg" href="#book" data-cursor="Book">Schedule a pickup →</a></Magnetic>
            <a className="btn btn--glass btn--lg" href="#stains" data-cursor="Play">Try the stain test</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- Stain test: scrub real-life stains off an Aspen shirt ---------- */

const STAINS = [
  { id: 'haldi', x: 0.3, y: 0.46, r: 0.085, color: [214, 160, 10], label: 'Haldi', note: 'From the sangeet', quip: 'Turmeric is stubborn. We are more stubborn.' },
  { id: 'chai', x: 0.66, y: 0.36, r: 0.07, color: [120, 72, 30], ring: true, label: 'Chai', note: 'Office, 4 pm', quip: 'Cutting chai, cut out.' },
  { id: 'biryani', x: 0.44, y: 0.72, r: 0.08, color: [200, 86, 24], label: 'Biryani', note: 'Sunday lunch', quip: 'Worth it. Every time.' },
  { id: 'holi', x: 0.22, y: 0.8, r: 0.075, color: [214, 38, 120], splatter: true, label: 'Holi', note: 'Last March', quip: 'Keep the memories. Lose the gulal.' },
  { id: 'ink', x: 0.77, y: 0.6, r: 0.05, color: [31, 58, 160], label: 'Ink', note: 'Homework (not yours)', quip: 'Pens leak. Pockets suffer. We fix.' },
  { id: 'lipstick', x: 0.58, y: 0.2, r: 0.045, color: [176, 20, 44], label: 'Lipstick', note: 'We won’t ask', quip: 'Our lips are sealed. Your collar is clean.' },
]

function rand(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

function ScrubGame({ onNext }) {
  const box = useRef(null)
  const canvas = useRef(null)
  const fx = useRef(null)
  const samples = useRef({})
  const bubbles = useRef([])
  const [gone, setGone] = useState([])
  // Source of truth for finished stains; state lags behind fast pointer events.
  const goneIds = useRef(new Set())
  const [last, setLast] = useState(null)
  const [round, setRound] = useState(0)
  const done = gone.length === STAINS.length

  const paint = useCallback(() => {
    const c = canvas.current
    const w = box.current.clientWidth
    const hgt = box.current.clientHeight
    const dpr = Math.min(devicePixelRatio || 1, 2)
    c.width = w * dpr; c.height = hgt * dpr
    const ctx = c.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, hgt)
    samples.current = {}
    STAINS.forEach((s, si) => {
      const R = s.r * w
      const cx = s.x * w
      const cy = s.y * hgt
      const rnd = rand(si * 97 + 13 + round * 7)
      const [r, g, b] = s.color
      for (let i = 0; i < 26; i++) {
        const a = rnd() * Math.PI * 2
        const d = rnd() * R * 0.55
        const rr = R * (0.35 + rnd() * 0.45)
        const x = cx + Math.cos(a) * d
        const y = cy + Math.sin(a) * d
        const gr = ctx.createRadialGradient(x, y, 0, x, y, rr)
        gr.addColorStop(0, `rgba(${r},${g},${b},${0.3 + rnd() * 0.22})`)
        gr.addColorStop(s.ring ? 0.85 : 0.7, `rgba(${r},${g},${b},${s.ring ? 0.42 : 0.22})`)
        gr.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = gr
        ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill()
      }
      if (s.splatter) {
        for (let i = 0; i < 40; i++) {
          const a = rnd() * Math.PI * 2
          const d = R * (0.6 + rnd() * 1.1)
          ctx.fillStyle = `rgba(${i % 3 ? `${r},${g},${b}` : '30,150,70'},${0.35 + rnd() * 0.4})`
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1 + rnd() * R * 0.09, 0, Math.PI * 2); ctx.fill()
        }
      }
      const pts = []
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 * 3.1
        const d = R * 0.75 * Math.sqrt((i + 1) / 36)
        pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d])
      }
      samples.current[s.id] = { pts, hit: new Set() }
    })
  }, [round])

  useEffect(() => {
    paint()
    const ro = new ResizeObserver(() => { goneIds.current.clear(); setGone([]); paint() })
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [paint])

  // bubbles that float up from the brush
  useEffect(() => {
    const c = fx.current
    const ctx = c.getContext('2d')
    let raf
    const loop = () => {
      const w = box.current.clientWidth
      const hgt = box.current.clientHeight
      if (c.width !== w) { c.width = w; c.height = hgt }
      ctx.clearRect(0, 0, w, hgt)
      bubbles.current = bubbles.current.filter((bb) => (bb.life -= 1) > 0)
      for (const bb of bubbles.current) {
        bb.y -= bb.vy; bb.x += Math.sin(bb.life / 6) * 0.4
        ctx.strokeStyle = `rgba(255,255,255,${bb.life / 60})`
        ctx.fillStyle = `rgba(215,162,51,${bb.life / 400})`
        ctx.lineWidth = 1.2
        ctx.beginPath(); ctx.arc(bb.x, bb.y, bb.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const scrubbing = useRef(false)
  const lastPt = useRef(null)
  const scrub = (e) => {
    if (!scrubbing.current) return
    const rect = canvas.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const brush = Math.max(18, rect.width * 0.045)
    const ctx = canvas.current.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    const from = lastPt.current || [x, y]
    const steps = Math.max(1, Math.hypot(x - from[0], y - from[1]) / (brush / 3))
    for (let i = 1; i <= steps; i++) {
      const px = from[0] + ((x - from[0]) * i) / steps
      const py = from[1] + ((y - from[1]) * i) / steps
      const gr = ctx.createRadialGradient(px, py, 0, px, py, brush)
      gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gr
      ctx.beginPath(); ctx.arc(px, py, brush, 0, Math.PI * 2); ctx.fill()
      for (const s of STAINS) {
        const smp = samples.current[s.id]
        if (!smp || goneIds.current.has(s.id)) continue
        smp.pts.forEach(([sx, sy], k) => { if (Math.hypot(sx - px, sy - py) < brush * 0.8) smp.hit.add(k) })
      }
    }
    ctx.globalCompositeOperation = 'source-over'
    lastPt.current = [x, y]
    if (Math.random() < 0.5) bubbles.current.push({ x: x + (Math.random() - 0.5) * brush, y, r: 2 + Math.random() * 6, vy: 0.6 + Math.random() * 1.2, life: 40 + Math.random() * 30 })
    const fresh = STAINS.filter((s) => !goneIds.current.has(s.id) && samples.current[s.id].hit.size / samples.current[s.id].pts.length > 0.7)
    if (fresh.length) {
      fresh.forEach((s) => {
        // wipe whatever is left of a finished stain
        const w = box.current.clientWidth
        const R = s.r * w * 2.2
        ctx.clearRect(s.x * w - R, s.y * box.current.clientHeight - R, R * 2, R * 2)
      })
      fresh.forEach((s) => goneIds.current.add(s.id))
      setGone([...goneIds.current])
      setLast(fresh[fresh.length - 1])
    }
  }

  const reset = () => { goneIds.current.clear(); setGone([]); setLast(null); setRound((r) => r + 1) }

  return (
      <div className="wrap stains__grid">
        <div className="stains__copy">
          <p className="eyebrow">The stain test · Round 1</p>
          <Lines text={'Stained?\nRelax.'} accent={1} />
          <Rise as="p" className="lede">Haldi at the sangeet. Chai at 4 pm. Biryani on a Sunday. Life happens on your clothes, and that is exactly what we are here for.</Rise>
          <Rise as="p" className="stains__rule" delay={0.1}>
            <b>At home, never rub a stain.</b> Here, go ahead. Scrub this shirt clean with your {matchMedia('(pointer: fine)').matches ? 'mouse' : 'finger'}.
          </Rise>
          <div className="stains__meter" aria-live="polite">
            <div className="stains__bar"><motion.span animate={{ width: `${(gone.length / STAINS.length) * 100}%` }} transition={{ duration: 0.6, ease: soft }} /></div>
            <span>{gone.length} of {STAINS.length} stains gone</span>
          </div>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" className="stains__done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p><b>Spotless.</b> We do this every day, with real stains and without the rubbing.</p>
                <div className="stains__ctas">
                  <Magnetic><a className="btn btn--gold" href={wa('Hello Aspen Cleaners, I have a stain that needs your help. Sending a photo.')} target="_blank" rel="noreferrer" data-cursor="Send">Send us your real stain →</a></Magnetic>
                  <button className="text-btn" onClick={onNext}>Round 2: find hidden stains →</button>
                  <button className="text-btn text-btn--quiet" onClick={reset}>Stain it again</button>
                </div>
              </motion.div>
            ) : last ? (
              <motion.p key={last.id} className="stains__quip" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <span>{last.label} gone.</span> {last.quip}
              </motion.p>
            ) : (
              <motion.p key="hint" className="stains__quip stains__quip--hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Start anywhere. Each stain has a story.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="stains__stage">
          <div className="shirt" ref={box}>
            <img src={shirt} alt="A white shirt folded by the Aspen team" draggable="false" />
            <canvas ref={canvas} className="shirt__stains" data-cursor="Scrub"
              onPointerDown={(e) => { scrubbing.current = true; lastPt.current = null; e.currentTarget.setPointerCapture(e.pointerId); scrub(e) }}
              onPointerMove={scrub}
              onPointerUp={() => { scrubbing.current = false }} onPointerCancel={() => { scrubbing.current = false }} />
            <canvas ref={fx} className="shirt__fx" aria-hidden="true" />
            {STAINS.map((s) => (
              <motion.span key={s.id} className={`pin ${s.x > 0.65 ? 'is-right' : ''} ${gone.includes(s.id) ? 'is-gone' : ''}`} style={{ left: `${s.x * 100}%`, top: `${(s.y + s.r * 0.75) * 100}%` }}
                animate={gone.includes(s.id) ? { opacity: 0, y: -14, scale: 0.9 } : { opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, delay: gone.includes(s.id) ? 0.6 : 0 }}>
                <b>{s.label}</b> {s.note}
              </motion.span>
            ))}
            <AnimatePresence>
              {done && (
                <motion.div className="stamp" initial={{ opacity: 0, scale: 2.2, rotate: -24 }} animate={{ opacity: 1, scale: 1, rotate: -12 }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
                  <Mark size={22} />
                  <span>Aspen clean</span>
                  <small>Expert care · Impeccable finish</small>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
  )
}

/* ---------- Round 2: find the stains nobody can see yet ---------- */

const HIDDEN = [
  { id: 'oil', x: 0.28, y: 0.35, r: 0.075, label: 'Hair oil', note: 'Body oils grey a neckline slowly and hold on to dust.' },
  { id: 'attar', x: 0.6, y: 0.41, r: 0.075, label: 'Attar', note: 'Perfume oils dry clear, then oxidise into brown marks.' },
  { id: 'sweat', x: 0.15, y: 0.5, r: 0.08, label: 'Sweat', note: 'Invisible tonight. Yellow by next Diwali.' },
  { id: 'sharbat', x: 0.3, y: 0.68, r: 0.08, label: 'Rooh Afza', note: 'Sugar dries clear. Iron it and it caramelises brown.' },
  { id: 'makeup', x: 0.72, y: 0.6, r: 0.075, label: 'Foundation', note: 'From a hug. Skin tones hide on ivory, until they don’t.' },
]

function SpotGame({ onBack }) {
  const stage = useRef(null)
  const [pos, setPos] = useState(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [found, setFound] = useState([])
  const [last, setLast] = useState(null)
  const [near, setNear] = useState(null)
  const timer = useRef(null)
  const done = found.length === HIDDEN.length
  const zoom = 2.4
  const lens = size.w < 380 ? 120 : 160

  useEffect(() => {
    const m = () => setSize({ w: stage.current.clientWidth, h: stage.current.clientHeight })
    m()
    const ro = new ResizeObserver(m)
    ro.observe(stage.current)
    return () => { ro.disconnect(); clearTimeout(timer.current) }
  }, [])

  const look = (e) => {
    const r = stage.current.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    setPos({ x, y })
    const hit = HIDDEN.find((h) => !found.includes(h.id) && Math.hypot(h.x * r.width - x, h.y * r.height - y) < h.r * r.width * 0.9)
    if (hit?.id !== near) {
      clearTimeout(timer.current)
      setNear(hit?.id || null)
      if (hit) {
        timer.current = setTimeout(() => {
          setFound((f) => (f.includes(hit.id) ? f : [...f, hit.id]))
          setLast(hit)
          setNear(null)
        }, 650)
      }
    }
  }
  const reset = () => { setFound([]); setLast(null); setNear(null) }

  return (
    <div className="wrap stains__grid">
      <div className="stains__copy">
        <p className="eyebrow">The stain test · Round 2</p>
        <Lines text={'Can’t see it?\nWe can.'} accent={1} />
        <Rise as="p" className="lede">Some stains are invisible today and permanent tomorrow. Sugar, sweat, perfume and body oil dry clear, then turn yellow or brown with heat and time.</Rise>
        <Rise as="p" className="stains__rule" delay={0.1}>
          <b>This anarkali looks spotless.</b> It isn’t. Move the loupe over it and hold still when you think you have found something.
        </Rise>
        <div className="stains__meter" aria-live="polite">
          <div className="stains__bar"><motion.span animate={{ width: `${(found.length / HIDDEN.length) * 100}%` }} transition={{ duration: 0.6, ease: soft }} /></div>
          <span>{found.length} of {HIDDEN.length} hidden stains found</span>
        </div>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" className="stains__done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p><b>Found them all.</b> Our team checks every garment for these at inspection, before it goes anywhere near a machine.</p>
              <div className="stains__ctas">
                <Magnetic><a className="btn btn--gold" href="#book" data-cursor="Book">Schedule a pickup →</a></Magnetic>
                <button className="text-btn" onClick={reset}>Play again</button>
                <button className="text-btn text-btn--quiet" onClick={onBack}>Back to round 1</button>
              </div>
            </motion.div>
          ) : last ? (
            <motion.p key={last.id} className="stains__quip" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <span>{last.label}.</span> {last.note}
            </motion.p>
          ) : (
            <motion.p key="hint" className="stains__quip stains__quip--hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Hint: start where the garment touches skin.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="stains__stage">
        <div className="garment" ref={stage} data-cursor=""
          onPointerMove={look} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); look(e) }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') { setPos(null); setNear(null); clearTimeout(timer.current) } }}>
          <img src={anarkali} alt="An ivory anarkali held up by a gloved hand" draggable="false" />
          {HIDDEN.filter((h) => found.includes(h.id)).map((h) => (
            <motion.span key={h.id} className="found" style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.r * 200}%` }}
              initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
              <b className={h.x > 0.62 ? 'is-right' : ''}>{h.label}</b>
            </motion.span>
          ))}
          {!pos && !done && <span className="garment__hint">{matchMedia('(pointer: fine)').matches ? 'Move your mouse here' : 'Touch and drag to inspect'}</span>}
          {pos && size.w > 0 && (
            <div className={`loupe ${near ? 'is-near' : ''}`} style={{ width: lens, height: lens, left: pos.x - lens / 2, top: pos.y - lens / 2 }} aria-hidden="true">
              <div className="loupe__inner" style={{ width: size.w * zoom, height: size.h * zoom, transform: `translate(${-(pos.x * zoom - lens / 2)}px, ${-(pos.y * zoom - lens / 2)}px)` }}>
                <img src={anarkali} alt="" draggable="false" />
                {HIDDEN.map((h) => (
                  <span key={h.id} className={`ghost ${found.includes(h.id) ? 'is-found' : ''}`} style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.r * 200}%` }} />
                ))}
              </div>
              {near && <span className="loupe__ring" />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StainLab() {
  const [mode, setMode] = useState('scrub')
  const go = (m) => {
    setMode(m)
    document.getElementById('stains')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <section className="stains" id="stains">
      <div className="wrap">
        <div className="rounds" role="tablist" aria-label="Stain test rounds">
          {[['scrub', 'Round 1 · Scrub it'], ['spot', 'Round 2 · Spot it']].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={mode === k} className={mode === k ? 'is-on' : ''} onClick={() => setMode(k)}>
              {mode === k && <motion.span layoutId="round-bg" className="rounds__bg" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="rounds__label">{l}</span>
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: soft }}>
          {mode === 'scrub' ? <ScrubGame onNext={() => go('spot')} /> : <SpotGame onBack={() => go('scrub')} />}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

/* ---------- Marquee with scroll velocity ---------- */

function Marquee() {
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(vel, [-1000, 0, 1000], [-4, 1, 4], { clamp: false })
  const dir = useRef(1)
  useAnimationFrame((_, d) => {
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 1.05) dir.current = 1
    let v = base.get() - dir.current * 2 * (d / 1000) * Math.max(1, Math.abs(f))
    if (v < -50) v += 50
    if (v > 0) v -= 50
    base.set(v)
  })
  const x = useTransform(base, (v) => `${v}%`)
  const row = garments.map((g) => <span key={g}>{g}<i className="marquee__dot" aria-hidden="true">✦</i></span>)
  return (
    <div className="marquee" aria-label={`We care for ${garments.join(', ')}`}>
      <motion.div className="marquee__track" style={{ x }} aria-hidden="true">{row}{row}</motion.div>
    </div>
  )
}

/* ---------- Services: care-label cards that flip ---------- */

function LabelCard({ s, i }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <motion.div className="lc" initial={{ opacity: 0, y: 60, rotate: i % 2 ? 2 : -2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 1, delay: (i % 3) * 0.1, ease: soft }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setFlipped(true)} onPointerLeave={(e) => e.pointerType === 'mouse' && setFlipped(false)}>
      <span className="lc__loop" aria-hidden="true" />
      <motion.div className="lc__inner" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.9, ease }}>
        <div className="lc__face lc__front">
          <div className="lc__top"><span className="num">{pad(i + 1)}</span><span className="lc__sym"><Symbol type={s.symbol} size={26} /></span></div>
          <div className="lc__window"><Clip k={s.clip} label={s.title} /></div>
          <h3>{s.title}</h3>
          <p>{s.line}</p>
          <button className="lc__flip" onClick={() => setFlipped(true)} aria-label={`More about ${s.title}`}>How we care ↻</button>
        </div>
        <div className="lc__face lc__back" aria-hidden={!flipped}>
          <span className="num">{pad(i + 1)} · Care method</span>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
          <a className="btn btn--gold btn--sm" href={wa(`Hello Aspen Cleaners, I would like to book ${s.title}.`)} target="_blank" rel="noreferrer" tabIndex={flipped ? 0 : -1}>Book {s.title.toLowerCase()} →</a>
          <button className="lc__flip lc__flip--back" onClick={() => setFlipped(false)} tabIndex={flipped ? 0 : -1}>↺ Back</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Services() {
  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="head head--split">
          <div>
            <p className="eyebrow">What we care for</p>
            <Lines text={'Because every fabric\nis different.'} accent={1} />
          </div>
          <Rise as="p" className="lede">Every service has its own care label. Hover a label, or tap it on your phone, to turn it over and see how we work.</Rise>
        </div>
        <div className="labels">{services.map((s, i) => <LabelCard s={s} i={i} key={s.key} />)}</div>
      </div>
    </section>
  )
}

/* ---------- Process: pinned chapters with one tall screen ---------- */

function Process() {
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => setI(Math.min(chapters.length - 1, Math.max(0, Math.floor(v * chapters.length)))))
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const c = chapters[i]
  return (
    <section className="process" id="process" ref={ref} style={{ height: `${chapters.length * 34 + 60}vh` }}>
      <div className="process__sticky">
        <div className="process__side">
          <p className="eyebrow eyebrow--light">Here is what happens at Aspen</p>
          <ol>
            {chapters.map((ch, j) => (
              <li key={ch.key} className={j === i ? 'is-on' : j < i ? 'is-done' : ''}>
                <span className="num">{pad(j + 1)}</span><span className="name">{ch.title}</span>
              </li>
            ))}
          </ol>
          <div className="process__bar"><motion.span style={{ height: bar }} /></div>
        </div>
        <div className="process__screen">
          <AnimatePresence mode="popLayout">
            <motion.div key={c.key} className="process__frame"
              initial={{ clipPath: 'inset(100% 0 0 0 round 28px)', scale: 1.08 }}
              animate={{ clipPath: 'inset(0% 0 0 0 round 28px)', scale: 1 }}
              exit={{ opacity: 0.3, scale: 0.95, transition: { duration: 0.6 } }}
              transition={{ duration: 0.9, ease }}>
              <Clip k={c.clip} label={c.title} />
            </motion.div>
          </AnimatePresence>
          <span className="process__meta">{c.meta}</span>
        </div>
        <div className="process__text" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={c.key} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: soft }}>
              <p className="process__count">Step {i + 1} of {chapters.length}</p>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ---------- Technology: three tilt cards ---------- */

function TiltCard({ t, i }) {
  const rx = useSpring(0, { stiffness: 150, damping: 15 })
  const ry = useSpring(0, { stiffness: 150, damping: 15 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glare = useTransform([gx, gy], ([a, b]) => `radial-gradient(circle at ${a}% ${b}%, rgba(255,236,190,0.28), transparent 55%)`)
  return (
    <motion.article className="spec" style={{ rotateX: rx, rotateY: ry }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry.set((px - 0.5) * 12); rx.set((0.5 - py) * 12); gx.set(px * 100); gy.set(py * 100)
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0) }}
      initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, delay: i * 0.1, ease: soft }}>
      <div className="spec__media"><Clip k={t.clip} label={t.name} /></div>
      <motion.div className="spec__glare" style={{ background: glare }} />
      <div className="spec__body">
        <span className="spec__label">{t.label}</span>
        <h3>{t.name}</h3>
        <p>{t.detail}</p>
      </div>
    </motion.article>
  )
}

function Technology() {
  return (
    <section className="tech" id="technology">
      <div className="wrap tech__grid">
        <div className="tech__copy">
          <p className="eyebrow eyebrow--light">Behind the finish</p>
          <Lines text={'Built in Italy.\nRun by specialists.'} className="h2 h2--light" accent={1} />
          <p className="lede lede--light">The machines matter. The people who choose the cycle matter more. This is the equipment your clothes meet at Aspen.</p>
        </div>
        <div className="specs">{tech.map((t, i) => <TiltCard t={t} i={i} key={t.name} />)}</div>
      </div>
    </section>
  )
}

/* ---------- Studio wall: drifting video columns ---------- */

function Reel() {
  const [open, setOpen] = useState(null)
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setOpen(null)
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [])
  return (
    <section className="reel" id="studio-wall">
      <div className="wrap head head--split">
        <div>
          <p className="eyebrow eyebrow--light">Studio reel</p>
          <Lines text={'No stock footage.\nJust our floor.'} className="h2 h2--light" accent={1} />
        </div>
        <p className="lede lede--light">Twelve moments from the Aspen studio. Hover to pause a column, click any clip to watch it full size.</p>
      </div>
      <div className="wrap">
        <div className="wall">
          {wall.map((col, c) => (
            <div className={`wall__col ${c % 2 ? 'is-down' : ''}`} key={c} style={{ '--dur': `${34 + c * 6}s` }}>
              <div className="wall__track">
                {[...col, ...col].map((k, j) => (
                  <button key={`${k}-${j}`} className="wall__item" onClick={() => setOpen(k)} data-cursor="Play" aria-label={`Watch ${wallLabels[k]}`} tabIndex={j < col.length ? 0 : -1} aria-hidden={j >= col.length || undefined}>
                    <Clip k={k} label={wallLabels[k]} />
                    <span className="wall__label">{wallLabels[k]}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div className="lightbox__frame" initial={{ scale: 0.85, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, ease: soft }} onClick={(e) => e.stopPropagation()}>
              <Clip k={open} eager label={wallLabels[open]} />
            </motion.div>
            <p className="lightbox__label">{wallLabels[open]}</p>
            <button className="lightbox__close" onClick={() => setOpen(null)}>Close ✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ---------- Pricing: honest quote flow ---------- */

function Pricing() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [-7, 7])
  const y = useTransform(scrollYProgress, [0, 1], ['14%', '-14%'])
  const steps = [
    ['Send a photo', 'WhatsApp us a picture of the garment and any stains or delicate work.'],
    ['Get a price', 'Our team replies with the price and the care it needs, usually within minutes in studio hours.'],
    ['We collect', 'Pick a time. We collect from your door and return it ready to wear.'],
  ]
  return (
    <section className="pricing" id="pricing" ref={ref}>
      <div className="wrap pricing__grid">
        <div>
          <p className="eyebrow">Pricing</p>
          <Lines text={'Every garment is\npriced for its care.'} accent={1} />
          <Rise as="p" className="lede">A cotton shirt and a bridal lehenga need very different work. Rather than guess, send us a photo and get an exact price.</Rise>
          <ol className="steps">
            {steps.map(([t, d], i) => (
              <Rise as="li" key={t} delay={i * 0.08}><span className="num">{pad(i + 1)}</span><div><h3>{t}</h3><p>{d}</p></div></Rise>
            ))}
          </ol>
          <Magnetic>
            <a className="btn btn--green btn--lg" href={wa('Hello Aspen Cleaners, I would like a price. I am sending a photo of my garment.')} target="_blank" rel="noreferrer" data-cursor="Send">
              Get a price on WhatsApp →
            </a>
          </Magnetic>
        </div>
        <motion.div className="pricing__pack" style={{ rotate, y }}>
          <Clip k="166" label="A shirt being sealed in Aspen packaging" />
          <span className="pricing__chip">Returned sealed &amp; tagged</span>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- Booking ---------- */

function Book() {
  const [f, setF] = useState({ name: '', phone: '', area: '', date: '', slot: slots[0], items: ['Dry Cleaning'], notes: '' })
  const [tried, setTried] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const toggle = (t) => setF({ ...f, items: f.items.includes(t) ? f.items.filter((x) => x !== t) : [...f.items, t] })
  const valid = f.name.trim().length > 1 && f.phone.replace(/\D/g, '').length >= 10 && f.area.trim().length > 2
  const msg = useMemo(() => [
    'Hello Aspen Cleaners, I would like to schedule a pickup.', '',
    `Name: ${f.name}`, `Phone: ${f.phone}`, `Pickup area: ${f.area}`, `Services: ${f.items.join(', ') || '-'}`,
    `Preferred date: ${f.date || 'Earliest available'}`, `Time: ${f.slot}`, ...(f.notes.trim() ? [`Notes: ${f.notes.trim()}`] : []),
  ].join('\n'), [f])
  return (
    <section className="book" id="book">
      <div className="book__bg"><Clip k="139" label="The Aspen studio at night" /></div>
      <div className="book__veil" />
      <div className="wrap book__grid">
        <div>
          <p className="eyebrow eyebrow--light">Schedule a pickup</p>
          <Lines text={'Let Aspen take\ncare of it.'} className="h2 h2--light" accent={1} />
          <address className="book__addr">{contact.address.map((l) => <span key={l}>{l}</span>)}</address>
          <a className="link link--light" href={contact.maps} target="_blank" rel="noreferrer">Get directions →</a>
          <div className="book__phones">
            {contact.phones.map((p) => <a key={p.number} href={`tel:+${p.number}`}><span>Call or WhatsApp</span><strong>{p.label}</strong></a>)}
          </div>
        </div>
        <form className="form" onSubmit={(e) => { e.preventDefault(); setTried(true) }} noValidate>
          <div className="form__row">
            <Field id="b-name" label="Your name" value={f.name} onChange={set('name')} autoComplete="name" bad={tried && f.name.trim().length < 2} />
            <Field id="b-phone" label="Mobile number" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" bad={tried && f.phone.replace(/\D/g, '').length < 10} />
          </div>
          <Field id="b-area" label="Pickup address or area" value={f.area} onChange={set('area')} autoComplete="street-address" bad={tried && f.area.trim().length < 3} />
          <fieldset>
            <legend>What are you sending?</legend>
            <div className="chips">
              {services.map((s) => (
                <button type="button" key={s.key} className={f.items.includes(s.title) ? 'is-on' : ''} aria-pressed={f.items.includes(s.title)} onClick={() => toggle(s.title)}>
                  <Symbol type={s.symbol} size={18} /> {s.title}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="form__row">
            <Field id="b-date" label="Preferred date" type="date" value={f.date} onChange={set('date')} />
            <div className="field">
              <select id="b-slot" value={f.slot} onChange={set('slot')}>{slots.map((s) => <option key={s}>{s}</option>)}</select>
              <label htmlFor="b-slot" className="up">Time</label>
            </div>
          </div>
          <Field id="b-notes" label="Anything we should know? Stains, delicate work, count" value={f.notes} onChange={set('notes')} textarea />
          <div className="form__go">
            {valid ? (
              <Magnetic><a className="btn btn--gold btn--lg" href={wa(msg)} target="_blank" rel="noreferrer" data-cursor="Send">Continue on WhatsApp →</a></Magnetic>
            ) : (
              <button type="submit" className="btn btn--gold btn--lg">Continue on WhatsApp →</button>
            )}
            <p aria-live="polite">{tried && !valid ? 'Add your name, a 10-digit mobile number and your area.' : 'Nothing is sent until you press send in WhatsApp.'}</p>
          </div>
        </form>
      </div>
    </section>
  )
}

function Field({ id, label, textarea, bad, ...rest }) {
  const Tag = textarea ? 'textarea' : 'input'
  const up = rest.type === 'date' || (rest.value && rest.value.length > 0)
  return (
    <div className={`field ${bad ? 'is-bad' : ''}`}>
      <Tag id={id} placeholder=" " rows={textarea ? 2 : undefined} aria-invalid={bad || undefined} {...rest} />
      <label htmlFor={id} className={up ? 'up' : ''}>{label}</label>
    </div>
  )
}

/* ---------- Footer ---------- */

function Footer() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['40%', '0%'])
  return (
    <footer className="footer" ref={ref}>
      <div className="wrap footer__grid">
        <div><Wordmark /><p>Dry cleaning &amp; garment care.<br />Care for what matters.</p></div>
        <div><h4>Visit</h4><p>{contact.address.map((l) => <span key={l}>{l}</span>)}</p><a href={contact.maps} target="_blank" rel="noreferrer">Open in Google Maps</a></div>
        <div><h4>Call or WhatsApp</h4>{contact.phones.map((p) => <p key={p.number} className="footer__num"><a href={`tel:+${p.number}`}>{p.label}</a></p>)}<a href={wa('Hello Aspen Cleaners')} target="_blank" rel="noreferrer">Message us</a></div>
        <a className="footer__ig" href={contact.instagram} target="_blank" rel="noreferrer" data-cursor="Follow">
          <img src={qr} alt="Instagram QR code for @aspen_cleaners_ahmedabad" /><span>{contact.instagramHandle}</span>
        </a>
      </div>
      <div className="footer__giant" aria-hidden="true"><motion.span style={{ y }}>ASPEN</motion.span></div>
      <div className="wrap footer__base"><span>© {new Date().getFullYear()} Aspen Cleaners, Ahmedabad</span><a href="#top">Back to top ↑</a></div>
    </footer>
  )
}

function Fab({ show }) {
  const [intro, setIntro] = useState(true)
  useEffect(() => { if (show) { const t = setTimeout(() => setIntro(false), 4500); return () => clearTimeout(t) } }, [show])
  return (
    <AnimatePresence>
      {show && (
        <motion.a className={`fab ${intro ? 'is-intro' : ''}`} href={wa('Hello Aspen Cleaners, I would like to schedule a pickup.')} target="_blank" rel="noreferrer"
          aria-label="Schedule a pickup on WhatsApp" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 18 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z" /></svg>
          <span>Schedule a pickup</span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

function MobileBar() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setShow(v > innerHeight * 1.2))
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="mbar" initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '110%' }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}>
          <div><b>Pickup today?</b><span>Free collection across Ahmedabad</span></div>
          <a className="btn btn--gold btn--sm" href={wa('Hello Aspen Cleaners, I would like a pickup today.')} target="_blank" rel="noreferrer">Book on WhatsApp</a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function firstVisit() {
  try {
    if (sessionStorage.getItem('aspen-intro')) return false
    sessionStorage.setItem('aspen-intro', '1')
  } catch { /* storage blocked: show the intro */ }
  return true
}

export default function App() {
  const [ready, setReady] = useState(() => !firstVisit())
  const done = useCallback(() => setReady(true), [])
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.15, anchors: { offset: -60 } })
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy() }
  }, [])
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{!ready && <Intro key="intro" onDone={done} />}</AnimatePresence>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <StainLab />
        <Services />
        <Process />
        <Technology />
        <Reel />
        <Pricing />
        <Book />
      </main>
      <Footer />
      <Fab show={ready} />
      <MobileBar />
    </MotionConfig>
  )
}
