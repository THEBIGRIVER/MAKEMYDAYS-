
import React, { useState, useRef, useMemo } from 'react';
import { User, Booking, Event, Category } from '../types';
import { PolicyType } from './LegalModal';
import { api } from '../services/api';

interface DashboardProps {
  user: User;
  events: Event[];
  bookings: Booking[];
  onLogout: () => void;
  onOpenAdmin?: () => void;
  onOpenPolicy?: (type: PolicyType) => void;
  onRefreshEvents?: () => void;
}

const CreateEventModal: React.FC<{ user: User, onClose: () => void, onSuccess: () => void }> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    category: 'Activity',
    price: 0,
    description: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.description || !formData.image) {
      alert("Please complete all calibration fields, including the visual signature.");
      return;
    }
    
    setIsSubmitting(true);
    const newEvent: Event = {
      id: `user-event-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title || '',
      category: formData.category as Category || 'Activity',
      price: Number(formData.price),
      description: formData.description || '',
      image: formData.image || '',
      hostPhone: user.phone,
      slots: [{ time: '10:00 AM', availableSeats: 20 }, { time: '02:00 PM', availableSeats: 20 }]
    };

    await api.saveEvent(newEvent);
    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-8 text-white">
          <span className="text-brand-red text-[8px] font-black uppercase tracking-[0.4em] mb-1 block">Creator Sanctuary</span>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Host a New Experience</h2>
          <p className="text-[8px] text-slate-500 mt-2">Linking to your mobile: {user.phone}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <div className="space-y-1.5">
            <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Experience Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Midnight Zen Meditation"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-red transition-colors"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Category</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-red appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
              >
                <option value="Activity">Activity</option>
                <option value="Wellness">Wellness</option>
                <option value="Mindfulness">Mindfulness</option>
                <option value="Adventure">Adventure</option>
                <option value="Creative Arts">Creative Arts</option>
                <option value="Sports">Sports</option>
                <option value="Movie">Movie</option>
                <option value="Therapy">Therapy</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Energy Value (₹)</label>
              <input 
                required
                type="number" 
                placeholder="499"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-red transition-colors"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Visual Signature</label>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                imagePreview ? 'border-brand-red bg-slate-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {imagePreview ? (
                <div className="relative w-full h-full group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Recalibrate Image</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Upload Presence Image</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Description</label>
            <textarea 
              required
              rows={3}
              placeholder="Describe the frequency and resonance of this session..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-brand-red transition-colors resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Syncing...' : 'Initiate Resonance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TicketModal: React.FC<{ booking: Booking; onClose: () => void }> = ({ booking, onClose }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(booking.id)}&bgcolor=FFFFFF&color=0A0C10&margin=10`;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-[25%] -left-3 w-6 h-6 bg-slate-950 rounded-full z-10"></div>
        <div className="absolute top-[25%] -right-3 w-6 h-6 bg-slate-950 rounded-full z-10"></div>

        <div className="p-8 pb-12 bg-slate-900 text-white relative">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-500">Official Access</span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">ID: {booking.id.slice(0, 8)}</span>
          </div>
          <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-tight mb-2">{booking.eventTitle}</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{booking.category}</p>
        </div>

        <div className="px-8 -mt-3 relative z-10">
          <div className="border-t-2 border-dashed border-slate-100 w-full"></div>
        </div>

        <div className="p-8 pt-10 text-center">
          <div className="grid grid-cols-2 gap-8 text-left mb-10">
            <div>
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 block mb-1">Session Date</span>
              <p className="text-xs font-black text-slate-900">{booking.eventDate}</p>
            </div>
            <div>
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 block mb-1">Calibration Time</span>
              <p className="text-xs font-black text-slate-900">{booking.time}</p>
            </div>
            <div>
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 block mb-1">Bearer</span>
              <p className="text-xs font-black text-slate-900">{booking.userName || 'Frequency Guest'}</p>
            </div>
            <div>
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 block mb-1">Status</span>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Verified Aura</p>
            </div>
          </div>

          <div className="relative group mb-8">
            <div className="absolute -inset-2 bg-slate-100 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <img 
              src={qrUrl} 
              alt="Booking QR Code" 
              className="relative mx-auto w-40 h-40 rounded-2xl shadow-inner mix-blend-multiply"
            />
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] shadow-xl active:scale-95 transition-all"
          >
            Close Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

