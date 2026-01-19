import { Event } from './types';

export const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Leadership Grit Workshop',
    category: 'Team Building',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000',
    description: 'Transform your management style through radical transparency and trust-building exercises in an immersive, high-impact environment.',
    price: 3499,
    slots: [
      { time: '10:30 AM', availableSeats: 12 },
      { time: '03:00 PM', availableSeats: 8 }
    ]
  },
  {
    id: '2',
    title: 'Elite Paintball Arena',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1000',
    description: 'The ultimate tactical challenge. Professional equipment and a sprawling urban-warfare map designed for maximum strategy and adrenaline.',
    price: 1499,
    slots: [
      { time: '11:00 AM', availableSeats: 24 },
      { time: '02:00 PM', availableSeats: 20 },
      { time: '05:00 PM', availableSeats: 15 }
    ]
  },
  {
    id: '3',
    title: 'Midnight Zen Session',
    category: 'Therapy',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000',
    description: 'Break through the noise with guided deep-tissue meditation and sound baths in a soundproof, minimalist urban sanctuary.',
    price: 2499,
    slots: [
      { time: '09:00 PM', availableSeats: 10 },
      { time: '11:30 PM', availableSeats: 15 }
    ]
  },
  {
    id: '11',
    title: 'The Summit Expedition',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    description: 'Conquer the ridge in this guided high-altitude trek. Includes professional gear, basecamp meals, and unforgettable sunrise views.',
    price: 5999,
    slots: [
      { time: '04:30 AM', availableSeats: 6 }
    ]
  },
  {
    id: '12',
    title: 'Neo-Abstract Mural Co-Op',
    category: 'Creative Arts',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1000',
    description: 'Collaborate with a master street artist to create a large-scale public mural. Learn spray techniques and color theory in real-time.',
    price: 2199,
    slots: [
      { time: '10:00 AM', availableSeats: 12 },
      { time: '02:00 PM', availableSeats: 12 }
    ]
  },
  {
    id: '13',
    title: 'Pranic Energy Healing',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1000',
    description: 'Rebalance your vital life force with master-guided energy alignment. Perfect for clearing mental blockages and emotional fatigue.',
    price: 1799,
    slots: [
      { time: '10:00 AM', availableSeats: 8 },
      { time: '05:30 PM', availableSeats: 12 }
    ]
  },
  {
    id: '9',
    title: 'Euphoric Laughter Lab',
    category: 'Therapy',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=1000',
    description: 'Scientific joy. A group session using movement and forced-to-natural laughter to radically lower cortisol and boost connection.',
    price: 1199,
    slots: [
      { time: '09:00 AM', availableSeats: 30 },
      { time: '06:30 PM', availableSeats: 30 }
    ]
  },
  {
    id: '10',
    title: 'Urban Flow Movement',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1000',
    description: 'A blend of parkour-lite and contemporary dance. Explore your environment through creative movement and weight distribution.',
    price: 1899,
    slots: [
      { time: '07:00 AM', availableSeats: 20 },
      { time: '06:00 PM', availableSeats: 20 }
    ]
  }
];