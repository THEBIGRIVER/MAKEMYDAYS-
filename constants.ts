import { Event } from './types.ts';

const DEFAULT_HOST = '917686924919';

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'm1',
    title: 'Interstellar: Open Air Screening',
    category: 'Shows',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200',
    description: 'A cinematic journey through the stars under the real night sky. Spatial audio and premium seating provided.',
    price: 499,
    dates: ['25 Dec 2024', '26 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '08:00 PM', availableSeats: 150 }]
  },
  {
    id: 'w1',
    title: 'Clay & Consciousness Workshop',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?auto=format&fit=crop&q=80&w=1200',
    description: 'A sensory pottery workshop focusing on mindfulness and tactile creation. Perfect for grounding your energy.',
    price: 1200,
    dates: ['28 Dec 2024', '29 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [
      { time: '11:00 AM', availableSeats: 10 },
      { time: '03:00 PM', availableSeats: 10 }
    ]
  },
  {
    id: 't1',
    title: 'Deep Tissue Somatic Therapy',
    category: 'Therapy',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
    description: 'Targeted physical release to unlock trapped emotional frequencies and restore muscular harmony.',
    price: 3500,
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
    dates: ['25 Dec 2024', '26 Dec 2024', '27 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [
      { time: '07:00 PM', availableSeats: 20 },
      { time: '09:00 PM', availableSeats: 20 }
    ]
  },
  {
    id: 'mn1',
    title: 'Vipassana Silent Meditation',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    description: 'A guided immersion into profound silence. Recalibrate your inner focus with ancient techniques.',
    price: 800,
    dates: ['26 Dec 2024', '28 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [
      { time: '06:00 AM', availableSeats: 25 },
      { time: '05:00 PM', availableSeats: 25 }
    ]
  },
  {
    id: 'ws2',
    title: 'Electronic Sound Design',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
    description: 'Learn the frequencies of modern audio production. Practical workshop on synthesizers and spatial audio.',
    price: 1800,
    dates: ['27 Dec 2024', '29 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '04:00 PM', availableSeats: 12 }]
  },
  {
    id: 'b1',
    title: 'Sunset Garden Yoga',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    description: 'A community-driven sunset yoga session in the city park. Reconnect with the earth for the price of a coffee.',
    price: 49,
    dates: ['Every Mon', 'Every Wed'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '05:30 PM', availableSeats: 30 }]
  },
  {
    id: 'b2',
    title: 'Retro Cinema Night: Pulp Fiction',
    category: 'Shows',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
    description: 'A cozy indie screening of classic cinema in a hidden rooftop venue. Limited seats for maximum intimacy.',
    price: 99,
    dates: ['26 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '09:00 PM', availableSeats: 20 }]
  },
  {
    id: 'b3',
    title: 'Origami Masterclass',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=800',
    description: 'Learn the ancient art of paper folding. A meditative workshop to build patience and creative dexterity.',
    price: 69,
    dates: ['28 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '11:00 AM', availableSeats: 15 }]
  },
  {
    id: 'b4',
    title: 'Herbal Infusion Tasting',
    category: 'Therapy',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4586d517?auto=format&fit=crop&q=80&w=1200',
    description: 'A sensory journey through natural herbs and their healing frequencies. Taste, smell, and heal.',
    price: 89,
    dates: ['27 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '04:00 PM', availableSeats: 8 }]
  },
  {
    id: 'b5',
    title: 'Laughter Therapy Circle',
    category: 'Therapy',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800',
    description: 'Release built-up stress through a guided laughter yoga session. High frequency, low cost.',
    price: 39,
    dates: ['Every Sat'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '08:00 AM', availableSeats: 40 }]
  },
  {
    id: 'b6',
    title: 'Pranayama Morning Boost',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    description: '15 minutes of intensive breathwork to jumpstart your metabolic frequency for the day.',
    price: 19,
    dates: ['Every Weekday'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '07:00 AM', availableSeats: 100 }]
  },
  {
    id: 'b7',
    title: 'Street Art Photography Walk',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800',
    description: 'Explore the hidden murals of the old city. Capture the raw urban energy through your lens.',
    price: 59,
    dates: ['29 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '03:30 PM', availableSeats: 12 }]
  },
  {
    id: 'b8',
    title: 'Guided Lake Meditation',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800',
    description: 'Sit by the water and find your center. A guided 30-minute meditation for ultimate calm.',
    price: 29,
    dates: ['Every Sunday'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '06:00 AM', availableSeats: 50 }]
  },
  {
    id: 'b9',
    title: 'Digital Minimalism Talk',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    description: 'How to reclaim your attention in a high-noise world. Practical tips for a cleaner digital frequency.',
    price: 79,
    dates: ['25 Dec 2024'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '06:00 PM', availableSeats: 25 }]
  },
  {
    id: 'b10',
    title: 'Acoustic Jam Night',
    category: 'Shows',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    description: 'Local musicians share raw, unplugged frequencies. Come to listen or bring your own instrument.',
    price: 99,
    dates: ['Every Friday'],
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '07:30 PM', availableSeats: 30 }]
  }
];