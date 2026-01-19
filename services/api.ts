
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
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, events }),
    });
    if (!res.ok) throw new Error('AI recommendation failed');
    return res.json();
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
