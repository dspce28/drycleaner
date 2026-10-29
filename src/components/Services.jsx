import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Arrow, CareSymbol } from './Brand.jsx'
import { FadeUp, RevealText } from './Interaction.jsx'
import { process, services, waLink } from '../data.js'

export function Services() {
  const [active, setActive] = useState(0)
  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">What we care for</p>
          <h2 className="h2"><RevealText text="Because every fabric" /> <RevealText text="is different." className="serif-italic gold-text" delay={0.2} /></h2>
          <FadeUp as="p" className="section-head__lede" delay={0.2}>
            Six services, one standard. Tell us what you are sending and we will tell you how we will look after it.
          </FadeUp>
        </div>

        <div className="panels" role="list">
          {services.map((s, i) => {
            const on = i === active
            return (
              <motion.article
                key={s.key}
                role="listitem"
                className={`panel ${on ? 'is-active' : ''}`}
                layout
                transition={{ layout: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                tabIndex={0}
                data-cursor={on ? '' : 'Open'}
              >
                <motion.img layout="position" src={s.image} alt="" className="panel__img" loading="lazy" />
                <div className="panel__shade" />
                <span className="panel__index">0{i + 1}</span>
                <h3 className="panel__title">{s.title}</h3>
                <AnimatePresence mode="wait">
                  {on && (
                    <motion.div
                      className="panel__body"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.6 } }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                      <span className="panel__symbol"><CareSymbol type={s.symbol} size={30} /></span>
                      <p className="panel__line">{s.line}</p>
                      <p className="panel__text">{s.body}</p>
                      <a className="link-arrow" href={waLink(`Hello Aspen Cleaners, I would like to book ${s.title}.`)} target="_blank" rel="noreferrer">
                        Ask about {s.title.toLowerCase()} <Arrow />
                      </a>
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

// Vertical scroll drives a horizontal track of the six process steps.
export function Process() {
  const ref = useRef(null)
  const track = useRef(null)
  const [distance, setDistance] = useState(0)
  useEffect(() => {
    const measure = () => {
      const el = track.current
      if (el) setDistance(Math.max(0, el.scrollWidth - window.innerWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0.02, 0.98], [0, -distance])
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <section className="process" id="process" ref={ref}>
      <div className="process__sticky">
        <div className="wrap process__head">
          <div>
            <p className="eyebrow eyebrow--light">Here is what happens at Aspen</p>
            <h2 className="h2 h2--light">From your door, <span className="serif-italic gold-text">back to your door.</span></h2>
          </div>
          <div className="process__progress" aria-hidden="true"><motion.span style={{ width: bar }} /></div>
        </div>
        <motion.ol className="process__track" style={{ x }} ref={track}>
          {process.map((p, i) => (
            <li className="step" key={p.title}>
              <div className="step__media">
                <img src={p.image} alt="" loading="lazy" />
              </div>
              <div className="step__copy">
                <span className="step__num">Step {i + 1} of {process.length}</span>
                <h3 className="step__title">{p.title}</h3>
                <p className="step__text">{p.text}</p>
              </div>
            </li>
          ))}
        </motion.ol>
      </div>
      <ol className="process__list">
        {process.map((p, i) => (
          <FadeUp as="li" className="step step--stacked" key={p.title}>
            <div className="step__media"><img src={p.image} alt="" loading="lazy" /></div>
            <div className="step__copy">
              <span className="step__num">Step {i + 1} of {process.length}</span>
              <h3 className="step__title">{p.title}</h3>
              <p className="step__text">{p.text}</p>
            </div>
          </FadeUp>
        ))}
      </ol>
    </section>
  )
}
