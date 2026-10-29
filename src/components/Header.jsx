import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Mark, Wordmark, WhatsAppIcon } from './Brand.jsx'
import { Magnetic } from './Interaction.jsx'
import { waLink } from '../data.js'

export function Loader({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1900)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      className="loader"
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="loader__inner">
        <Mark size={74} draw />
        <motion.p
          className="loader__line"
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, letterSpacing: '0.32em' }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          EXPERT CARE. IMPECCABLE FINISH.
        </motion.p>
      </div>
    </motion.div>
  )
}

const links = [
  ['Services', '#services'],
  ['Process', '#process'],
  ['Care Guide', '#care-guide'],
  ['Studio', '#studio'],
  ['Contact', '#book'],
]

export function Nav() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setSolid(v > 40)
    setHidden(v > prev && v > 400 && !open)
  })
  return (
    <>
      <motion.header
        className={`nav ${solid ? 'is-solid' : ''}`}
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nav__inner">
          <a href="#top" className="nav__brand" aria-label="Aspen Cleaners home">
            <Wordmark compact />
          </a>
          <nav className="nav__links" aria-label="Main">
            {links.map(([l, h]) => (
              <a key={h} href={h} className="nav__link"><span data-text={l}>{l}</span></a>
            ))}
          </nav>
          <div className="nav__actions">
            <a className="icon-btn" href={waLink('Hello Aspen Cleaners, I have a question about my garments.')} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
              <WhatsAppIcon />
            </a>
            <Magnetic>
              <a href="#book" className="btn btn--gold btn--sm">Schedule a Pickup</a>
            </Magnetic>
            <button className={`burger ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
              <span /><span />
            </button>
          </div>
        </div>
      </motion.header>
      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="menu__links">
              {links.map(([l, h], i) => (
                <motion.a
                  key={h}
                  href={h}
                  onClick={() => setOpen(false)}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                >
                  {l}
                </motion.a>
              ))}
            </nav>
            <a href="#book" className="btn btn--gold" onClick={() => setOpen(false)}>Schedule a Pickup</a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function FloatingWhatsApp() {
  const { scrollYProgress } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setShow(v > 0.06))
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          className="fab"
          href={waLink('Hello Aspen Cleaners, I would like to schedule a pickup.')}
          target="_blank"
          rel="noreferrer"
          aria-label="Schedule a pickup on WhatsApp"
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <WhatsAppIcon size={26} />
          <span className="fab__label">Schedule a pickup</span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