const RosterModal: React.FC<{ event: Event; bookings: Booking[]; onClose: () => void }> = ({ event, bookings, onClose }) => {
  return (
    <div className="fixed inset-0 z-[550] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        <div className="bg-slate-900 p-8 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-brand-red text-[8px] font-black uppercase tracking-[0.4em] mb-1 block">Resonance Roster</span>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter line-clamp-1">{event.title}</h2>
              <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-widest font-black">
                {bookings.length} Total Connections Established
              </p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide">
          {bookings.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] italic">No active resonance detected yet.</p>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="group bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-red/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg group-hover:bg-brand-red transition-colors">
                    {b.userName?.[0] || 'G'}
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-black italic uppercase tracking-tighter text-base leading-tight">
                      {b.userName || 'Frequency Guest'}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      Confirmed for {b.time} • {b.eventDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end md:self-center">
                  <a 
                    href={`https://wa.me/${b.userPhone}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    WhatsApp
                  </a>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    ID: {b.id.slice(0, 6)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user, events, bookings, onLogout, onOpenAdmin, onOpenPolicy, onRefreshEvents }) => {
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);
  const [viewingRosterFor, setViewingRosterFor] = useState<Event | null>(null);

  const hostedEvents = useMemo(() => {
    return events.filter(e => e.hostPhone === user.phone);
  }, [events, user.phone]);

  const handleDeleteHostedEvent = async (id: string) => {
    if (confirm("Decommissioning this experience will remove it from all public frequencies. Proceed?")) {
      await api.deleteEvent(id);
      onRefreshEvents?.();
    }
  };

  const getBookingsForEvent = (eventId: string) => {
    return bookings.filter(b => b.eventId === eventId);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-5 md:px-0 space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-brand-red text-[10px] font-black uppercase tracking-[0.4em]">Personal Sanctuary</span>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 leading-none">Namaste, {user.name}</h1>
          <p className="text-slate-400 font-medium italic">Connected: +91 {user.phone}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowHostModal(true)}
            className="px-6 py-3 bg-brand-red text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20 active:scale-95"
          >
            Host New
          </button>
          {user.role === 'admin' && onOpenAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Owner Console
            </button>
          )}
          <button 
            onClick={onLogout}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Hosted Sanctuary Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 italic flex items-center gap-3">
             <span className="w-8 h-px bg-brand-red"></span>
             Hosted Sanctuary
           </h2>
           <span className="text-[10px] font-bold text-slate-400 uppercase">{hostedEvents.length} Global Waves</span>
        </div>
        
        {hostedEvents.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
            <p className="text-slate-300 font-black uppercase tracking-widest text-[9px] mb-4">No hosted frequencies detected.</p>
            <button onClick={() => setShowHostModal(true)} className="text-brand-red text-[10px] font-black uppercase tracking-widest hover:underline transition-all">Start Your First Experience</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hostedEvents.map(event => {
              const eventBookings = getBookingsForEvent(event.id);
              return (
                <div key={event.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 group hover:border-brand-red/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-6 mb-6">
                      <div className="w-20 h-20 rounded-3xl overflow-hidden bg-slate-900 shrink-0 shadow-lg relative">
                          <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={event.title} />
                          <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                          <span className="text-brand-red text-[8px] font-black uppercase tracking-widest block mb-1.5">{event.category}</span>
                          <h4 className="text-slate-900 font-black italic uppercase tracking-tighter text-xl leading-tight truncate mb-2">{event.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest italic">{eventBookings.length} Active Connections</span>
                          </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4 pt-6 border-t border-slate-50">
                    <button 
                      onClick={() => setViewingRosterFor(event)}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform inline-block">View Roster</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteHostedEvent(event.id)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                      title="Decommission Experience"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bookings Timeline Section */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 italic">Experience Timeline</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sessions you have reserved</p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
        </div>
        <div className="divide-y divide-slate-50">
          {user.bookings.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">No active timeline detected.</p>
            </div>
          ) : (
            user.bookings.map((booking) => (
              <div key={booking.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/50 transition-all group gap-6">
                <div className="space-y-3">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${
                    booking.category === 'Adventure' ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                    booking.category === 'Activity' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                    booking.category === 'Wellness' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                    booking.category === 'Sports' ? 'bg-indigo-50 text-indigo-500 border border-indigo-100' :
                    'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}>
                    {booking.category}
                  </span>
                  <h3 className="text-2xl font-black italic text-slate-900 leading-none tracking-tighter uppercase group-hover:text-brand-red transition-colors">{booking.eventTitle}</h3>
                  <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                      {booking.time}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      {booking.eventDate}
                    </span>
                    <span className="text-slate-300">#{booking.id.slice(0, 8)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                   <button 
                    onClick={() => setSelectedTicket(booking)}
                    className="w-full md:w-auto px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 border-2 border-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-xl shadow-slate-200/50"
                   >
                    Access Ticket
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Profile Governance */}
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 overflow-hidden relative shadow-3xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/10 blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-6 max-w-sm">
            <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter leading-none">Governance & Resonance</h2>
            <p className="text-slate-400 text-xs italic font-medium leading-relaxed">
              Your profile is a private sanctuary. Manage your frequency, review platform protocols, or initiate new experiences for the community.
            </p>
            <div className="flex gap-6">
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Account Level</span>
                <p className="text-brand-lime text-xs font-black uppercase tracking-tighter">Prime Explorer</p>
              </div>
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Reputation</span>
                <p className="text-emerald-400 text-xs font-black uppercase tracking-tighter">Optimal Sync</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 h-fit">
            {[
              { id: 'terms', label: 'Terms' },
              { id: 'privacy', label: 'Privacy' },
              { id: 'refund', label: 'Refunds' },
              { id: 'shipping', label: 'Logistics' }
            ].map(policy => (
              <button 
                key={policy.id}
                onClick={() => onOpenPolicy?.(policy.id as PolicyType)}
                className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all text-center"
              >
                {policy.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showHostModal && (
        <CreateEventModal 
          user={user} 
          onClose={() => setShowHostModal(false)} 
          onSuccess={() => onRefreshEvents?.()} 
        />
      )}

      {selectedTicket && (
        <TicketModal 
          booking={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}

      {viewingRosterFor && (
        <RosterModal 
          event={viewingRosterFor}
          bookings={getBookingsForEvent(viewingRosterFor.id)}
          onClose={() => setViewingRosterFor(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
