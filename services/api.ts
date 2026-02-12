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
  orderBy,
  runTransaction,
  DocumentData
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
    } catch (e: any) {
      console.warn("Profile sync paused (operating in offline mode or permissions limited):", e.message);
    }
  },

  // Event Management
  async getEvents(): Promise<Event[]> {
    try {
      const eventsCol = collection(db, 'events');
      const q = query(eventsCol, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return INITIAL_EVENTS;
      
      const firestoreEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      
      // Merge initial events with firestore events (preferring firestore versions)
      const merged = [...firestoreEvents];
      INITIAL_EVENTS.forEach((ie: Event) => {
        if (!merged.find(me => me.id === ie.id)) {
          merged.push(ie);
        }
      });
      
      return merged;
    } catch (e: any) {
      console.error("Firestore fetch error:", e);
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
      const eventRef = doc(db, 'events', event.id);
      await setDoc(eventRef, eventData);
    } catch (e: any) {
      if (e.code === 'permission-denied') throw new Error('permission-denied');
      throw e;
    }
  },

  async deleteEvent(eventId: string, userUid: string): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists() && eventSnap.data()?.ownerUid === userUid) {
        await deleteDoc(eventRef);
      }
    } catch (e: any) {
      console.error("Delete failed:", e);
      throw e;
    }
  },

  // AI Recommendations
  async getRecommendations(mood: string, events: Event[]): Promise<AIRecommendation> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { reasoning: "✨ Recalibrating local frequencies.", suggestedEventIds: events.slice(0, 3).map(e => e.id) };
    }
    const ai = new GoogleGenAI({ apiKey });
    const eventContext = events.map((e: Event) => ({ id: e.id, title: e.title, category: e.category }));

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `MOOD: "${mood}". MATCH 1-3 EVENTS. JSON ONLY. EVENTS: ${JSON.stringify(eventContext)}`,
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
      
      if (!response) {
        throw new Error("No response from AI");
      }
      
      const text = response.text;
      if (text === undefined) throw new Error("Empty AI response");
      return JSON.parse(text.trim());
    } catch {
      return { reasoning: "✨ Calibrating local frequencies for you.", suggestedEventIds: events.slice(0, 3).map(e => e.id) };
    }
  },

  // Booking Management
  async getBookings(userUid: string): Promise<Booking[]> {
    try {
      const bookingsCol = collection(db, 'bookings');
      const q = query(bookingsCol, where('userUid', '==', userUid), orderBy('bookedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (e: any) {
      console.warn("Booking fetch error (likely offline):", e);
      return [];
    }
  },

  async saveBooking(booking: Booking, userUid: string): Promise<void> {
    try {
      const bookingsCol = collection(db, 'bookings');
      const bookingData = { ...booking, userUid, bookedAt: new Date().toISOString() };
      await addDoc(bookingsCol, bookingData);
    } catch (e: any) {
      if (e.code === 'permission-denied') throw new Error('permission-denied');
      throw e;
    }
  },

  async submitRating(bookingId: string, eventId: string, rating: number): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const bookingRef = doc(db, 'bookings', bookingId);
        const eventRef = doc(db, 'events', eventId);
        
        const eventSnap = await transaction.get(eventRef);
        
        // Update booking
        transaction.update(bookingRef, { rating });
        
        // Update event average rating
        let eventData: DocumentData;
        if (eventSnap.exists()) {
          eventData = eventSnap.data() as DocumentData;
        } else {
          // If event doc doesn't exist yet (e.g. initial event not modified), seed it
          const initialEvent = INITIAL_EVENTS.find(e => e.id === eventId);
          eventData = initialEvent ? { ...initialEvent } : {};
        }

        const currentTotal = eventData.totalRatings || 0;
        const currentAvg = eventData.averageRating || 0;
        const newTotal = currentTotal + 1;
        const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

        transaction.set(eventRef, {
          ...eventData,
          averageRating: newAvg,
          totalRatings: newTotal
        }, { merge: true });
      });
    } catch (e: any) {
      console.error("Rating transaction failed:", e);
      throw e;
    }
  }
};