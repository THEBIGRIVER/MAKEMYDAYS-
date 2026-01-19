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
  slots: Slot[];
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  category: Category;
  time: string;
  bookedAt: string;
}

export interface User {
  name: string;
  email: string;
  bookings: Booking[];
}

export interface AIRecommendation {
  reasoning: string;
  suggestedEventIds: string[];
}