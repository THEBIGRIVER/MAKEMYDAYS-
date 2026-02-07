
import { GoogleGenAI, Type } from "@google/genai";
import { Event, Booking, AIRecommendation, User } from '../types.ts';
import { INITIAL_EVENTS } from '../constants.ts';
import { db } from './firebase.ts';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  addDoc, 
  getDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

export const api = {
  // User Profile Sync
  async syncUserProfile(user: User): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.name,
          email: user.email,
          createdAt: serverTimestamp(),
          role: user.role || 'user'
        });
      }
    } catch (e) {
      console.error("Profile sync failed:", e);
    }
  },

  // Event Management
  async getEvents(): Promise<Event[]> {
    try {
      const eventsCol = collection(db, 'events');
      const q = query(eventsCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Optional: Seed initial events if DB is empty (First time run)
        // For production, this should be handled by a migration script
        return INITIAL_EVENTS;
      }
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
    } catch (e) {
      console.error("Error fetching events:", e);
      return INITIAL_EVENTS;
    }
  },

  async saveEvent(event: Event, userUid: string): Promise<void> {
    try {
      const eventData = {
        ...event,
        ownerUid: userUid,
        createdAt: event.createdAt || new Date().toISOString()
      };
      
      // Remove ID if it's a new event being handled by addDoc
      // or use setDoc if we want to preserve IDs
      const eventRef = doc(db, 'events', event.id);
      await setDoc(eventRef, eventData);
    } catch (e) {
      console.error("Error saving event:", e);
      throw e;
    }
  },

  async deleteEvent(eventId: string, userUid: string): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (eventSnap.exists() && eventSnap.data().ownerUid === userUid) {
        await deleteDoc(eventRef);
      } else {
        throw new Error("Unauthorized or event not found");
      }
    } catch (e) {
      console.error("Error deleting event:", e);
      throw e;
    }
  },

  // AI Recommendations
  async getRecommendations(mood: string, events: Event[]): Promise<AIRecommendation> {
    // Guidelines specify using process.env.API_KEY directly when initializing.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const eventContext = events.map(e => ({ id: e.id, title: e.title, category: e.category, description: e.description }));

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `USER MOOD: "${mood}". MATCH 1-3 EVENTS. REASONING START WITH EMOJI. EVENTS: ${JSON.stringify(eventContext)}`,
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
      // The Gemini API response.text property directly returns the generated string.
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("AI recommendation failed:", error);
      return { reasoning: "✨ We recommend exploring these sessions.", suggestedEventIds: events.slice(0, 3).map(e => e.id) };
    }
  },

  // Booking Management
  async getBookings(userUid: string): Promise<Booking[]> {
    try {
      const bookingsCol = collection(db, 'bookings');
      const q = query(bookingsCol, where('userUid', '==', userUid), orderBy('bookedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (e) {
      console.error("Error fetching bookings:", e);
      return [];
    }
  },

  async saveBooking(booking: Booking, userUid: string): Promise<void> {
    try {
      const bookingsCol = collection(db, 'bookings');
      const bookingData = {
        ...booking,
        userUid: userUid,
        bookedAt: new Date().toISOString()
      };
      await addDoc(bookingsCol, bookingData);
    } catch (e) {
      console.error("Error saving booking:", e);
      throw e;
    }
  }
};
