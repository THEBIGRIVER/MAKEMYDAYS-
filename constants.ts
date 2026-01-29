
import { Event } from './types.ts';

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'm1',
    title: 'Interstellar: 10th Anniversary Screening',
    category: 'Movie',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200',
    description: 'A singular cinematic journey across space and time. Experience the masterpiece on a massive open-air screen with immersive spatial audio.',
    price: 499,
    date: '25 Dec 2024',
    slots: [
      { time: '08:00 PM', availableSeats: 150 }
    ]
  },
  {
    id: 'tabla-1',
    title: 'Mastering the Tabla Rhythm',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1599320623259-b1484be9d628?auto=format&fit=crop&q=80&w=1200',
    description: 'A deep-dive into Indian classical percussion. Synchronize your breath with the Taal in an intimate, earthy sanctuary designed for sonic calibration.',
    price: 1899,
    slots: [
      { time: '06:00 PM', availableSeats: 8 },
      { time: '08:00 PM', availableSeats: 8 }
    ]
  },
  {
    id: 't1',
    title: 'Somatic Flow Therapy',
    category: 'Therapy',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
    description: 'A 1-on-1 intensive session focusing on neural release and physical grounding. Limited to a single elite consultation slot.',
    price: 5500,
    date: '24 Dec 2024',
    slots: [
      { time: '11:00 AM', availableSeats: 1 }
    ]
  },
  {
    id: '1',
    title: 'Leadership Grit Workshop',
    category: 'Team Building',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    description: 'Shatter conventional management. Calibrate your team’s frequency through high-stakes trust protocols and radical transparency in an immersive, ego-free zone.',
    price: 3499,
    slots: [
      { time: '09:00 AM', availableSeats: 12 },
      { time: '11:30 AM', availableSeats: 10 },
      { time: '02:00 PM', availableSeats: 8 },
      { time: '04:30 PM', availableSeats: 15 }
    ]
  },
  {
    id: '2',
    title: 'Elite Paintball Arena',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1200',
    description: 'Urban warfare redefined. Deploy tactical dominance across a sprawling neon-lit map. This is a high-octane test of primal instincts and strategic surge.',
    price: 1499,
    slots: [
      { time: '10:00 AM', availableSeats: 24 },
      { time: '12:00 PM', availableSeats: 24 },
      { time: '02:00 PM', availableSeats: 20 },
      { time: '04:00 PM', availableSeats: 20 },
      { time: '06:00 PM', availableSeats: 16 }
    ]
  },
  {
    id: '24',
    title: 'Retro-Modern Bowling',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1538510127047-97c31fa776c0?auto=format&fit=crop&q=80&w=1200',
    description: 'High-tech striking meets luxury lounging. Calibrate your aim in our designer lanes. The perfect blend of social resonance and competitive precision.',
    price: 999,
    slots: [
      { time: '02:00 PM', availableSeats: 30 },
      { time: '04:00 PM', availableSeats: 30 },
      { time: '06:00 PM', availableSeats: 30 },
      { time: '08:00 PM', availableSeats: 30 },
      { time: '10:00 PM', availableSeats: 30 },
      { time: '12:00 AM', availableSeats: 20 }
    ]
  },
  {
    id: '25',
    title: 'Crystal Infinity Pool',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200',
    description: 'Merge with the horizon. Temperature-controlled waters meet architectural brilliance. A hydrotherapy sanctuary designed to reset your physical frequency.',
    price: 1200,
    slots: [
      { time: '06:00 AM', availableSeats: 15 },
      { time: '09:00 AM', availableSeats: 15 },
      { time: '12:00 PM', availableSeats: 15 },
      { time: '03:00 PM', availableSeats: 15 },
      { time: '06:00 PM', availableSeats: 15 },
      { time: '09:00 PM', availableSeats: 15 }
    ]
  }
];
