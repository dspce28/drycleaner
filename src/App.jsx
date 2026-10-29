import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import Lenis from 'lenis'
import { Cursor } from './components/Interaction.jsx'
import { FloatingWhatsApp, Loader, Nav } from './components/Header.jsx'
import { Hero, Marquee, Statement } from './components/Hero.jsx'
import { Process, Services } from './components/Services.jsx'
import { CareGuide, StainQuiz } from './components/Care.jsx'
import { Booking, Footer, Promises, Studio } from './components/Studio.jsx'

export default function App() {
  const [loading, setLoading] = useState(true)
  const done = useCallback(() => setLoading(false), [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: { offset: -70 } })
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy() }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Loader key="loader" onDone={done} />}</AnimatePresence>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero ready={!loading} />
        <Marquee />
        <Statement />
        <Services />
        <Process />
        <CareGuide />
        <StainQuiz />
        <Studio />
        <Promises />
        <Booking />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </MotionConfig>
  )
}
