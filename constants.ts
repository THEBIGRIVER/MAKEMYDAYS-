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
    category: 'Wellness',
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
    category: 'Wellness',
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
  },
  {
    id: '14',
    title: 'Canyon Rapelling',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=1000',
    description: 'Descend 100-foot waterfalls and ancient red-rock narrow canyons. A technical adventure for those who want to see the world from a different angle.',
    price: 4599,
    slots: [
      { time: '08:00 AM', availableSeats: 8 },
      { time: '01:00 PM', availableSeats: 8 }
    ]
  },
  {
    id: '15',
    title: 'Deep Sea Freedive',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1000',
    description: 'Master the art of single-breath diving. Explore vibrant coral reefs and silent shipwrecks in crystal clear waters. No tanks, just pure connection.',
    price: 7499,
    slots: [
      { time: '07:00 AM', availableSeats: 4 },
      { time: '10:00 AM', availableSeats: 4 }
    ]
  },
  {
    id: '16',
    title: 'Dune Bash 4x4',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1000',
    description: 'High-speed off-road navigation across shifting sands. Learn to control a custom 4x4 vehicle through massive dunes and rocky terrain.',
    price: 3299,
    slots: [
      { time: '04:00 PM', availableSeats: 12 },
      { time: '06:00 PM', availableSeats: 12 }
    ]
  },
  {
    id: '17',
    title: 'Rooftop 5-a-Side',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000',
    description: 'Night football under city lights. High-intensity 5-a-side tournament with professional referees and a vibrant urban backdrop.',
    price: 899,
    slots: [
      { time: '08:00 PM', availableSeats: 20 },
      { time: '10:00 PM', availableSeats: 20 }
    ]
  },
  {
    id: '18',
    title: 'Padel Masterclass',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1000',
    description: 'Learn the fastest growing sport in the world. Pro-led drills, tactical gameplay, and social matchplay for all skill levels.',
    price: 1299,
    slots: [
      { time: '09:00 AM', availableSeats: 8 },
      { time: '05:00 PM', availableSeats: 8 }
    ]
  },
  {
    id: '19',
    title: 'Velocity Go-Karting',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=1000',
    description: 'Electric racing on a multi-level indoor track. Experience instant torque and tight cornering in high-performance racing karts.',
    price: 1999,
    slots: [
      { time: '02:00 PM', availableSeats: 16 },
      { time: '04:00 PM', availableSeats: 16 },
      { time: '08:00 PM', availableSeats: 16 }
    ]
  }
];