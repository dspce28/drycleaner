import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence, MotionConfig, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform,
} from 'framer-motion'
import Lenis from 'lenis'
import { chapters, clip, contact, qr, services, tech, wa, wall, wallLabels } from './content.js'

const ease = [0.76, 0, 0.24, 1]
const soft = [0.22, 1, 0.36, 1]

/* ---------- Primitives ---------- */

// Muted looping clip that only plays while on screen.
function Clip({ k, className = '', eager = false, label }) {
  const ref = useRef(null)
  const { src, poster } = clip(k)
  useEffect(() => {
    const v = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.15 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <video
      ref={ref}
      className={`clip ${className}`}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'metadata'}
      aria-label={label}
    />
  )
}

function Mark({ size = 28 }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="258 42 300 360" aria-hidden="true">
      <path d="M405 50 L506 288 C440 282 340 318 268 392 Z" fill="var(--gold)" />
      <path d="M396 354 C440 326 486 312 516 312 L549 394 C512 366 455 350 396 354 Z" fill="var(--ivory)" />
    </svg>
  )
}

function Lines({ text, className = '', delay = 0, as: Tag = 'h2' }) {
  return (
    <Tag className={className} aria-label={text.replace(/\n/g, ' ')}>
      {text.split('\n').map((line, i) => (
        <span className="line" key={i} aria-hidden="true">
          <motion.span
            className="line__in"
            initial={{ y: '105%', rotate: 2 }}
            whileInView={{ y: '0%', rotate: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.1, delay: delay + i * 0.09, ease: soft }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

function Magnetic({ children }) {
  const ref = useRef(null)
  const x = useSpring(0, { stiffness: 200, damping: 15 })
  const y = useSpring(0, { stiffness: 200, damping: 15 })
  return (
    <motion.span
      ref={ref}
      className="magnetic"
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.3)
        y.set((e.clientY - r.top - r.height / 2) * 0.3)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.span>
  )
}

function Cursor() {
  const [on, setOn] = useState(false)
  const [label, setLabel] = useState('')
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40 })
  const sy = useSpring(y, { stiffness: 500, damping: 40 })
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setOn(true)
    document.documentElement.classList.add('has-cursor')
    const move = (e) => {
      x.set(e.clientX); y.set(e.clientY)
      const t = e.target.closest?.('[data-cursor], a, button')
      setLabel(t ? t.getAttribute('data-cursor') || '•' : '')
    }
    addEventListener('pointermove', move)
    return () => removeEventListener('pointermove', move)
  }, [x, y])
  if (!on) return null
  return (
    <motion.div className={`cursor ${label ? 'is-on' : ''} ${label.length > 1 ? 'has-text' : ''}`} style={{ x: sx, y: sy }}>
      <span>{label.length > 1 ? label : ''}</span>
    </motion.div>
  )
}

/* ---------- Intro ---------- */

function Intro({ onDone }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf, start
    const tick = (t) => {
      start ??= t
      const p = Math.min(1, (t - start) / 1700)
      setN(Math.round(100 * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setTimeout(onDone, 250)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])
  return (
    <motion.div className="intro" exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 1, ease } }}>
      <div className="intro__brand"><Mark size={36} /><span>ASPEN</span></div>
      <p className="intro__line mono">Opening the studio</p>
      <span className="intro__num">{String(n).padStart(3, '0')}</span>
      <motion.span className="intro__bar" style={{ scaleX: n / 100 }} />
    </motion.div>
  )
}

/* ---------- Nav ---------- */

function Nav() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 60))
  return (
    <header className={`nav ${solid ? 'is-solid' : ''}`}>
      <a href="#top" className="nav__brand" aria-label="Aspen Cleaners home"><Mark size={22} /><span>ASPEN</span><em>Cleaners</em></a>
      <nav className="nav__links mono" aria-label="Main">
        <a href="#process">Process</a>
        <a href="#technology">Technology</a>
        <a href="#reel">Studio reel</a>
        <a href="#visit">Visit</a>
      </nav>
      <a className="nav__cta" href={wa('Hello Aspen Cleaners, I would like to schedule a pickup.')} target="_blank" rel="noreferrer" data-cursor="Book">
        Book a pickup
      </a>
    </header>
  )
}

