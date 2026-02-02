
import { Event } from './types.ts';

const DEFAULT_HOST = '917686924919';
const MOCK_COMMUNITY_HOST_1 = '9820012345';
const MOCK_COMMUNITY_HOST_2 = '9930054321';

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
    id: 'user-sample-1',
    title: 'Secret Rooftop Sunset Jam',
    category: 'Shows',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&q=80&w=1200',
    description: 'An acoustic session on a private rooftop in Bandra. Bring your own instrument or just your energy.',
    price: 150,
    dates: ['26 Dec 2024'],
    hostPhone: MOCK_COMMUNITY_HOST_1,
    slots: [{ time: '06:30 PM', availableSeats: 15 }],
    createdAt: new Date().toISOString()
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
    id: 'user-sample-2',
    title: 'Midnight Forest Cycle Run',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c4b282?auto=format&fit=crop&q=80&w=1200',
    description: 'A high-cadence group ride through the national park trails under moonlight. Safety gear mandatory.',
    price: 0,
    dates: ['27 Dec 2024'],
    hostPhone: MOCK_COMMUNITY_HOST_2,
    slots: [{ time: '11:45 PM', availableSeats: 25 }],
    createdAt: new Date().toISOString()
  },
  {
    id: 't1',
    title: 'Deep Tissue Somatic MMD Original',
    category: 'MMD Originals',
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
  }
];
