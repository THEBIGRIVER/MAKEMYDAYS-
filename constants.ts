
import { Event } from './types.ts';

const DEFAULT_HOST = '917686924919';

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'm1',
    title: 'Interstellar: Open Air Screening',
    category: 'Movie',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200',
    description: 'A cinematic journey through the stars under the real night sky. Spatial audio and premium seating provided.',
    price: 499,
    date: '25 Dec 2024',
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
    hostPhone: DEFAULT_HOST,
    slots: [
      { time: '07:00 PM', availableSeats: 20 },
      { time: '09:00 PM', availableSeats: 20 }
    ]
  },
  {
    id: 'wel1',
    title: 'Infinity Pool Sound Bath',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200',
    description: 'Floating meditation accompanied by Tibetan singing bowls at the edge of the city horizon.',
    price: 1800,
    hostPhone: DEFAULT_HOST,
    slots: [{ time: '06:00 AM', availableSeats: 12 }]
  }
];
