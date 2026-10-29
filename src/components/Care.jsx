import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Arrow, CareSymbol } from './Brand.jsx'
import { FadeUp, RevealText } from './Interaction.jsx'
import { fabrics, quiz, waLink } from '../data.js'
import { SilkThreads } from './Showcase.jsx'

const symbolNames = {
  dryclean: 'Professional dry clean', noWash: 'Do not wash', wash40: 'Wash at 40°C', ironLow: 'Iron, low heat',
  ironMid: 'Iron, medium heat', ironHigh: 'Iron, high heat', noIron: 'Do not iron', hand: 'Hand wash',
  noBleach: 'Do not bleach', noTumble: 'Do not tumble dry',
}

export function CareGuide() {
  const [sel, setSel] = useState(0)
  const f = fabrics[sel]
  return (
    <section className="care" id="care-guide">
      <div className="wrap">
        <div className="section-head section-head--split">
          <div>
            <p className="eyebrow">Aspen Advice</p>
            <h2 className="h2"><RevealText text="Read the label" /> <RevealText text="like we do." className="serif-italic gold-text" delay={0.15} /></h2>
          </div>
          <FadeUp as="p" className="section-head__lede">
            Pick a garment to see its care symbols, how we treat it, and one thing you can do at home.
          </FadeUp>
        </div>

        <div className="care__tabs" role="tablist" aria-label="Garments">
          {fabrics.map((x, i) => (
            <button
              key={x.key}
              role="tab"
              id={`tab-${x.key}`}
              aria-selected={i === sel}
              aria-controls="care-panel"
              className={`chip ${i === sel ? 'is-on' : ''}`}
              onClick={() => setSel(i)}
            >
              {i === sel && <motion.span layoutId="chip-bg" className="chip__bg" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="chip__label">{x.name}</span>
            </button>
          ))}
        </div>

        <div className="care__panel" id="care-panel" role="tabpanel" aria-labelledby={`tab-${f.key}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={f.key}
              className="care__grid"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="care__visual">
                <motion.div className="care__photo" initial={{ clipPath: 'inset(0 100% 0 0 round 200px 200px 18px 18px)' }} animate={{ clipPath: 'inset(0 0% 0 0 round 200px 200px 18px 18px)' }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}>
                  <motion.img src={f.image} alt="" initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
                </motion.div>
              <div className="label-card">
                <p className="label-card__head">CARE LABEL</p>
                <p className="label-card__name">{f.name}</p>
                <p className="label-card__note">{f.note}</p>
                <ul className="label-card__symbols">
                  {f.symbols.map((s, i) => (
                    <motion.li key={s} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.08 }}>
                      <CareSymbol type={s} size={40} />
                      <span>{symbolNames[s]}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              </div>
              <div className="care__how">
                <p className="care__sub">How Aspen cares for it</p>
                <ol>
                  {f.how.map((h, i) => (
                    <motion.li key={h} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                      {h}
                    </motion.li>
                  ))}
                </ol>
                <div className="care__tip">
                  <p className="care__sub">At home</p>
                  <p>{f.tip}</p>
                </div>
                <a className="link-arrow" href={waLink(`Hello Aspen Cleaners, I have a question about caring for my ${f.name.toLowerCase()}.`)} target="_blank" rel="noreferrer">
                  Ask us about your {f.name.toLowerCase()} <Arrow />
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

export function StainQuiz() {
  const [pick, setPick] = useState(null)
  const correct = pick === quiz.answer
  return (
    <section className="quiz">
      <SilkThreads lines={10} opacity={0.35} />
      <div className="wrap quiz__inner">
        <div>
          <p className="eyebrow eyebrow--light">Stain first aid</p>
          <h2 className="h2 h2--light quiz__q">{quiz.question}</h2>
        </div>
        <div className="quiz__options">
          {quiz.options.map((o) => {
            const state = pick ? (o.key === quiz.answer ? 'right' : o.key === pick ? 'wrong' : 'dim') : ''
            return (
              <motion.button
                key={o.key}
                className={`quiz__opt ${state}`}
                onClick={() => setPick(o.key)}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={pick === o.key}
              >
                <span className="quiz__key">{o.key}</span>
                <span className="quiz__label">{o.label}</span>
                <AnimatePresence>
                  {pick && (o.key === pick || o.key === quiz.answer) && (
                    <motion.span className="quiz__verdict" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      {o.verdict}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
          <AnimatePresence>
            {pick && (
              <motion.p className="quiz__result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} aria-live="polite">
                {correct ? 'Right. Blot first, then let us take it from there.' : 'Close call. The answer is C: blot it.'}{' '}
                <button className="text-btn" onClick={() => setPick(null)}>Try again</button>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
