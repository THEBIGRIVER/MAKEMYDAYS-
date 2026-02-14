
import { Event } from './types.ts';

export const DEFAULT_HOST = '917686924919';
const EXPLORER_1 = '9820012345';
const EXPLORER_2 = '9930054321';
const EXPLORER_3 = '9120098765';
const EXPLORER_4 = '9870011223';

export const INITIAL_EVENTS: Event[] = [
  // --- SHOWS ---
  {
    id: 's1',
    title: 'Interstellar: Open Air Screening',
    category: 'Shows',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=1200',
    description: 'A cinematic journey through the stars under the real night sky. Spatial audio and premium seating provided.',
    price: 499,
    capacity: 150,
    dates: ['25 Dec 2024', '26 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '08:00 PM', availableSeats: 150 }],
    averageRating: 4.9,
    totalRatings: 124
  },
  {
    id: 's2',
    title: 'Secret Rooftop Sunset Jam',
    category: 'Shows',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&q=80&w=1200',
    description: 'An acoustic session on a private rooftop in Bandra. Bring your own instrument or just your energy.',
    price: 150,
    capacity: 15,
    dates: ['26 Dec 2024'],
    hostPhone: EXPLORER_1,
    slots: [{ time: '06:30 PM', availableSeats: 15 }],
    averageRating: 4.7,
    totalRatings: 18
  },
  {
    id: 's3',
    title: 'Neon Symphony: Immersive Jazz',
    category: 'Shows',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=1200',
    description: 'A fusion of classical jazz and modern light installations. Experience sound in its visual form.',
    price: 899,
    capacity: 40,
    dates: ['27 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '09:00 PM', availableSeats: 40 }]
  },

  // --- ACTIVITY ---
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
    slots: [{ time: '07:00 PM', availableSeats: 20 }, { time: '09:00 PM', availableSeats: 20 }],
    averageRating: 4.8,
    totalRatings: 56
  },
  {
    id: 'a2',
    title: 'Midnight Forest Cycle Run',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=1200',
    description: 'A high-cadence group ride through the national park trails under moonlight. Safety gear mandatory.',
    price: 0,
    capacity: 25,
    dates: ['27 Dec 2024'],
    hostPhone: EXPLORER_2,
    slots: [{ time: '11:45 PM', availableSeats: 25 }]
  },
  {
    id: 'a3',
    title: 'Street Photography Flash Mob',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
    description: 'A fast-paced shooting session in the old market districts. Capture the raw energy of the city.',
    price: 200,
    capacity: 12,
    dates: ['29 Dec 2024'],
    hostPhone: EXPLORER_4,
    slots: [{ time: '10:00 AM', availableSeats: 12 }],
    averageRating: 4.5,
    totalRatings: 9
  },

  // --- MMD ORIGINALS ---
  {
    id: 'm1',
    title: 'Deep Tissue Somatic Release',
    category: 'MMD Originals',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
    description: 'Targeted physical release to unlock trapped emotional frequencies and restore muscular harmony.',
    price: 3500,
    capacity: 1,
    dates: ['24 Dec 2024', '27 Dec 2024', '30 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '02:00 PM', availableSeats: 1 }],
    averageRating: 5.0,
    totalRatings: 42
  },
  {
    id: 'm2',
    title: 'The Void: Sensory Deprivation',
    category: 'MMD Originals',
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200',
    description: 'A proprietary MAKEMYDAYS experience. Total darkness, floating weightlessness, and curated binaural beats.',
    price: 4500,
    capacity: 2,
    dates: ['26 Dec 2024', '28 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '11:00 AM', availableSeats: 1 }, { time: '04:00 PM', availableSeats: 1 }],
    averageRating: 4.9,
    totalRatings: 31
  },
  {
    id: 'm3',
    title: 'Primal Roar: Vocal Therapy',
    category: 'MMD Originals',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=1200',
    description: 'An uninhibited group session using vocalization and breath to purge stagnant energy from the core.',
    price: 1200,
    capacity: 15,
    dates: ['29 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '06:00 AM', availableSeats: 15 }]
  },

  // --- MINDFULNESS ---
  {
    id: 'mn2',
    title: 'Zen & The Art of Archery',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1511394592634-f6bd05cbac11?auto=format&fit=crop&q=80&w=1200',
    description: 'Kyudo-inspired archery focusing on the union of mind, body, and the target. Not about the score, but the state.',
    price: 1800,
    capacity: 6,
    dates: ['27 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '08:00 AM', availableSeats: 3 }, { time: '10:00 AM', availableSeats: 3 }]
  },
  {
    id: 'mn3',
    title: 'Silent Disco Meditation',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    description: 'Guided meditation delivered through high-fidelity wireless headphones in a bustling city park.',
    price: 500,
    capacity: 30,
    dates: ['26 Dec 2024'],
    hostPhone: EXPLORER_1,
    slots: [{ time: '05:30 PM', availableSeats: 30 }],
    averageRating: 4.4,
    totalRatings: 45
  },

  // --- WORKSHOP ---
  {
    id: 'w1',
    title: 'Clay & Consciousness Pottery',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?auto=format&fit=crop&q=80&w=1200',
    description: 'A sensory pottery workshop focusing on mindfulness and tactile creation. Perfect for grounding your energy.',
    price: 1200,
    capacity: 20,
    dates: ['28 Dec 2024', '29 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '11:00 AM', availableSeats: 10 }, { time: '03:00 PM', availableSeats: 10 }],
    averageRating: 4.8,
    totalRatings: 12
  },
  {
    id: 'w2',
    title: 'Urban Foraging & Tea Ceremony',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1545231027-63b3f162ad00?auto=format&fit=crop&q=80&w=1200',
    description: 'Discover the edible wild side of the city followed by a traditional matcha ceremony in a hidden garden.',
    price: 750,
    capacity: 8,
    dates: ['27 Dec 2024'],
    hostPhone: EXPLORER_3,
    slots: [{ time: '04:00 PM', availableSeats: 8 }]
  },
  {
    id: 'w3',
    title: 'Experimental Mixology: Elixirs',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1200',
    description: 'Learn to craft potent non-alcoholic elixirs using adaptogens, botanicals, and high-frequency infusions.',
    price: 2500,
    capacity: 12,
    dates: ['30 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '07:00 PM', availableSeats: 12 }]
  },

  // --- THERAPY ---
  {
    id: 't1',
    title: 'Equine Resonance: Horse Therapy',
    category: 'Therapy',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=1200',
    description: 'Non-riding interaction with horses to mirror your internal state and regulate your nervous system.',
    price: 5500,
    capacity: 2,
    dates: ['25 Dec 2024', '26 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '10:00 AM', availableSeats: 1 }, { time: '04:00 PM', availableSeats: 1 }],
    averageRating: 5.0,
    totalRatings: 7
  },
  {
    id: 't2',
    title: 'Art Therapy Expressionism',
    category: 'Therapy',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1200',
    description: 'Guided therapeutic painting session to manifest and visualize internal blocks. No skill required.',
    price: 900,
    capacity: 10,
    dates: ['27 Dec 2024'],
    hostPhone: EXPLORER_3,
    slots: [{ time: '02:00 PM', availableSeats: 10 }]
  },
  {
    id: 't3',
    title: 'Floating Stillness: Water Therapy',
    category: 'Therapy',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1200',
    description: 'Aquatic bodywork where you are held and moved in warm water to release deep-seated trauma.',
    price: 3800,
    capacity: 1,
    dates: ['28 Dec 2024', '29 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '12:00 PM', availableSeats: 1 }],
    averageRating: 4.9,
    totalRatings: 15
  }
];
