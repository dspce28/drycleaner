import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence, MotionConfig, motion, useAnimationFrame, useMotionValue, useMotionValueEvent,
  useScroll, useSpring, useTransform, useVelocity,
} from 'framer-motion'
import Lenis from 'lenis'
import {
  chapters, clip, contact, garments, qr, quiz, services, slots, tech, wa, wall, wallLabels, wardrobe,
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

function Mark({ size = 28, light = false }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="258 42 300 360" aria-hidden="true">
      <path d="M405 50 L506 288 C440 282 340 318 268 392 Z" fill="var(--gold)" />
      <path d="M396 354 C440 326 486 312 516 312 L549 394 C512 366 455 350 396 354 Z" fill={light ? 'var(--paper)' : 'var(--green)'} />
    </svg>
  )
}

function Wordmark({ light = false }) {
  return (
    <span className={`wordmark ${light ? 'is-light' : ''}`}>
      <Mark size={26} light={light} />
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
        <Mark size={64} light />
      </motion.div>
      <motion.p className="intro__line" initial={{ opacity: 0, letterSpacing: '0.5em' }} animate={{ opacity: 1, letterSpacing: '0.26em' }} transition={{ delay: 0.3, duration: 1 }}>
        CARE FOR WHAT MATTERS
      </motion.p>
    </motion.div>
  )
}

/* ---------- Nav ---------- */

const links = [['Services', '#services'], ['Process', '#process'], ['Studio', '#studio'], ['Pricing', '#pricing'], ['Visit', '#book']]

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

/* ---------- Hero ---------- */

function Hero({ ready }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yA = useTransform(scrollYProgress, [0, 1], ['0%', '-14%'])
  const yB = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const yC = useTransform(scrollYProgress, [0, 1], ['0%', '-24%'])
  const tx = useSpring(0, { stiffness: 60, damping: 18 })
  const ty = useSpring(0, { stiffness: 60, damping: 18 })
  const frames = [
    { k: '153', y: yA, cls: 'a', label: 'Folding a silk saree with gloved hands' },
    { k: '147', y: yB, cls: 'b', label: 'Steaming an embroidered anarkali' },
    { k: '168', y: yC, cls: 'c', label: 'A shirt sealed in Aspen packaging' },
  ]
  return (
    <section className="hero" id="top" ref={ref}
      onPointerMove={(e) => { tx.set((e.clientX / innerWidth - 0.5) * -24); ty.set((e.clientY / innerHeight - 0.5) * -16) }}>
      <div className="hero__copy">
        <motion.p className="kicker" initial={{ opacity: 0, y: 12 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1, duration: 0.8 }}>
          <Mark size={14} /> Dry cleaning &amp; garment care · Ahmedabad
        </motion.p>
        <h1 className="hero__title">
          {['Care for', 'what matters.'].map((l, i) => (
            <span className="line" key={l}>
              <motion.span className={`line__in ${i === 1 ? 'accent shimmer' : ''}`} initial={{ y: '110%' }} animate={ready ? { y: '0%' } : {}}
                transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: soft }}>{l}</motion.span>
            </span>
          ))}
        </h1>
        <motion.p className="hero__lede" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6, duration: 0.9 }}>
          Silk sarees, bridal lehengas and everyday shirts, cleaned in Italian machines, finished by hand and packed with gloves. Collected from your door, returned ready to wear.
        </motion.p>
        <motion.div className="hero__ctas" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.75, duration: 0.9 }}>
          <Magnetic><a className="btn btn--gold btn--lg" href="#book" data-cursor="Book">Schedule a pickup →</a></Magnetic>
          <a className="btn btn--line btn--lg" href="#process" data-cursor="Watch">Watch the process</a>
        </motion.div>
        <motion.ul className="hero__facts" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 1, duration: 1 }}>
          <li><b>Free</b> pickup &amp; delivery</li>
          <li><b>Italian</b> Firbimatic machines</li>
          <li><b>Gloved</b> packing</li>
        </motion.ul>
      </div>
      <motion.div className="hero__stage" style={{ x: tx, y: ty }}>
        {frames.map((f, i) => (
          <motion.div key={f.k} className={`hero__frame hero__frame--${f.cls}`} style={{ y: f.y }}
            initial={{ clipPath: 'inset(100% 0 0 0 round 999px 999px 24px 24px)' }}
            animate={ready ? { clipPath: 'inset(0% 0 0 0 round 999px 999px 24px 24px)' } : {}}
            transition={{ duration: 1.3, delay: 0.15 + i * 0.15, ease }}>
            <Clip k={f.k} eager label={f.label} />
          </motion.div>
        ))}
        <motion.div className="tag" drag dragSnapToOrigin dragElastic={0.5} whileDrag={{ rotate: 10, scale: 1.06 }} data-cursor="Drag"
          initial={{ opacity: 0, y: -30, rotate: -14 }} animate={ready ? { opacity: 1, y: 0, rotate: [-14, 7, -4, 2, 0] } : {}}
          transition={{ delay: 1.1, duration: 2.2 }}>
          <span className="tag__hole" />
          <Mark size={18} />
          <b>ASPEN</b>
          <span>Expert care.<br />Impeccable finish.</span>
          <em>No. 001 · AHD</em>
        </motion.div>
        <div className="badge" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs><path id="circ" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" /></defs>
            <text><textPath href="#circ">MADE IN ITALY · HAND FINISHED · MADE IN ITALY · HAND FINISHED · </textPath></text>
          </svg>
          <span><Mark size={20} light /></span>
        </div>
      </motion.div>
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
  const row = garments.map((g) => <span key={g}>{g}<Mark size={15} light /></span>)
  return (
    <div className="marquee" aria-label={`We care for ${garments.join(', ')}`}>
      <motion.div className="marquee__track" style={{ x }} aria-hidden="true">{row}{row}</motion.div>
    </div>
  )
}

