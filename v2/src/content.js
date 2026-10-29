// Every clip is footage from the Aspen studio. Keys are the clip numbers from the shoot.
const clips = import.meta.glob('./media/*.mp4', { eager: true, import: 'default' })
const posters = import.meta.glob('./media/*.webp', { eager: true, import: 'default' })
export const clip = (k) => ({ src: clips[`./media/${k}.mp4`], poster: posters[`./media/${k}.webp`] })
export { default as qr } from './media/qr.webp'
export { default as shirt } from './media/shirt.webp'

export const contact = {
  phones: [
    { label: '+91 98249 22655', number: '919824922655' },
    { label: '+91 98247 33655', number: '919824733655' },
  ],
  address: ['GF, Unit No. 001, Navratna Business Park', 'Block C, Behind White Crow', 'Sindhubhavan Road, Ahmedabad 380054'],
  instagram: 'https://www.instagram.com/aspen_cleaners_ahmedabad/',
  instagramHandle: '@aspen_cleaners_ahmedabad',
  maps: 'https://www.google.com/maps/search/?api=1&query=Navratna+Business+Park+Sindhubhavan+Road+Ahmedabad',
}
export const wa = (text) => `https://wa.me/${contact.phones[0].number}?text=${encodeURIComponent(text)}`

export const garments = ['Silk Sarees', 'Lehengas', 'Anarkalis', 'Sherwanis', 'Suits', 'Kurtas', 'Dupattas', 'White Shirts', 'Woollens', 'Sneakers', 'Curtains']

export const services = [
  { key: 'dry', title: 'Dry Cleaning', line: 'For fabrics that should never see a washing machine.', body: 'Silk, wool, velvet and embellished pieces, cleaned in Italian Firbimatic machines on a cycle chosen for the fabric.', clip: '107', symbol: 'dryclean' },
  { key: 'saree', title: 'Saree Care', line: 'Silk needs a gentler touch.', body: 'Zari borders and rich dyes checked first, cleaned gently, then folded by gloved hands with tissue between the layers.', clip: '148', symbol: 'hand' },
  { key: 'bridal', title: 'Bridal & Couture', line: 'For the pieces that carry a memory.', body: 'Lehengas, anarkalis and sherwanis steamed rather than flattened, so gota, zari and stonework stand up again.', clip: '147', symbol: 'iron' },
  { key: 'press', title: 'Steam Pressing', line: 'The difference is in the finish.', body: 'Steam tables and form finishers for crisp collars, clean pleats and shoulders that keep their shape.', clip: '142', symbol: 'iron' },
  { key: 'laundry', title: 'Laundry & Shirts', line: 'Everyday wear, done properly.', body: 'Shirts and cottons washed by colour and fabric, pressed, folded around a board and sealed.', clip: '136', symbol: 'wash' },
  { key: 'shoes', title: 'Shoe Care', line: 'Clean, condition, restore.', body: 'Sneakers and leather cleaned by hand at a dedicated shoe station, not thrown in a drum.', clip: '131', symbol: 'leather' },
]

export const chapters = [
  { key: 'arrive', title: 'Handed over', text: 'You bring it in, or we collect it from your door. Each piece is received at the counter and talked through with you.', clip: '035', meta: 'Counter · Pickup' },
  { key: 'tag', title: 'Logged & tagged', text: 'Every garment is counted, checked for marks and loose work, and logged against your order.', clip: '040', meta: 'Inspection' },
  { key: 'spot', title: 'Stains, one by one', text: 'At the spotting station each mark is treated by hand with the right agent for the fibre, before any machine.', clip: '058', meta: 'Spotting station' },
  { key: 'clean', title: 'Cleaned in Italian machines', text: 'Dry cleaning runs in Firbimatic machines built in Italy, on a cycle chosen for the fabric.', clip: '090', meta: 'Firbimatic · Italy' },
  { key: 'finish', title: 'Finished by hand', text: 'Steam and pressing bring back the drape. Borders, pleats and embroidery are worked by hand.', clip: '159', meta: 'Hand finishing' },
  { key: 'pack', title: 'Folded with gloves', text: 'Folded with gloved hands, tagged and sealed so nothing touches it between our table and your wardrobe.', clip: '153', meta: 'Gloved packing' },
  { key: 'return', title: 'Returned ready to wear', text: 'Each order goes back in Aspen packaging, ready to hang or wear the same day.', clip: '168', meta: 'Delivery' },
]

export const tech = [
  { label: 'Dry cleaning', name: 'Firbimatic', detail: 'Italian dry-cleaning machines with programmable cycles for delicate and structured garments.', clip: '114' },
  { label: 'Origin', name: 'Made in Italy', detail: 'The core cleaning line is imported from Italy and installed in our own studio.', clip: '116' },
  { label: 'Quality', name: 'Certified studio', detail: 'Our certificate of compliance referencing DIN EN ISO 9001 is displayed in the studio.', clip: '125' },
]

// Studio wall: four columns, each clip used nowhere else on the page.
export const wall = [
  ['open', '001', '051'],
  ['014', '044', '104'],
  ['020', '064', 'rack'],
  ['070', '134', '158'],
]
export const wallLabels = {
  open: 'Opening day', '001': 'Handover at the counter', '051': 'Spotting by hand',
  '014': 'Arrival', '044': 'Spotting station', '104': 'Inside the drum',
  '020': 'Customer lounge', '064': 'Gentle drum action', rack: 'Ready for collection',
  '070': 'Loading the Firbimatic', '134': 'Sneaker care', '158': 'Gloved packing',
}

export const slots = ['Morning, 9 to 12', 'Afternoon, 12 to 4', 'Evening, 4 to 8']
