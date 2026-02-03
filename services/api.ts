
import { GoogleGenAI, Type } from "@google/genai";
import { Event, Booking, AIRecommendation, User } from '../types.ts';
import { INITIAL_EVENTS } from '../constants.ts';

const BOOKINGS_KEY = 'makemydays_bookings_v1';
const EVENTS_KEY = 'makemydays_events_v1';
const USERS_DB_KEY = 'makemydays_users_db_v1';

export const api = {
  // User Management
  async getAllUsers(): Promise<any[]> {
    try {
      const stored = localStorage.getItem(USERS_DB_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  async saveUser(user: User, pin: string): Promise<void> {
    const users = await this.getAllUsers();
    const existingIndex = users.findIndex(u => u.phone === user.phone);
    const userWithPin = { ...user, pin };
    
    if (existingIndex > -1) {
      users[existingIndex] = userWithPin;
    } else {
      users.push(userWithPin);
    }
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  },

  async authenticate(phone: string, pin: string): Promise<User | null> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.phone === phone && u.pin === pin);
    if (user) {
      const { pin: _, ...userWithoutPin } = user;
      return userWithoutPin as User;
    }
    return null;
  },

  // Event Management
  async getEvents(): Promise<Event[]> {
    try {
      const stored = localStorage.getItem(EVENTS_KEY);
      if (!stored) {
        // If nothing is stored, initialize with initial events
        localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
      }
      const parsed = JSON.parse(stored) as Event[];
      // If the stored array is empty, re-initialize with INITIAL_EVENTS to ensure feed is never empty
      if (parsed.length === 0) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
      }
      return parsed;
    } catch (e) {
      console.error("Critical: Failed to parse events from storage. Reverting to initial state.");
      return INITIAL_EVENTS;
    }
  },

  async saveEvent(event: Event): Promise<void> {
    const events = await this.getEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index > -1) {
      events[index] = event;
    } else {
      events.unshift(event); // New events always appear at the top globally
    }
    
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
      console.error("Storage full: Data loss prevented.");
      throw new Error("Sanctuary memory full. Try a smaller image or removing older events.");
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    const events = await this.getEvents();
    const filtered = events.filter(e => e.id !== eventId);
    // If we delete everything, let's keep INITIAL_EVENTS as a fallback in memory
    localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
  },

  // AI & Bookings
  async getRecommendations(mood: string, events: Event[]): Promise<AIRecommendation> {
    const apiKey = process.env.API_KEY || "";
    if (!apiKey) {
      return { reasoning: "✨ Synchronizing your frequency with our experiences.", suggestedEventIds: events.slice(0, 3).map(e => e.id) };
    }
    const ai = new GoogleGenAI({ apiKey });
    const eventContext = events.map(e => ({ id: e.id, title: e.title, category: e.category, description: e.description }));

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `USER MOOD: "${mood}". 
        VALID CATEGORIES: Shows, Activity, MMD Originals, Mindfulness, Workshop.
        AVAILABLE EVENTS: ${JSON.stringify(eventContext)}
        
        INSTRUCTIONS:
        1. Match 1-3 event IDs that best serve this mood.
        2. Provide reasoning starting with a relevant emoji.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reasoning: { type: Type.STRING },
              suggestedEventIds: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["reasoning", "suggestedEventIds"]
          }
        }
      });
      const text = response.text || "{}";
      return JSON.parse(text.trim());
    } catch (error) {
      console.error("AI Recommendation disrupted:", error);
      return { reasoning: "✨ Frequency synced. We suggest exploring these sessions.", suggestedEventIds: events.slice(0, 3).map(e => e.id) };
    }
  },

  async getBookings(): Promise<Booking[]> {
    const stored = localStorage.getItem(BOOKINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  async saveBooking(booking: Booking): Promise<void> {
    const current = await this.getBookings();
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking, ...current]));
  }
};
