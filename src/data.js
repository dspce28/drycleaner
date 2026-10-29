import storefront from './assets/storefront.webp'
import reception from './assets/reception.webp'
import lounge from './assets/lounge.webp'
import bags from './assets/bags.webp'
import press from './assets/press.webp'
import shirts from './assets/shirts.webp'
import packing from './assets/packing.webp'
import spotting from './assets/spotting.webp'
import machine from './assets/machine.webp'
import racks from './assets/racks.webp'
import kurta from './assets/kurta.webp'
import sareeGreen from './assets/saree-green.webp'
import bride from './assets/bride-lehenga.webp'
import sareeChair from './assets/saree-chair.webp'
import suit from './assets/suit.webp'
import sareeIvory from './assets/saree-ivory.webp'
import sareesWhite from './assets/sarees-white.webp'
import iron from './assets/iron.webp'

export const img = { storefront, reception, lounge, bags, press, shirts, packing, spotting, machine, racks, kurta, sareeGreen, bride, sareeChair, suit, sareeIvory, sareesWhite, iron }

export const contact = {
  phones: [
    { label: '+91 98249 22655', number: '919824922655' },
    { label: '+91 98247 33655', number: '919824733655' },
  ],
  address: ['GF, Unit No. 001, Navratna Business Park', 'Block C, Behind White Crow', 'Sindhubhavan Road, Ahmedabad 380054'],
  instagram: 'https://www.instagram.com/aspen_cleaners_ahmedabad/',
  instagramHandle: '@aspen_cleaners_ahmedabad',
  website: 'aspen-cleaners.com',
  maps: 'https://www.google.com/maps/search/?api=1&query=Navratna+Business+Park+Sindhubhavan+Road+Ahmedabad',
}

export const waLink = (text) =>
  `https://wa.me/${contact.phones[0].number}?text=${encodeURIComponent(text)}`

export const garments = [
  'Silk Sarees', 'Lehengas', 'Sherwanis', 'Bandhgalas', 'Suits & Blazers', 'Kurtas',
  'Dupattas', 'Linen Shirts', 'Woollens', 'Evening Gowns', 'Leather', 'Curtains',
]

export const services = [
  {
    key: 'dry',
    title: 'Dry Cleaning',
    line: 'For fabrics that should never see a washing machine.',
    body: 'Silk, wool, velvet, structured tailoring and embellished pieces, each cleaned in a controlled solvent cycle chosen for the fabric.',
    image: suit,
    symbol: 'dryclean',
  },
  {
    key: 'laundry',
    title: 'Laundry',
    line: 'Everyday wear, washed properly.',
    body: 'Shirts, cottons, linens and home textiles, sorted by colour and fabric and washed at the right temperature.',
    image: sareesWhite,
    symbol: 'wash',
  },
  {
    key: 'press',
    title: 'Pressing & Finishing',
    line: 'The difference is in the finish.',
    body: 'Steam pressing and hand finishing for crisp collars, clean pleats and shoulders that keep their shape.',
    image: iron,
    symbol: 'iron',
  },
  {
    key: 'bridal',
    title: 'Bridal & Couture Care',
    line: 'For the pieces that carry a memory.',
    body: 'Lehengas, sherwanis and heavy zari work, cleaned by hand where needed, with embroidery and stones protected.',
    image: bride,
    symbol: 'hand',
  },
  {
    key: 'leather',
    title: 'Shoe & Leather Care',
    line: 'Clean, condition, restore.',
    body: 'Leather jackets, bags, formal shoes and sneakers, cleaned and conditioned so they keep their colour and suppleness.',
    image: racks,
    symbol: 'leather',
  },
  {
    key: 'home',
    title: 'Curtains & Home',
    line: 'Care for every layer of the home.',
    body: 'Curtains, upholstery covers, rugs and quilts, cleaned to remove dust and allergens and steamed back into shape.',
    image: sareeChair,
    symbol: 'tumble',
  },
]

export const process = [
  { title: 'Pickup', text: 'Book on WhatsApp. We collect from your door at a time that suits you.', image: bags },
  { title: 'Inspection', text: 'Every garment is checked for stains, loose buttons, weak seams and care labels, then tagged.', image: reception },
  { title: 'Stain treatment', text: 'Stains are treated individually at the spotting station before cleaning, so they do not set.', image: spotting },
  { title: 'Cleaning', text: 'Dry clean, wet clean or hand wash. The method follows the fabric and its construction.', image: machine },
  { title: 'Finishing', text: 'Steamed, pressed and finished by hand. Collars, cuffs, pleats and borders get extra time.', image: press },
  { title: 'Delivery', text: 'Packed in protective covers and returned to your door, ready to wear.', image: packing },
]

