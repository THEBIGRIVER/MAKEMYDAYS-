
import { GoogleGenAI, Type } from "@google/genai";
import { Event, Booking, AIRecommendation } from '../types';
import { INITIAL_EVENTS } from '../constants';

const BOOKINGS_KEY = 'makemydays_bookings_v1';
const EVENTS_KEY = 'makemydays_events_v1';

export const api = {
  async getEvents(): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(EVENTS_KEY);
    if (!stored) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    return JSON.parse(stored);
  },

  async saveEvent(event: Event): Promise<void> {
    const events = await this.getEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index > -1) {
      events[index] = event;
    } else {
      events.push(event);
    }
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },

  async deleteEvent(eventId: string): Promise<void> {
    const events = await this.getEvents();
    const updated = events.filter(e => e.id !== eventId);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
  },

  async getRecommendations(mood: string, events: Event[]): Promise<AIRecommendation> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const eventContext = events.map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
      description: e.description
    }));

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `ACT AS AN EXPERT MOOD-BASED EXPERIENCE CURATOR.
        USER CURRENT STATE: "${mood}"
        AVAILABLE EXPERIENCES: ${JSON.stringify(eventContext)}
        
        INSTRUCTIONS:
        1. Analyze the user's mood query.
        2. Select 1 to 3 EXACT IDs from the provided list that best fit.
        3. Provide a high-energy, empathetic reasoning sentence starting with an emoji.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reasoning: { 
                type: Type.STRING,
                description: "A punchy explanation of the choice."
              },
              suggestedEventIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "The IDs of events that match."
              }
            },
            required: ["reasoning", "suggestedEventIds"]
          }
        }
      });

      const result = JSON.parse(response.text.trim());
      return result;
    } catch (error) {
      console.error("AI recommendation failed:", error);
      return {
        reasoning: "✨ We've curated a special selection to match your vibe today.",
        suggestedEventIds: events.slice(0, 2).map(e => e.id)
      };
    }
  },

  async getBookings(): Promise<Booking[]> {
    const stored = localStorage.getItem(BOOKINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  async saveBooking(booking: Booking): Promise<void> {
    const current = await this.getBookings();
    const updated = [booking, ...current];
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  async cancelBooking(bookingId: string): Promise<void> {
    const current = await this.getBookings();
    const updated = current.filter(b => b.id !== bookingId);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }
};
