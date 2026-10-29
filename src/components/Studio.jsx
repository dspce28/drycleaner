import { useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Arrow, CareSymbol, Mark, WhatsAppIcon, Wordmark } from './Brand.jsx'
import { FadeUp, Magnetic, RevealText } from './Interaction.jsx'
import { contact, img, photoCredits, promises, services, waLink } from '../data.js'
import { RevealImage, SilkThreads } from './Showcase.jsx'
import tour from '../assets/tour.mp4'
import qr from '../assets/qr.webp'

export function Studio() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const up = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])
  const down = useTransform(scrollYProgress, [0, 1], ['-8%', '10%'])
  return (
    <section className="studio" id="studio" ref={ref}>
      <div className="wrap studio__grid">
        <div className="studio__copy">
          <p className="eyebrow">The studio</p>
          <h2 className="h2"><RevealText text="Step inside" /> <RevealText text="Aspen." className="serif-italic gold-text" delay={0.15} /></h2>
          <FadeUp as="p" className="studio__lede">
            A dedicated garment-care studio on Sindhubhavan Road, with a stain-treatment station, specialist dry-cleaning
            machines and a full finishing floor for steaming and pressing. Drop in, or let us come to you.
          </FadeUp>
          <FadeUp className="studio__address" delay={0.1}>
            <p>{contact.address.map((l) => <span key={l}>{l}</span>)}</p>
            <a className="link-arrow" href={contact.maps} target="_blank" rel="noreferrer">Get directions <Arrow /></a>
          </FadeUp>
        </div>

        <div className="studio__visual">
          <motion.div className="studio__video" style={{ y: down }} data-cursor="Tour">
            <video src={tour} autoPlay muted loop playsInline poster={img.storefront} aria-label="Walkthrough of the Aspen Cleaners studio" />
            <span className="studio__live"><i /> Studio tour</span>
          </motion.div>
          <motion.div className="studio__stack" style={{ y: up }}>
            <figure><RevealImage src={img.lounge} alt="Customer lounge with two upholstered chairs" /><figcaption>Lounge</figcaption></figure>
            <figure><RevealImage src={img.spotting} alt="Stain treatment station with spotting agents" delay={0.1} /><figcaption>Spotting station</figcaption></figure>
            <figure><RevealImage src={img.press} alt="Steam finishing table" delay={0.2} /><figcaption>Finishing floor</figcaption></figure>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function Promises() {
  return (
    <section className="promises">
      <div className="wrap promises__grid">
        {promises.map((p, i) => (
          <FadeUp className="promise" key={p.title} delay={i * 0.08}>
            <Mark size={18} />
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

const slots = ['Morning, 9 to 12', 'Afternoon, 12 to 4', 'Evening, 4 to 8']

export function Booking() {
  const [form, setForm] = useState({ name: '', phone: '', area: '', date: '', slot: slots[0], items: ['Dry Cleaning'], notes: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggle = (t) =>
    setForm({ ...form, items: form.items.includes(t) ? form.items.filter((x) => x !== t) : [...form.items, t] })
  const valid = form.name.trim().length > 1 && form.phone.replace(/\D/g, '').length >= 10 && form.area.trim().length > 2
  const message = useMemo(() => {
    const lines = [
      'Hello Aspen Cleaners, I would like to schedule a pickup.',
      '',
      `Name: ${form.name || '-'}`,
      `Phone: ${form.phone || '-'}`,
      `Pickup address / area: ${form.area || '-'}`,
      `Services: ${form.items.join(', ') || '-'}`,
      `Preferred date: ${form.date || 'Earliest available'}`,
      `Time: ${form.slot}`,
    ]
    if (form.notes.trim()) lines.push(`Notes: ${form.notes.trim()}`)
    return lines.join('\n')
  }, [form])
  const [tried, setTried] = useState(false)

  return (
    <section className="book" id="book">
      <SilkThreads lines={16} opacity={0.4} />
      <div className="book__bg" aria-hidden="true"><Mark size={520} /></div>
      <div className="wrap book__grid">
        <div className="book__copy">
          <p className="eyebrow eyebrow--light">Schedule a pickup</p>
          <h2 className="h2 h2--light"><RevealText text="Let Aspen take" /> <RevealText text="care of it." className="serif-italic gold-text" delay={0.15} /></h2>
          <p className="book__lede">
            Fill this in and we will open WhatsApp with your request written out. Press send and our team will confirm your slot.
          </p>
          <div className="book__contacts">
            {contact.phones.map((p) => (
              <div className="book__phone" key={p.number}>
                <span className="book__phone-label">Call or WhatsApp</span>
                <span className="book__phone-num">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <form className="form" onSubmit={(e) => { e.preventDefault(); setTried(true) }} noValidate>
          <div className="form__row">
            <Field id="f-name" label="Your name" value={form.name} onChange={set('name')} autoComplete="name" invalid={tried && form.name.trim().length < 2} />
            <Field id="f-phone" label="Mobile number" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" invalid={tried && form.phone.replace(/\D/g, '').length < 10} />
          </div>
          <Field id="f-area" label="Pickup address or area" value={form.area} onChange={set('area')} autoComplete="street-address" invalid={tried && form.area.trim().length < 3} />
          <fieldset className="form__fieldset">
            <legend>What are you sending?</legend>
            <div className="form__chips">
              {services.map((s) => (
                <button type="button" key={s.key} className={`pill ${form.items.includes(s.title) ? 'is-on' : ''}`} onClick={() => toggle(s.title)} aria-pressed={form.items.includes(s.title)}>
                  <CareSymbol type={s.symbol} size={18} /> {s.title}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="form__row">
            <Field id="f-date" label="Preferred date" type="date" value={form.date} onChange={set('date')} />
            <div className="field">
              <select id="f-slot" value={form.slot} onChange={set('slot')}>
                {slots.map((s) => <option key={s}>{s}</option>)}
              </select>
              <label htmlFor="f-slot" className="is-up">Time</label>
            </div>
          </div>
          <Field id="f-notes" label="Anything we should know? (stains, delicate work, count)" value={form.notes} onChange={set('notes')} textarea />
          <div className="form__submit">
            {valid ? (
              <Magnetic>
                <a className="btn btn--gold btn--lg" href={waLink(message)} target="_blank" rel="noreferrer" data-cursor="Send">
                  <WhatsAppIcon /> Continue on WhatsApp
                </a>
              </Magnetic>
            ) : (
              <button type="submit" className="btn btn--gold btn--lg">
                <WhatsAppIcon /> Continue on WhatsApp
              </button>
            )}
            <p className="form__hint" aria-live="polite">
              {tried && !valid ? 'Add your name, a 10-digit mobile number and your area to continue.' : 'Nothing is sent until you press send in WhatsApp.'}
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

function Field({ id, label, textarea, invalid, ...rest }) {
  const Tag = textarea ? 'textarea' : 'input'
  const up = rest.type === 'date' || (rest.value && rest.value.length > 0)
  return (
    <div className={`field ${invalid ? 'is-invalid' : ''}`}>
      <Tag id={id} placeholder=" " rows={textarea ? 2 : undefined} aria-invalid={invalid || undefined} {...rest} />
      <label htmlFor={id} className={up ? 'is-up' : ''}>{label}</label>
    </div>
  )
}

export function Footer() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['40%', '0%'])
  return (
    <footer className="footer" ref={ref}>
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <Wordmark />
          <p>Dry Cleaning &amp; Garment Care.<br />Expert Care. Impeccable Finish.</p>
        </div>
        <div>
          <p className="footer__h">Visit</p>
          <p className="footer__p">{contact.address.map((l) => <span key={l}>{l}</span>)}</p>
          <a className="footer__link" href={contact.maps} target="_blank" rel="noreferrer">Open in Google Maps</a>
        </div>
        <div>
          <p className="footer__h">Call or WhatsApp</p>
          {contact.phones.map((p) => <p className="footer__p footer__num" key={p.number}>{p.label}</p>)}
          <a className="footer__link" href={waLink('Hello Aspen Cleaners')} target="_blank" rel="noreferrer">Message us on WhatsApp</a>
        </div>
        <div className="footer__ig">
          <a href={contact.instagram} target="_blank" rel="noreferrer" className="footer__qr" data-cursor="Follow">
            <img src={qr} alt="Instagram QR code for @aspen_cleaners_ahmedabad" />
          </a>
          <a className="footer__link" href={contact.instagram} target="_blank" rel="noreferrer">{contact.instagramHandle}</a>
        </div>
      </div>
      <div className="footer__giant" aria-hidden="true">
        <motion.span style={{ y }}>ASPEN</motion.span>
      </div>
      <div className="wrap footer__base">
        <span>© {new Date().getFullYear()} Aspen Cleaners, Ahmedabad</span>
        <span className="footer__credits">Placeholder photography: {photoCredits.map((u, i) => <a key={u} href={u} target="_blank" rel="noreferrer">{i + 1}</a>)} (Unsplash)</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  )
}