export const fabrics = [
  {
    key: 'silk',
    image: sareeChair,
    name: 'Silk Saree',
    symbols: ['dryclean', 'noWash', 'ironLow'],
    note: 'Delicate fibres, zari borders and rich dyes.',
    how: [
      'Spot-tested for colour fastness before anything else',
      'Gentle solvent cycle, never a standard wash',
      'Low-heat finishing, pleats and pallu set by hand',
    ],
    tip: 'Store it folded in a cotton or muslin cloth, and refold along new lines every few months so the zari does not crack.',
  },
  {
    key: 'suit',
    image: suit,
    name: 'Wool Suit',
    symbols: ['dryclean', 'noWash', 'ironMid'],
    note: 'Structured shoulders and a canvas that holds the shape.',
    how: [
      'Brushed and checked for spots and wear',
      'Dry cleaned only when it needs it',
      'Pressed over a form to keep lapels and shoulders',
    ],
    tip: 'Your suit does not need cleaning after every wear. Brush it, let it air, and hang it on a shaped hanger.',
  },
  {
    key: 'linen',
    image: shirts,
    name: 'Linen Shirt',
    symbols: ['wash40', 'noTumble', 'ironHigh'],
    note: 'Breathable and strong, but it creases if you look at it.',
    how: [
      'Washed cool to protect the fibre and colour',
      'Air dried, never tumbled hot',
      'Pressed damp with high steam for a clean finish',
    ],
    tip: 'Hang linen while it is still slightly damp. Most creases fall out on their own.',
  },
  {
    key: 'lehenga',
    image: bride,
    name: 'Bridal Lehenga',
    symbols: ['dryclean', 'hand', 'noIron'],
    note: 'Heavy embroidery, stones, sequins and can-can layers.',
    how: [
      'Embellishments checked and loose work noted with you',
      'Delicate areas covered or cleaned by hand',
      'Steamed rather than pressed so the work is not flattened',
    ],
    tip: 'Never hang a heavy lehenga by the waist for long. Fold it with tissue between layers and store it flat.',
  },
  {
    key: 'shirt',
    image: sareesWhite,
    name: 'White Shirt',
    symbols: ['wash40', 'noBleach', 'ironHigh'],
    note: 'Collars and underarms show everything.',
    how: [
      'Collar and cuffs pre-treated for sweat and deodorant marks',
      'Washed separately to keep whites white',
      'Pressed with a crisp collar and cuffs',
    ],
    tip: 'Yellow underarms come from sweat and deodorant building up. Let deodorant dry fully before you dress.',
  },
]

export const quiz = {
  question: 'Coffee on a white shirt. What do you do first?',
  options: [
    { key: 'A', label: 'Rub it', verdict: 'Rubbing pushes the stain deeper and roughs up the fibres.' },
    { key: 'B', label: 'Add hot water', verdict: 'Hot water can set some stains, especially if there is milk in the coffee.' },
    { key: 'C', label: 'Blot it', verdict: 'Blot gently with a clean cloth from the outside in. Then send it to us.' },
  ],
  answer: 'C',
}

export const promises = [
  { title: 'Free pickup & delivery', text: 'Collected from your door and returned ready to wear.' },
  { title: 'Care by fabric', text: 'Each garment is treated for what it is made of and how it is made.' },
  { title: 'Finished by hand', text: 'Collars, pleats and borders get the time they need.' },
  { title: 'Protective packing', text: 'Returned covered, hung or folded the way the garment prefers.' },
]

// Lines from the brand book's "Aspen Moments" pillar.
export const moments = [
  { line: 'Ready for the wedding.', sub: 'Bridal lehengas, sherwanis and heavy zari work, cleaned and steamed so the embroidery stands up again.', image: bride },
  { line: 'Ready for Monday.', sub: 'Suits brushed, cleaned when they need it and pressed over a form.', image: suit },
  { line: 'That first-wear feeling. Again.', sub: 'Drapes that fall the way they did the day you bought them.', image: sareeIvory },
]

export const wardrobe = [
  { name: 'Silk Sarees', note: 'Kanjeevaram · Banarasi · Patola', image: sareeGreen },
  { name: 'Bridal Lehengas', note: 'Zari · zardozi · stonework', image: bride },
  { name: 'Suits & Bandhgalas', note: 'Wool · linen · velvet', image: suit },
  { name: 'Kurtas & Dupattas', note: 'Chikankari · chanderi · organza', image: kurta },
  { name: 'Drapes & Occasionwear', note: 'Georgette · chiffon · crepe', image: sareeIvory },
  { name: 'Everyday Cottons', note: 'Shirts · kasavu · linens', image: sareesWhite },
]

// Placeholder photography (Unsplash License). Replace with Aspen's own shoot before launch.
export const photoCredits = [
  'https://unsplash.com/photos/Cr4BApFna1c',
  'https://unsplash.com/photos/0XS_oZrq5HM',
  'https://unsplash.com/photos/auTq92xjGOg',
  'https://unsplash.com/photos/VsCBt8j-qg4',
  'https://unsplash.com/photos/Y7r-VIL_vQM',
  'https://unsplash.com/photos/ZZk2khywF6c',
  'https://unsplash.com/photos/gma1zfS3_6E',
]
