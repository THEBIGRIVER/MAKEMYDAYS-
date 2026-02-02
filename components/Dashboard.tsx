
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { User, Booking, Event, Category, Slot } from '../types.ts';
import { PolicyType } from './LegalModal.tsx';
import { api } from '../services/api.ts';

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
  const [occurrenceType, setOccurrenceType] = useState<'single' | 'range'>('single');
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    category: 'Activity',
    price: 0,
    description: '',
    image: '',
    dates: [],
    slots: [{ time: '10:00', availableSeats: 20 }]
  });
  
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('url');
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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  const addSlot = () => {
    setFormData(prev => ({
      ...prev,
      slots: [...(prev.slots || []), { time: '12:00', availableSeats: 10 }]
    }));
  };

  const removeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots?.filter((_, i) => i !== index)
    }));
  };

  const updateSlot = (index: number, field: keyof Slot, value: string | number) => {
    setFormData(prev => {
      const newSlots = [...(prev.slots || [])];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return { ...prev, slots: newSlots };
    });
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDates: string[] = [];
    if (occurrenceType === 'single') {
      if (!singleDate) {
        alert("Please select a date for the event.");
        return;
      }
      finalDates = [formatDateLabel(singleDate)];
    } else {
      if (!startDate || !endDate) {
        alert("Please select a start and end date for the range.");
        return;
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        alert("End date must be after start date.");
        return;
      }
      let curr = new Date(start);
      while (curr <= end) {
        finalDates.push(formatDateLabel(curr.toISOString()));
        curr.setDate(curr.getDate() + 1);
      }
    }

    if (!formData.title || !formData.price || !formData.description || !formData.image || !finalDates.length || !formData.slots?.length) {
      alert("Please complete all sections to finalize the event.");
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
      dates: finalDates,
      hostPhone: user.phone,
      slots: occurrenceType === 'single' ? [formData.slots[0]] : formData.slots
    };

    await api.saveEvent(newEvent);
    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-[3.5rem] shadow-3xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 text-slate-200 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-brand-red text-[8px] font-black uppercase tracking-[0.4em] mb-2 block">Provider Portal</span>
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Event Experience</h2>
          </div>
          <button onClick={onClose} className="relative z-10 text-slate-400 hover:text-slate-200 transition-all transform hover:rotate-90">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Title</label>
              <input required type="text" placeholder="e.g. Midnight Forest Bathing" className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-200 outline-none focus:border-brand-red transition-all shadow-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
              <select className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-200 outline-none focus:border-brand-red transition-all" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as Category})}>
                <option value="Shows">Shows</option>
                <option value="Activity">Activity</option>
                <option value="MMD Originals">MMD Originals</option>
                <option value="Mindfulness">Mindfulness</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Temporal Cadence</label>
              <div className="flex bg-white/5 p-1 rounded-xl">
                 <button type="button" onClick={() => setOccurrenceType('single')} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${occurrenceType === 'single' ? 'bg-slate-200 text-slate-900 shadow-lg' : 'text-slate-400'}`}>Single Day</button>
                 <button type="button" onClick={() => setOccurrenceType('range')} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${occurrenceType === 'range' ? 'bg-slate-200 text-slate-900 shadow-lg' : 'text-slate-400'}`}>Date Range</button>
               </div>
            </div>

            {occurrenceType === 'single' ? (
              <div className="animate-in slide-in-from-left duration-500">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-2 px-1">Select Event Date</label>
                <input type="date" className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-200 outline-none focus:border-brand-red transition-all" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-1">Start Date</label>
                  <input type="date" className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-200 outline-none focus:border-brand-red transition-all" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-1">End Date</label>
                  <input type="date" className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-200 outline-none focus:border-brand-red transition-all" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{occurrenceType === 'single' ? 'Session Time' : 'Time Sequence Grid'}</label>
              {occurrenceType === 'range' && (
                <button type="button" onClick={addSlot} className="text-[9px] font-black uppercase tracking-widest text-brand-red hover:underline">+ Add Sequence</button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(occurrenceType === 'single' ? [formData.slots![0]] : formData.slots!).map((slot, index) => (
                <div key={index} className="flex items-center gap-3 animate-in slide-in-from-bottom duration-500">
                  <div className="flex-1 bg-slate-800/50 border-2 border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <input type="time" className="bg-transparent text-sm font-bold outline-none text-slate-200" value={slot.time} onChange={(e) => updateSlot(index, 'time', e.target.value)} />
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black text-slate-400 uppercase">Cap</span>
                       <input type="number" className="bg-slate-900 rounded-lg text-sm font-bold outline-none w-12 text-center py-1 text-slate-200" value={slot.availableSeats} onChange={(e) => updateSlot(index, 'availableSeats', Number(e.target.value))} />
                    </div>
                  </div>
                  {occurrenceType === 'range' && formData.slots!.length > 1 && (
                    <button type="button" onClick={() => removeSlot(index)} className="p-3 text-slate-500 hover:text-brand-red transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Energy Settlement (₹)</label>
            <input required type="number" className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-200 outline-none focus:border-brand-red transition-all" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Visual Aura</label>
               <div className="flex bg-white/5 p-1 rounded-xl">
                 <button type="button" onClick={() => setImageInputMode('url')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${imageInputMode === 'url' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-400'}`}>URL</button>
                 <button type="button" onClick={() => setImageInputMode('file')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${imageInputMode === 'file' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-400'}`}>Upload</button>
               </div>
            </div>

            {imageInputMode === 'url' ? (
              <input type="text" placeholder="https://images.unsplash.com/..." className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-200 outline-none focus:border-brand-red transition-all shadow-sm" value={formData.image} onChange={handleUrlChange} />
            ) : (
              <>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 bg-slate-800/50 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-brand-red/50 transition-all overflow-hidden relative group">
                   {imagePreview ? (
                     <div className="w-full h-full">
                       <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-slate-200 text-[8px] font-black uppercase tracking-widest bg-slate-900/50 px-3 py-1.5 rounded-full">Change Identity</span>
                       </div>
                     </div>
                   ) : (
                     <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Select Visual Identity</span>
                   )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Resonance Context (Description)</label>
            <textarea required rows={3} className="w-full bg-slate-800/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-200 outline-none focus:border-brand-red resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-slate-200 text-slate-900 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl hover:bg-brand-red hover:text-white transition-all active:scale-[0.98] disabled:opacity-50">
            {isSubmitting ? 'Establishing Connection...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user, events, bookings, onLogout, onOpenAdmin, onOpenPolicy, onRefreshEvents }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'hosting' | 'settings'>('bookings');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(user.preferences || { emailReminders: true, smsReminders: true });
  const [notifications, setNotifications] = useState<string[]>([]);

  const userEvents = useMemo(() => events.filter(e => e.hostPhone === user.phone), [events, user.phone]);
  const userBookings = useMemo(() => bookings.filter(b => b.userPhone === user.phone), [bookings, user.phone]);

  useEffect(() => {
    if (!localPreferences.emailReminders && !localPreferences.smsReminders) return;
    const checkUpcoming = () => {
      const now = new Date();
      userBookings.forEach(booking => {
        const bookedTime = new Date(booking.bookedAt).getTime();
        if (now.getTime() - bookedTime < 30000 && !booking.reminderSent) {
          const type = localPreferences.smsReminders ? 'SMS' : 'Email';
          const msg = `[MOCK ${type}]: Namaste ${user.name}! Your session "${booking.eventTitle}" is anchored for ${booking.eventDate}. See you there.`;
          setNotifications(prev => [...prev, msg]);
          booking.reminderSent = true; 
          setTimeout(() => { setNotifications(prev => prev.filter(n => n !== msg)); }, 6000);
        }
      });
    };
    const interval = setInterval(checkUpcoming, 10000);
    return () => clearInterval(interval);
  }, [userBookings, localPreferences, user.name]);

  const updatePreferences = (type: 'email' | 'sms') => {
    const nextPrefs = { ...localPreferences, [type === 'email' ? 'emailReminders' : 'smsReminders']: !localPreferences[type === 'email' ? 'emailReminders' : 'smsReminders'] };
    setLocalPreferences(nextPrefs);
    const updatedUser = { ...user, preferences: nextPrefs };
    localStorage.setItem('makemydays_user_session_v1', JSON.stringify(updatedUser));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
      <div className="fixed top-24 right-6 z-[600] space-y-3 pointer-events-none">
        {notifications.map((note, i) => (
          <div key={i} className="bg-slate-900 text-slate-200 p-4 rounded-2xl shadow-2xl border border-brand-red/30 animate-in slide-in-from-right duration-500 pointer-events-auto max-w-xs">
            <div className="flex items-center gap-3 mb-1"><div className="w-2 h-2 rounded-full bg-brand-red animate-ping"></div><span className="text-[8px] font-black uppercase tracking-widest text-brand-red">Automated Alert</span></div>
            <p className="text-[10px] font-bold italic leading-relaxed">{note}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/10">
        <div className="bg-slate-900/50 p-10 md:p-14 text-slate-200 relative border-b border-white/10 backdrop-blur-3xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <span className="text-brand-red text-[11px] font-black uppercase tracking-[0.4em] mb-3 block">Private Sanctuary</span>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-3 text-slate-200">Namaste, {user.name}</h2>
              <div className="flex items-center gap-4 text-slate-400"><span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 text-slate-400">+91 {user.phone}</span></div>
            </div>
            <button onClick={onLogout} className="px-8 py-4 bg-brand-red hover:bg-slate-200 hover:text-brand-red text-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">Disconnect</button>
          </div>
        </div>

        <div className="p-10 md:p-14">
          <div className="flex gap-8 mb-12 border-b border-white/10 pb-1 overflow-x-auto scrollbar-hide">
            {['bookings', 'hosting', 'settings'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-5 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-red rounded-full"></div>}
              </button>
            ))}
          </div>

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {userBookings.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-[3rem] border-2 border-dashed border-white/5"><p className="text-slate-500 text-[11px] font-black uppercase tracking-widest italic">No bookings found.</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userBookings.map((booking) => (
                    <div key={booking.id} className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-sm relative overflow-hidden group hover:border-white/20 transition-all hover:-translate-y-1">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2"><span className="text-brand-red text-[9px] font-black uppercase tracking-widest block">{booking.category}</span></div>
                        <h4 className="text-slate-200 font-black italic uppercase tracking-tight text-xl mb-3">{booking.eventTitle}</h4>
                        <div className="flex items-center gap-5 text-slate-400 text-[11px] font-bold"><span>{booking.eventDate}</span><span>{booking.time}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 glass-card p-8 rounded-[2.5rem] border border-white/10">
                <div className="max-w-md"><h3 className="text-xl font-black italic uppercase tracking-tight text-slate-100 mb-2">Host New Experience</h3><p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Host your unique event frequency to the community.</p></div>
                <button onClick={() => setShowCreateModal(true)} className="bg-slate-200 text-slate-900 px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-red hover:text-slate-200 transition-all">Create Event</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {userEvents.map(event => (
                  <div key={event.id} className="glass-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-sm group hover:border-white/20 transition-all hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden"><img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div></div>
                    <div className="p-8"><h4 className="text-slate-200 font-black italic uppercase tracking-tight text-xl mb-4">{event.title}</h4><button className="w-full py-4 bg-slate-800 hover:bg-brand-red text-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg" onClick={async () => { if (confirm("Terminate this event?")) { await api.deleteEvent(event.id); onRefreshEvents?.(); } }}>Terminate</button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <section className="space-y-8">
                 <div className="border-b border-white/10 pb-4"><h3 className="text-xl font-black italic uppercase tracking-tight text-slate-100">Resonance Settings</h3></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                       <div className="space-y-1"><h4 className="text-sm font-black italic text-slate-100 uppercase">SMS Notifications</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">+91 {user.phone}</p></div>
                       <button onClick={() => updatePreferences('sms')} className={`w-14 h-8 rounded-full transition-all relative ${localPreferences.smsReminders ? 'bg-brand-red' : 'bg-white/10'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${localPreferences.smsReminders ? 'left-7' : 'left-1'}`}></div></button>
                    </div>
                 </div>
              </section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['terms', 'privacy', 'refund', 'shipping'].map(policy => (
                  <button key={policy} onClick={() => onOpenPolicy?.(policy as PolicyType)} className="glass-card border border-white/5 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-brand-red hover:text-brand-red transition-all text-center">{policy}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showCreateModal && <CreateEventModal user={user} onClose={() => setShowCreateModal(false)} onSuccess={() => { onRefreshEvents?.(); }} />}
    </div>
  );
};

export default Dashboard;
