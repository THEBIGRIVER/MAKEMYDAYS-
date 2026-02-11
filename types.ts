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
  capacity: number; // Specified total capacity for the event
  originalPrice?: number;
  slots: Slot[];
  dates: string[]; 
  hostPhone: string;
  createdAt?: string; 
  averageRating?: number;
  totalRatings?: number;
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
  hostPhone?: string; // Phone number of the event host
  confirmationEmail?: string;
  reminderSent?: boolean;
  rating?: number;
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