/* ---------- Hero: three tall frames of the studio ---------- */

function Hero({ ready }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const mx = useSpring(0, { stiffness: 60, damping: 20 })
  const cols = [
    { k: '014', y: y1, label: 'Aspen Cleaners storefront by day' },
    { k: '104', y: y2, label: 'Inside the Firbimatic drum' },
    { k: '147', y: y3, label: 'Steaming an embroidered anarkali' },
  ]
  return (
    <section className="hero" id="top" ref={ref} onPointerMove={(e) => mx.set((e.clientX / innerWidth - 0.5) * -30)}>
      <motion.div className="hero__cols" style={{ x: mx }}>
        {cols.map((c, i) => (
          <motion.div
            key={c.k}
            className="hero__col"
            style={{ y: c.y }}
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={ready ? { clipPath: 'inset(0% 0 0 0)' } : {}}
            transition={{ duration: 1.4, delay: 0.15 * i, ease }}
          >
            <Clip k={c.k} eager label={c.label} />
          </motion.div>
        ))}
      </motion.div>
      <div className="hero__veil" />
      <motion.div className="hero__copy" style={{ opacity: fade }}>
        <motion.p className="mono hero__kicker" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}>
          Dry cleaning &amp; garment care · Sindhubhavan Road, Ahmedabad
        </motion.p>
        <h1 className="hero__title">
          {['Care for', 'what matters.'].map((l, i) => (
            <span className="line" key={l}>
              <motion.span
                className={`line__in ${i === 1 ? 'italic' : ''}`}
                initial={{ y: '110%' }}
                animate={ready ? { y: '0%' } : {}}
                transition={{ duration: 1.2, delay: 0.5 + i * 0.12, ease: soft }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div className="hero__row" initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.1, duration: 1 }}>
          <p>Italian machines, hand finishing and gloved packing, filmed in our own studio. This is what happens to your clothes at Aspen.</p>
          <Magnetic>
            <a className="btn" href="#process" data-cursor="Watch">See the process <span aria-hidden="true">↓</span></a>
          </Magnetic>
        </motion.div>
      </motion.div>
      <span className="hero__rec mono"><i /> Filmed at Aspen</span>
    </section>
  )
}

/* ---------- Marquee ---------- */

function Ticker() {
  const words = ['Expert care', 'Impeccable finish', 'Made in Italy', 'Hand finished', 'Gloved packing', 'Free pickup']
  const row = words.map((w) => <span key={w}>{w}<Mark size={14} /></span>)
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">{row}{row}{row}</div>
    </div>
  )
}

/* ---------- Process: pinned chapters with one tall screen ---------- */

function Process() {
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => setI(Math.min(chapters.length - 1, Math.floor(v * chapters.length))))
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const c = chapters[i]
  return (
    <section className="process" id="process" ref={ref} style={{ height: `${chapters.length * 70}vh` }}>
      <div className="process__sticky">
        <div className="process__list">
          <p className="mono eyebrow">The Aspen process · {String(i + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</p>
          <ol>
            {chapters.map((ch, j) => (
              <li key={ch.key} className={j === i ? 'is-on' : j < i ? 'is-done' : ''}>
                <span className="mono">{String(j + 1).padStart(2, '0')}</span>
                <span className="process__name">{ch.title}</span>
              </li>
            ))}
          </ol>
          <div className="process__bar"><motion.span style={{ height: bar }} /></div>
        </div>
        <div className="process__screen" data-cursor="Process">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={c.key}
              className="process__frame"
              initial={{ clipPath: 'inset(100% 0 0 0 round 28px)', scale: 1.08 }}
              animate={{ clipPath: 'inset(0% 0 0 0 round 28px)', scale: 1 }}
              exit={{ opacity: 0.4, scale: 0.96, transition: { duration: 0.6 } }}
              transition={{ duration: 0.9, ease }}
            >
              <Clip k={c.clip} label={c.title} />
            </motion.div>
          </AnimatePresence>
          <span className="process__meta mono">{c.meta}</span>
        </div>
        <div className="process__text">
          <AnimatePresence mode="wait">
            <motion.div key={c.key} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: soft }}>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ---------- Technology spec cards ---------- */

function TiltCard({ t, i }) {
  const rx = useSpring(0, { stiffness: 150, damping: 15 })
  const ry = useSpring(0, { stiffness: 150, damping: 15 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glare = useTransform([gx, gy], ([a, b]) => `radial-gradient(circle at ${a}% ${b}%, rgba(255,240,200,0.22), transparent 55%)`)
  return (
    <motion.article
      className="spec"
      style={{ rotateX: rx, rotateY: ry }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry.set((px - 0.5) * 14); rx.set((0.5 - py) * 14); gx.set(px * 100); gy.set(py * 100)
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0) }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1, delay: i * 0.1, ease: soft }}
    >
      <div className="spec__media"><Clip k={t.clip} label={t.name} /></div>
      <motion.div className="spec__glare" style={{ background: glare }} />
      <div className="spec__body">
        <span className="mono">{String(i + 1).padStart(2, '0')} — {t.label}</span>
        <h3>{t.name}</h3>
        <p>{t.detail}</p>
      </div>
    </motion.article>
  )
}

