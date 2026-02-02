
export type Category = "Shows" | "Activity" | "MMD Originals" | "Mindfulness" | "Workshop";

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
  dates: string[]; 
  hostPhone: string;
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  category: Category;
  time: string;
  eventDate: string;
  price: number;
  bookedAt: string;
  userName?: string;
  userPhone?: string;
  confirmationEmail?: string;
  reminderSent?: boolean;
}

export interface User {
  name: string;
  phone: string;
  bookings: Booking[];
  role?: 'user' | 'admin';
  preferences?: {
    emailReminders: boolean;
    smsReminders: boolean;
  };
}

export interface AIRecommendation {
  reasoning: string;
  suggestedEventIds: string[];
}