/* ---------- Statement that lights up as you read ---------- */

function Word({ children, progress, range, accent }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return <span className={accent ? 'accent' : ''}><motion.span style={{ opacity }}>{children}</motion.span>{' '}</span>
}

function Statement() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const words = 'Cleaning is only part of the job. Every garment is inspected, treated for its fabric, finished by hand and returned ready to wear. Some clothes deserve a little more care.'.split(' ')
  return (
    <section className="statement">
      <div className="wrap">
        <p className="eyebrow">The Aspen standard</p>
        <p className="statement__text" ref={ref}>
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={/^care\.?$/.test(w)}>{w}</Word>
          ))}
        </p>
      </div>
    </section>
  )
}

/* ---------- Services: expanding video panels ---------- */

function Services() {
  const [active, setActive] = useState(0)
  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="head head--split">
          <div>
            <p className="eyebrow">What we care for</p>
            <Lines text={'Because every fabric\nis different.'} accent={1} />
          </div>
          <Rise as="p" className="lede">Six services, one standard. Hover a service to see it being done in our studio.</Rise>
        </div>
        <div className="panels">
          {services.map((s, i) => {
            const on = i === active
            return (
              <motion.article key={s.key} layout transition={{ layout: { duration: 0.7, ease } }}
                className={`panel ${on ? 'is-on' : ''}`} tabIndex={0} data-cursor={on ? '' : 'Open'}
                onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}>
                <Clip k={s.clip} label={s.title} playing={on} />
                <div className="panel__shade" />
                <span className="panel__num">{pad(i + 1)}</span>
                <h3 className="panel__title">{s.title}</h3>
                <AnimatePresence mode="wait">
                  {on && (
                    <motion.div className="panel__body" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.6 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                      <span className="panel__sym"><Symbol type={s.symbol} /></span>
                      <p className="panel__line">{s.line}</p>
                      <p className="panel__text">{s.body}</p>
                      <a className="link" href={wa(`Hello Aspen Cleaners, I would like to book ${s.title}.`)} target="_blank" rel="noreferrer">Book {s.title.toLowerCase()} →</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
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
    <section className="process" id="process" ref={ref} style={{ height: `${chapters.length * 60 + 40}vh` }}>
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

/* ---------- Wardrobe index with a floating video preview ---------- */

function Wardrobe() {
  const ref = useRef(null)
  const [active, setActive] = useState(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 150, damping: 20 })
  const sy = useSpring(y, { stiffness: 150, damping: 20 })
  const rot = useSpring(0, { stiffness: 120, damping: 14 })
  const last = useRef(0)
  return (
    <section className="wardrobe">
      <div className="wrap">
        <div className="head head--split">
          <div>
            <p className="eyebrow">An Indian wardrobe</p>
            <Lines text={'Specialist care for\nspecial garments.'} accent={1} />
          </div>
          <Rise as="p" className="lede">From a grandmother's Kanjeevaram to this season's sherwani. Point at a garment to see how we handle it.</Rise>
        </div>
        <div className="wardrobe__list" ref={ref} onPointerLeave={() => setActive(null)}
          onPointerMove={(e) => {
            const r = ref.current.getBoundingClientRect()
            x.set(e.clientX - r.left); y.set(e.clientY - r.top)
            rot.set(Math.max(-10, Math.min(10, (e.clientX - last.current) * 0.6))); last.current = e.clientX
          }}>
          {wardrobe.map((w, i) => (
            <a key={w.name} className={`wardrobe__row ${active === i ? 'is-on' : ''} ${active !== null && active !== i ? 'is-dim' : ''}`}
              href={wa(`Hello Aspen Cleaners, I would like to send my ${w.name.toLowerCase()} for care.`)} target="_blank" rel="noreferrer"
              onPointerEnter={() => setActive(i)} data-cursor="Book">
              <span className="num">{pad(i + 1)}</span>
              <span className="wardrobe__name">{w.name}</span>
              <span className="wardrobe__note">{w.note}</span>
              <span className="wardrobe__arrow" aria-hidden="true">→</span>
            </a>
          ))}
          <motion.div className="wardrobe__float" style={{ x: sx, y: sy, rotate: rot }} aria-hidden="true">
            <AnimatePresence>
              {active !== null && (
                <motion.div key={active} className="wardrobe__vid"
                  initial={{ opacity: 0, scale: 0.85, clipPath: 'inset(50% 0 50% 0 round 18px)' }}
                  animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0 0% 0 round 18px)' }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, ease: soft }}>
                  <Clip k={wardrobe[active].clip} eager />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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

/* ---------- Finishing ---------- */

function Finishing() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.72, 1])
  const radius = useTransform(scrollYProgress, [0, 0.45], [240, 26])
  const y = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])
  return (
    <section className="finish" id="studio" ref={ref}>
      <div className="wrap finish__grid">
        <motion.div className="finish__media" style={{ scale, borderRadius: radius }}>
          <Clip k="145" label="Steaming an embroidered anarkali by hand" />
        </motion.div>
        <div>
          <p className="eyebrow">Hand finishing</p>
          <Lines text={'The difference\nis in the finish.'} accent={1} />
          <Rise as="p" className="lede">Borders, gota, pleats and collars are steamed and set by hand, so the garment comes back the way it was made to fall.</Rise>
          <motion.div className="finish__thumbs" style={{ y }}>
            <figure><Clip k="143" label="Steam press table" /><figcaption>Steam press</figcaption></figure>
            <figure><Clip k="163" label="Folding a white shirt" /><figcaption>Shirt fold</figcaption></figure>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Stain quiz ---------- */

function Quiz() {
  const [pick, setPick] = useState(null)
  return (
    <section className="quiz">
      <div className="wrap quiz__grid">
        <div>
          <p className="eyebrow eyebrow--light">Stain first aid · try it</p>
          <h2 className="h2 h2--light">{quiz.question}</h2>
        </div>
        <div className="quiz__opts">
          {quiz.options.map((o) => {
            const state = pick ? (o.key === quiz.answer ? 'right' : o.key === pick ? 'wrong' : 'dim') : ''
            return (
              <motion.button key={o.key} className={`quiz__opt ${state}`} onClick={() => setPick(o.key)} whileHover={{ x: 6 }} whileTap={{ scale: 0.98 }} aria-pressed={pick === o.key}>
                <span className="quiz__key">{o.key}</span>
                <span className="quiz__label">{o.label}</span>
                <AnimatePresence>
                  {pick && (o.key === pick || o.key === quiz.answer) && (
                    <motion.span className="quiz__verdict" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>{o.verdict}</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
          {pick && (
            <p className="quiz__result" aria-live="polite">
              {pick === quiz.answer ? 'Right. Blot first, then let us take it from there.' : 'Close. The answer is C: blot it.'}{' '}
              <button className="text-btn" onClick={() => setPick(null)}>Try again</button>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Studio reel ---------- */

function Reel() {
  const track = useRef(null)
  const view = useRef(null)
  const [limit, setLimit] = useState(0)
  const [open, setOpen] = useState(null)
  const dragged = useRef(false)
  useEffect(() => {
    const m = () => setLimit(Math.max(0, track.current.scrollWidth - view.current.clientWidth))
    m(); addEventListener('resize', m)
    const esc = (e) => e.key === 'Escape' && setOpen(null)
    addEventListener('keydown', esc)
    return () => { removeEventListener('resize', m); removeEventListener('keydown', esc) }
  }, [])
  return (
    <section className="reel">
      <div className="wrap head head--split">
        <div>
          <p className="eyebrow eyebrow--light">Studio reel</p>
          <Lines text={'No stock footage.\nJust our floor.'} className="h2 h2--light" accent={1} />
        </div>
        <p className="lede lede--light">Drag to look around. Tap any frame to watch it full size.</p>
      </div>
      <div className="reel__view" ref={view}>
        <motion.div className="reel__track" ref={track} drag="x" dragConstraints={{ left: -limit, right: 0 }} dragElastic={0.08}
          onDragStart={() => { dragged.current = true }} onDragEnd={() => setTimeout(() => { dragged.current = false }, 60)} data-cursor="Drag">
          {wall.map((k, i) => (
            <motion.button key={k} className={`reel__item ${i % 2 ? 'is-low' : ''}`} layoutId={`reel-${k}`} whileHover={{ y: -8 }}
              onClick={() => !dragged.current && setOpen(k)} aria-label={`Watch ${wallLabels[k]}`}>
              <Clip k={k} label={wallLabels[k]} />
              <span className="reel__label">{pad(i + 1)} · {wallLabels[k]}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div className="lightbox__frame" layoutId={`reel-${open}`} onClick={(e) => e.stopPropagation()}>
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
          <Clip k="168" label="A shirt sealed in Aspen packaging" />
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
            {contact.phones.map((p) => <div key={p.number}><span>Call or WhatsApp</span><strong>{p.label}</strong></div>)}
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
        <div><h4>Call or WhatsApp</h4>{contact.phones.map((p) => <p key={p.number} className="footer__num">{p.label}</p>)}<a href={wa('Hello Aspen Cleaners')} target="_blank" rel="noreferrer">Message us</a></div>
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
        <Statement />
        <Services />
        <Process />
        <Wardrobe />
        <Technology />
        <Finishing />
        <Quiz />
        <Reel />
        <Pricing />
        <Book />
      </main>
      <Footer />
      <Fab show={ready} />
    </MotionConfig>
  )
}