function Technology() {
  return (
    <section className="tech" id="technology">
      <div className="wrap">
        <div className="head">
          <p className="mono eyebrow">Technology</p>
          <Lines text={'Built in Italy.\nRun by specialists.'} className="h2" />
          <p className="lede">The machines matter. The people who choose the cycle matter more. Here is what is inside the Aspen studio.</p>
        </div>
        <div className="specs">
          {tech.map((t, i) => <TiltCard t={t} i={i} key={t.name} />)}
        </div>
      </div>
    </section>
  )
}

/* ---------- Finishing: a split with a scaling video ---------- */

function Finishing() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.7, 1])
  const radius = useTransform(scrollYProgress, [0, 0.5], [200, 24])
  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  return (
    <section className="finish" ref={ref}>
      <div className="wrap finish__grid">
        <motion.div className="finish__media" style={{ scale, borderRadius: radius }}>
          <Clip k="145" label="Steaming an embroidered anarkali by hand" />
        </motion.div>
        <div className="finish__copy">
          <p className="mono eyebrow">Hand finishing</p>
          <Lines text={'The difference\nis in the finish.'} className="h2" />
          <p className="lede">Cleaning is only part of the job. Borders, gota, pleats and collars are steamed and set by hand so the garment comes back the way it was made to fall.</p>
          <motion.div className="finish__thumbs" style={{ y }}>
            <div><Clip k="143" label="Steam pressing table" /></div>
            <div><Clip k="163" label="Folding a white shirt" /></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Reel: a draggable film strip with a lightbox ---------- */

function Reel() {
  const track = useRef(null)
  const wrap = useRef(null)
  const [limit, setLimit] = useState(0)
  const [open, setOpen] = useState(null)
  const dragged = useRef(false)
  useEffect(() => {
    const m = () => setLimit(Math.max(0, track.current.scrollWidth - wrap.current.clientWidth))
    m(); addEventListener('resize', m)
    return () => removeEventListener('resize', m)
  }, [])
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setOpen(null)
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [])
  return (
    <section className="reel" id="reel">
      <div className="wrap head head--row">
        <div>
          <p className="mono eyebrow">Studio reel</p>
          <Lines text={'No stock footage.\nJust our floor.'} className="h2" />
        </div>
        <p className="lede">Drag to look around. Tap any frame to watch it full size.</p>
      </div>
      <div className="reel__viewport" ref={wrap}>
        <motion.div
          className="reel__track"
          ref={track}
          drag="x"
          dragConstraints={{ left: -limit, right: 0 }}
          dragElastic={0.08}
          onDragStart={() => { dragged.current = true }}
          onDragEnd={() => setTimeout(() => { dragged.current = false }, 50)}
          data-cursor="Drag"
        >
          {wall.map((k, i) => (
            <motion.button
              key={k}
              className={`reel__item ${i % 3 === 1 ? 'is-low' : ''}`}
              layoutId={`reel-${k}`}
              onClick={() => !dragged.current && setOpen(k)}
              whileHover={{ y: -8 }}
              aria-label={`Play ${wallLabels[k]}`}
            >
              <Clip k={k} label={wallLabels[k]} />
              <span className="reel__label mono">{String(i + 1).padStart(2, '0')} · {wallLabels[k]}</span>
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
            <p className="lightbox__label mono">{wallLabels[open]}</p>
            <button className="lightbox__close mono" onClick={() => setOpen(null)}>Close ✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ---------- Statement over the packed shirt ---------- */

function Delivered() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8])
  const y = useTransform(scrollYProgress, [0, 1], ['20%', '-20%'])
  const words = 'Returned sealed, tagged and ready to wear.'.split(' ')
  return (
    <section className="delivered" ref={ref}>
      <div className="wrap delivered__grid">
        <p className="delivered__text">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0.12 }}
              whileInView={{ opacity: 1 }}
              viewport={{ margin: '-35% 0px -35% 0px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={w.startsWith('ready') || w.startsWith('wear') ? 'italic gold' : ''}
            >
              {w}{' '}
            </motion.span>
          ))}
        </p>
        <motion.div className="delivered__pack" style={{ rotate, y }}>
          <Clip k="168" label="A shirt sealed in Aspen packaging" />
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- Visit + booking ---------- */

function Visit() {
  const [pick, setPick] = useState(['Dry Cleaning'])
  const [area, setArea] = useState('')
  const msg = `Hello Aspen Cleaners, I would like to schedule a pickup.\nServices: ${pick.join(', ') || '-'}\nArea: ${area || '-'}`
  const toggle = (s) => setPick(pick.includes(s) ? pick.filter((x) => x !== s) : [...pick, s])
  return (
    <section className="visit" id="visit">
      <div className="visit__bg"><Clip k="139" label="The Aspen studio at night" /></div>
      <div className="visit__veil" />
      <div className="wrap visit__grid">
        <div>
          <p className="mono eyebrow">Visit or book</p>
          <Lines text={'Your clothes,\nin expert hands.'} className="h2" />
          <address className="visit__addr">
            {contact.address.map((l) => <span key={l}>{l}</span>)}
          </address>
          <a className="link mono" href={contact.maps} target="_blank" rel="noreferrer">Get directions ↗</a>
        </div>
        <form className="book" onSubmit={(e) => e.preventDefault()}>
          <p className="mono book__step">01 · What are we caring for?</p>
          <div className="book__chips">
            {services.map((s) => (
              <button type="button" key={s} className={pick.includes(s) ? 'is-on' : ''} aria-pressed={pick.includes(s)} onClick={() => toggle(s)}>{s}</button>
            ))}
          </div>
          <label className="mono book__step" htmlFor="v2-area">02 · Where should we collect from?</label>
          <input id="v2-area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area or society name" autoComplete="street-address" />
          <Magnetic>
            <a className="btn btn--gold" href={wa(msg)} target="_blank" rel="noreferrer" data-cursor="Send">Continue on WhatsApp →</a>
          </Magnetic>
          <p className="book__note">Opens WhatsApp with your request filled in. Nothing is sent until you press send.</p>
          <div className="book__phones">
            {contact.phones.map((p) => <span key={p.number} className="mono">{p.label}</span>)}
          </div>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__row">
        <div className="footer__brand"><Mark size={30} /><div><strong>ASPEN CLEANERS</strong><span className="mono">Expert care. Impeccable finish.</span></div></div>
        <a href={contact.instagram} target="_blank" rel="noreferrer" className="footer__ig" data-cursor="Follow">
          <img src={qr} alt="Instagram QR code" />
          <span className="mono">{contact.instagramHandle}</span>
        </a>
      </div>
      <div className="footer__giant" aria-hidden="true">Care for what matters.</div>
      <div className="wrap footer__base mono">
        <span>© {new Date().getFullYear()} Aspen Cleaners, Ahmedabad</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  )
}

function FloatingWA({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          className="fab"
          href={wa('Hello Aspen Cleaners, I would like to schedule a pickup.')}
          target="_blank"
          rel="noreferrer"
          aria-label="Book a pickup on WhatsApp"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 20 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z" /></svg>
          <span>Book a pickup</span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const done = useCallback(() => setReady(true), [])
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.2, anchors: true })
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
        <Ticker />
        <Process />
        <Technology />
        <Finishing />
        <Reel />
        <Delivered />
        <Visit />
      </main>
      <Footer />
      <FloatingWA show={ready} />
    </MotionConfig>
  )
}
