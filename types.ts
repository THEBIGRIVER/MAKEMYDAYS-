export type Category = "Team Building" | "Activity" | "Wellness" | "Mindfulness" | "Adventure" | "Creative Arts";

export interface Slot {
  time: string;
  availableSeats: number;
}

export interface Event {
  id: string;
  title: string;
  category: Category;
  image: string;
  description: string;
  price: number;
  originalPrice?: number;
  slots: Slot[];
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  category: Category;
  time: string;
  bookedAt: string;
  userName?: string;
  userPhone?: string;
}

export interface User {
  name: string;
  phone: string;
  bookings: Booking[];
  role?: 'user' | 'admin';
}

export interface AIRecommendation {
  reasoning: string;
  suggestedEventIds: string[];
}