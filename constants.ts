
import { Event } from './types.ts';

export const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Leadership Grit Workshop',
    category: 'Team Building',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    description: 'Transform your management style through radical transparency and trust-building exercises in an immersive environment.',
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
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1200',
    description: 'The ultimate tactical challenge. Professional equipment and a sprawling urban-warfare map designed for maximum strategy.',
    price: 1499,
    slots: [
      { time: '11:00 AM', availableSeats: 24 },
      { time: '02:00 PM', availableSeats: 20 }
    ]
  },
  {
    id: '14',
    title: 'Elite Equestrian Trails',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=1200',
    description: 'Connect with noble steeds on a guided trail through untouched nature. Experience the bond and the thrill of the gallop.',
    price: 4500,
    slots: [
      { time: '07:00 AM', availableSeats: 4 },
      { time: '04:00 PM', availableSeats: 4 }
    ]
  },
  {
    id: '15',
    title: 'Neon Glide Disco',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1551698618-1fed5d97530d?auto=format&fit=crop&q=80&w=1200',
    description: 'Skate under the neon lights with high-energy beats. A retro-modern roller skating experience that keeps the vibes high.',
    price: 899,
    slots: [
      { time: '06:00 PM', availableSeats: 50 },
      { time: '08:00 PM', availableSeats: 50 }
    ]
  },
  {
    id: '16',
    title: 'Gravity Defiance Zone',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1524624891104-e3437171d18f?auto=format&fit=crop&q=80&w=1200',
    description: 'Release your inner child in a massive trampoline arena. Includes dodgeball pits, foam cubes, and wall-running zones.',
    price: 1200,
    slots: [
      { time: '11:00 AM', availableSeats: 30 },
      { time: '03:00 PM', availableSeats: 30 }
    ]
  },
  {
    id: '17',
    title: 'Neuro-Sync Alpha Protocol',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1620332372374-f108c53d2e03?auto=format&fit=crop&q=80&w=1200',
    description: 'Advanced neuro-feedback program designed to optimize your brain waves. Enhance focus and achieve deep states of calm.',
    price: 7500,
    slots: [
      { time: '10:00 AM', availableSeats: 2 },
      { time: '02:00 PM', availableSeats: 2 }
    ]
  },
  {
    id: '18',
    title: 'Smash Pro Open',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1200',
    description: 'Join the city\'s most competitive badminton tournament. Professional courts and a high-stakes bracket system.',
    price: 500,
    slots: [
      { time: '08:00 AM', availableSeats: 64 }
    ]
  },
  {
    id: '19',
    title: 'Night League T20 Blast',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1200',
    description: 'Experience the rush of floodlit cricket. A competitive T20 tournament format with digital scoring and match highlights.',
    price: 1500,
    slots: [
      { time: '07:00 PM', availableSeats: 44 }
    ]
  },
  {
    id: '20',
    title: 'Ultra-Turf Arena',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=1200',
    description: 'Book a premium turf for your private cricket matches. High-quality shock-absorbing grass for maximum performance.',
    price: 2500,
    slots: [
      { time: '06:00 AM', availableSeats: 22 },
      { time: '09:00 PM', availableSeats: 22 }
    ]
  },
  {
    id: '21',
    title: 'Speed-Bolt Batting Cage',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200',
    description: 'Face the fastest deliveries from our professional bowling machines. Dial in your speed and master the pull shot.',
    price: 750,
    slots: [
      { time: '10:00 AM', availableSeats: 5 },
      { time: '04:00 PM', availableSeats: 5 }
    ]
  },
  {
    id: '22',
    title: 'Hyper-Reality Metaverse Hub',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=1200',
    description: 'Step into the next dimension with our VR gaming experience. Full-body haptic suits and 360-degree wireless movement.',
    price: 1999,
    slots: [
      { time: '12:00 PM', availableSeats: 10 },
      { time: '05:00 PM', availableSeats: 10 }
    ]
  },
  {
    id: '23',
    title: 'Meta-Strike AR Combat',
    category: 'Activity',
    image: 'https://images.unsplash.com/photo-1593508512855-994451a9e9c7?auto=format&fit=crop&q=80&w=1200',
    description: 'The world\'s first Meta shot gaming arena. Augmented reality combat that turns the real world into a digital battlefield.',
    price: 1200,
    slots: [
      { time: '11:00 AM', availableSeats: 20 },
      { time: '03:00 PM', availableSeats: 20 }
    ]
  },
  {
    id: '24',
    title: 'Retro-Modern Bowling',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1544133782-b648bc10990a?auto=format&fit=crop&q=80&w=1200',
    description: 'Luxury bowling lanes with high-tech scoring and a premium lounge. Perfect for socializing and competitive striking.',
    price: 999,
    slots: [
      { time: '04:00 PM', availableSeats: 30 },
      { time: '09:00 PM', availableSeats: 30 }
    ]
  },
  {
    id: '25',
    title: 'Crystal Infinity Pool',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1200',
    description: 'Swim toward the horizon in our temperature-controlled infinity pool. Includes hydrotherapy zones and lane swimming.',
    price: 1200,
    slots: [
      { time: '06:00 AM', availableSeats: 15 },
      { time: '06:00 PM', availableSeats: 15 }
    ]
  },
  {
    id: '26',
    title: 'Celestial Wilds Camping',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1200',
    description: 'Premium tenting experience under a blanket of stars. Includes campfire setups, gourmet bush-meals, and stargazing guides.',
    price: 3500,
    slots: [
      { time: '04:00 PM', availableSeats: 10 }
    ]
  },
  {
    id: '27',
    title: 'Serene Lake Expedition',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1200',
    description: 'A quiet morning of boating on clear waters. Kayak or row through hidden coves and observe the local ecosystem.',
    price: 1800,
    slots: [
      { time: '08:00 AM', availableSeats: 12 }
    ]
  },
  {
    id: '28',
    title: 'Rapid-Fire Boat Wars',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1517176102644-b8ecdca9da60?auto=format&fit=crop&q=80&w=1200',
    description: 'High-speed team combat on water. Maneuver your boat through obstacles while engaging in tactical water cannon skirmishes.',
    price: 2800,
    slots: [
      { time: '11:00 AM', availableSeats: 16 },
      { time: '03:00 PM', availableSeats: 16 }
    ]
  },
  {
    id: '29',
    title: 'Sky-High Horizon Glide',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1506501139174-099022df5260?auto=format&fit=crop&q=80&w=1200',
    description: 'Experience the ultimate freedom with paragliding. Soar above the landscape with a certified pilot for breathtaking views.',
    price: 6500,
    slots: [
      { time: '07:00 AM', availableSeats: 4 },
      { time: '09:00 AM', availableSeats: 4 }
    ]
  },
  {
    id: '30',
    title: 'Free-Fall Adrenaline Leap',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1551632892-307567db76a9?auto=format&fit=crop&q=80&w=1200',
    description: 'Conquer your fears with bungee jumping from our record-height platform. A pure gravity-driven adrenaline rush.',
    price: 4999,
    slots: [
      { time: '10:00 AM', availableSeats: 10 },
      { time: '02:00 PM', availableSeats: 10 }
    ]
  },
  {
    id: '31',
    title: 'Azure Deep Reef Explorer',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200',
    description: 'Snorkeling in pristine waters. Discover vibrant coral reefs and exotic marine life in this guided underwater journey.',
    price: 3200,
    slots: [
      { time: '09:00 AM', availableSeats: 12 },
      { time: '01:00 PM', availableSeats: 12 }
    ]
  },
  {
    id: '32',
    title: 'Nomad X: Secret Trails',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200',
    description: 'A curated travelling experience to off-beat locations. Join a small group of explorers to discover hidden gems.',
    price: 8500,
    slots: [
      { time: '06:00 AM', availableSeats: 8 }
    ]
  },
  {
    id: '3',
    title: 'Midnight Zen Session',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    description: 'Break through the noise with guided meditation and sound baths in a minimalist urban sanctuary.',
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
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    description: 'Conquer the ridge in this guided high-altitude trek. Includes professional gear and basecamp meals.',
    price: 5999,
    slots: [
      { time: '04:30 AM', availableSeats: 6 }
    ]
  }
];
