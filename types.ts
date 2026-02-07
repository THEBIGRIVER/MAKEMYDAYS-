
export type Category = "Shows" | "Activity" | "MMD Originals" | "Mindfulness" | "Workshop" | "Therapy";

export interface Slot {
  time: string;
  availableSeats: number;
}

export interface Event {
  id: string;
  ownerUid?: string; // UID of the host who created the event
  title: string;
  category: Category;
  image: string;
  description: string;
  price: number;
  originalPrice?: number;
  slots: Slot[];
  dates: string[]; 
  hostPhone: string;
  createdAt?: string; 
}

export interface Booking {
  id: string;
  userUid?: string; // UID of the explorer who booked the event
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
  uid: string;
  name: string;
  email: string;
  phone?: string;
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
