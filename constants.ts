import { Event } from './types.ts';

export const DEFAULT_HOST = '917686924919';
const EXPLORER_1 = '9820012345';
const EXPLORER_2 = '9930054321';
const EXPLORER_3 = '9120098765';
const EXPLORER_4 = '9870011223';
const EXPLORER_5 = '9111122233';

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'm1',
    title: 'Interstellar: Open Air Screening',
    category: 'Shows',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200',
    description: 'A cinematic journey through the stars under the real night sky. Spatial audio and premium seating provided.',
    price: 499,
    capacity: 150,
    dates: ['25 Dec 2024', '26 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '08:00 PM', availableSeats: 150 }]
  },
  {
    id: 'user-sample-1',
    title: 'Secret Rooftop Sunset Jam',
    category: 'Shows',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&q=80&w=1200',
    description: 'An acoustic session on a private rooftop in Bandra. Bring your own instrument or just your energy.',
    price: 150,
    capacity: 15,
    dates: ['26 Dec 2024'],
    hostPhone: EXPLORER_1,
    slots: [{ time: '06:30 PM', availableSeats: 15 }],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'user-sample-5',
    title: 'Glow-in-the-Dark Yoga Flow',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
    description: 'A vinyasa flow session illuminated by neon body paint and UV lights. Feel the energy in every move.',
    price: 300,
    capacity: 20,
    dates: ['28 Dec 2024'],
    hostPhone: EXPLORER_5,
    slots: [{ time: '07:30 PM', availableSeats: 20 }],
    createdAt: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: 'user-sample-3',
    title: 'Urban Foraging & Tea Ceremony',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1545231027-63b3f162ad00?auto=format&fit=crop&q=80&w=1200',
    description: 'Discover the edible wild side of the city followed by a traditional matcha ceremony in a hidden garden.',
    price: 750,
    capacity: 8,
    dates: ['27 Dec 2024'],
    hostPhone: EXPLORER_3,
    slots: [{ time: '04:00 PM', availableSeats: 8 }],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'w1',
    title: 'Clay & Consciousness Workshop',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?auto=format&fit=crop&q=80&w=1200',
    description: 'A sensory pottery workshop focusing on mindfulness and tactile creation. Perfect for grounding your energy.',
    price: 1200,
    capacity: 20,
    dates: ['28 Dec 2024', '29 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [
      { time: '11:00 AM', availableSeats: 10 },
      { time: '03:00 PM', availableSeats: 10 }
    ]
  },
  {
    id: 'user-sample-2',
    title: 'Midnight Forest Cycle Run',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c4b282?auto=format&fit=crop&q=80&w=1200',
    description: 'A high-cadence group ride through the national park trails under moonlight. Safety gear mandatory.',
    price: 0,
    capacity: 25,
    dates: ['27 Dec 2024'],
    hostPhone: EXPLORER_2,
    slots: [{ time: '11:45 PM', availableSeats: 25 }],
    createdAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'user-sample-4',
    title: 'Street Photography Flash Mob',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
    description: 'A fast-paced shooting session in the old market districts. Capture the raw energy of the city.',
    price: 200,
    capacity: 12,
    dates: ['29 Dec 2024'],
    hostPhone: EXPLORER_4,
    slots: [{ time: '10:00 AM', availableSeats: 12 }],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 't1',
    title: 'Deep Tissue Somatic MMD Original',
    category: 'MMD Originals',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
    description: 'Targeted physical release to unlock trapped emotional frequencies and restore muscular harmony.',
    price: 3500,
    capacity: 1,
    dates: ['24 Dec 2024', '27 Dec 2024', '30 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '02:00 PM', availableSeats: 1 }]
  },
  {
    id: 'a1',
    title: 'Neon Night Paintball',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1200',
    description: 'High-intensity tactical movement in a neon-glow arena. The ultimate primal release.',
    price: 1499,
    capacity: 40,
    dates: ['25 Dec 2024', '26 Dec 2024', '27 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [
      { time: '07:00 PM', availableSeats: 20 },
      { time: '09:00 PM', availableSeats: 20 }
    ]
  }
];