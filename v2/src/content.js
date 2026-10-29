// Every clip is footage from the Aspen studio. Keys are the clip numbers from the shoot.
const clips = import.meta.glob('./media/*.mp4', { eager: true, import: 'default' })
const posters = import.meta.glob('./media/*.webp', { eager: true, import: 'default' })
export const clip = (k) => ({ src: clips[`./media/${k}.mp4`], poster: posters[`./media/${k}.webp`] })
export { default as qr } from './media/qr.webp'

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

export const chapters = [
  { key: 'arrive', title: 'Handed over', text: 'You bring it in, or we collect it from your door. Each piece is received at the counter and talked through with you.', clip: '035', meta: 'Counter · Pickup' },
  { key: 'tag', title: 'Logged & tagged', text: 'Every garment is counted, checked for marks and loose work, and logged against your order before anything else happens.', clip: '040', meta: 'Inspection · Tagging' },
  { key: 'spot', title: 'Stains, one by one', text: 'At the spotting station each mark is treated by hand with the right agent for the fibre, before the garment goes near a machine.', clip: '058', meta: 'Spotting station' },
  { key: 'clean', title: 'Cleaned in Italian machines', text: 'Dry cleaning runs in Firbimatic machines built in Italy. The cycle is chosen for the fabric, not the queue.', clip: '090', meta: 'Firbimatic · Made in Italy' },
  { key: 'finish', title: 'Finished by hand', text: 'Steam, pressing tables and form finishers bring back the drape. Borders, pleats and embroidery are worked by hand.', clip: '147', meta: 'Steam · Press · Hand finish' },
  { key: 'pack', title: 'Folded with gloves', text: 'Garments are folded with gloved hands, tagged and sealed so nothing touches them between our table and your wardrobe.', clip: '153', meta: 'Gloved packing' },
  { key: 'return', title: 'Returned ready to wear', text: 'Each order goes back in Aspen packaging, ready to hang or wear the same day.', clip: '168', meta: 'Delivery' },
]

export const tech = [
  { label: 'Dry cleaning', name: 'Firbimatic', detail: 'Italian dry-cleaning machines with programmable cycles for delicate and structured garments.', clip: '114' },
  { label: 'Origin', name: 'Made in Italy', detail: 'The core cleaning line is imported from Italy and installed in our own studio.', clip: '116' },
  { label: 'Drum', name: 'Gentle action', detail: 'Controlled drum movement so silk, wool and embellished pieces are not thrown around.', clip: '104' },
  { label: 'Quality', name: 'Certificate of compliance', detail: 'Our quality certificate referencing DIN EN ISO 9001 is displayed in the studio.', clip: '125' },
]

export const services = [
  'Dry Cleaning', 'Laundry', 'Steam Pressing', 'Bridal & Couture', 'Sarees & Lehengas', 'Suits & Blazers', 'Shoe Care', 'Curtains & Home',
]

export const wall = ['open', '014', '051', '143', '145', '163', 'rack', '128', '131', '134', '139', '090', '153', '040']
export const wallLabels = {
  open: 'Opening day', rack: 'Ready for collection',
  '014': 'Arrival', '051': 'Spotting', '143': 'Steam press', '145': 'Steaming an anarkali', '163': 'Shirt fold',
  '128': 'Sneakers in', '131': 'Shoe care station', '134': 'Sneaker clean', '139': 'The studio at night', '090': 'Inside the drum',
  '153': 'Gloved packing', '040': 'Tagging',
}
