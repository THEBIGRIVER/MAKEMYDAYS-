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
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    category: 'Activity',
    price: 0,
    description: '',
    image: '',
    dates: [],
    slots: [{ time: '10:00', availableSeats: 20 }]
  });
  const [newDateInput, setNewDateInput] = useState('');
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

  const addDate = () => {
    if (!newDateInput) return;
    const dateObj = new Date(newDateInput);
    const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (formData.dates?.includes(formattedDate)) {
      alert("This date is already anchored.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      dates: [...(prev.dates || []), formattedDate]
    }));
    setNewDateInput('');
  };

  const removeDate = (dateToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates?.filter(d => d !== dateToRemove)
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.description || !formData.image || !formData.dates?.length || !formData.slots?.length) {
      alert("Please complete all sections to finalize the broadcast.");
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
      dates: formData.dates || [],
      hostPhone: user.phone,
      slots: formData.slots || []
    };

    await api.saveEvent(newEvent);
    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-brand-red text-[8px] font-black uppercase tracking-[0.4em] mb-2 block">Provider Portal</span>
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Broadcast Experience</h2>
          </div>
          <button onClick={onClose} className="relative z-10 text-slate-400 hover:text-white transition-all transform hover:rotate-90">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Midnight Forest Bathing"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-red transition-all shadow-sm"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-red transition-all"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
              >
                <option value="Shows">Shows</option>
                <option value="Activity">Activity</option>
                <option value="Therapy">Therapy</option>
                <option value="Mindfulness">Mindfulness</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Temporal Anchors (Select Dates)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.dates?.map(date => (
                <div key={date} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic animate-in zoom-in duration-300">
                  {date}
                  <button type="button" onClick={() => removeDate(date)} className="text-white/40 hover:text-brand-red transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="date" 
                className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 text-sm font-bold outline-none focus:border-brand-red transition-all"
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
              />
              <button 
                type="button" 
                onClick={addDate}
                className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Add Link
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Time Sequence Grid</label>
              <button 
                type="button" 
                onClick={addSlot}
                className="text-[9px] font-black uppercase tracking-widest text-brand-red hover:underline"
              >
                + Add Sequence
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.slots?.map((slot, index) => (
                <div key={index} className="flex items-center gap-3 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <input 
                      type="time" 
                      className="bg-transparent text-sm font-bold outline-none text-slate-900"
                      value={slot.time}
                      onChange={(e) => updateSlot(index, 'time', e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black text-slate-300 uppercase">Cap</span>
                       <input 
                         type="number" 
                         className="bg-slate-50 rounded-lg text-sm font-bold outline-none w-12 text-center py-1"
                         value={slot.availableSeats}
                         onChange={(e) => updateSlot(index, 'availableSeats', Number(e.target.value))}
                       />
                    </div>
                  </div>
                  {formData.slots && formData.slots.length > 1 && (
                    <button type="button" onClick={() => removeSlot(index)} className="p-3 text-slate-300 hover:text-brand-red transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Energy Settlement (₹)</label>
            <input 
              required
              type="number" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-red transition-all"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Visual Aura</label>
               <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button 
                  type="button" 
                  onClick={() => setImageInputMode('url')}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${imageInputMode === 'url' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                 >
                   URL
                 </button>
                 <button 
                  type="button" 
                  onClick={() => setImageInputMode('file')}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${imageInputMode === 'file' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                 >
                   Upload
                 </button>
               </div>
            </div>

            {imageInputMode === 'url' ? (
              <input 
                type="text" 
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-red transition-all shadow-sm"
                value={formData.image}
                onChange={handleUrlChange}
              />
            ) : (
              <>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center cursor-pointer hover:border-brand-red/50 transition-all overflow-hidden relative group">
                   {imagePreview ? (
                     <div className="w-full h-full">
                       <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[8px] font-black uppercase tracking-widest bg-slate-900/50 px-3 py-1.5 rounded-full">Change Identity</span>
                       </div>
                     </div>
                   ) : (
                     <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Select Visual Identity</span>
                   )}
                </div>
              </>
            )}

            {imageInputMode === 'url' && imagePreview && (
              <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-100 animate-in fade-in duration-500">
                <img src={imagePreview} className="w-full h-full object-cover" alt="URL Preview" onError={() => setImagePreview(null)} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Resonance Context (Description)</label>
            <textarea 
              required
              rows={3}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-red resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl hover:bg-brand-red transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Establishing Connection...' : 'Initiate Broadcast'}
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

  // Automated Reminder Simulation Logic
  useEffect(() => {
    if (!localPreferences.emailReminders && !localPreferences.smsReminders) return;

    const checkUpcoming = () => {
      const now = new Date();
      userBookings.forEach(booking => {
        // Simple mock check: if bookedAt is within the last 30 seconds, simulate an immediate confirmation reminder
        const bookedTime = new Date(booking.bookedAt).getTime();
        if (now.getTime() - bookedTime < 30000 && !booking.reminderSent) {
          const type = localPreferences.smsReminders ? 'SMS' : 'Email';
          const msg = `[MOCK ${type}]: Namaste ${user.name}! Your session "${booking.eventTitle}" is anchored for ${booking.eventDate}. See you there.`;
          
          setNotifications(prev => [...prev, msg]);
          booking.reminderSent = true; // Mutate locally for mock purposes
          
          // Clear notification after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n !== msg));
          }, 6000);
        }
      });
    };

    const interval = setInterval(checkUpcoming, 10000);
    return () => clearInterval(interval);
  }, [userBookings, localPreferences, user.name]);

  const updatePreferences = (type: 'email' | 'sms') => {
    const nextPrefs = {
      ...localPreferences,
      [type === 'email' ? 'emailReminders' : 'smsReminders']: !localPreferences[type === 'email' ? 'emailReminders' : 'smsReminders']
    };
    setLocalPreferences(nextPrefs);
    
    // In a real app, this would persist to the backend
    const updatedUser = { ...user, preferences: nextPrefs };
    localStorage.setItem('makemydays_user_v1', JSON.stringify(updatedUser));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
      {/* Automated Reminder Toasts */}
      <div className="fixed top-24 right-6 z-[600] space-y-3 pointer-events-none">
        {notifications.map((note, i) => (
          <div key={i} className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-brand-red/30 animate-in slide-in-from-right duration-500 pointer-events-auto max-w-xs">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-brand-red animate-ping"></div>
              <span className="text-[8px] font-black uppercase tracking-widest text-brand-red">Automated Alert</span>
            </div>
            <p className="text-[10px] font-bold italic leading-relaxed">{note}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/40">
        <div className="bg-slate-900 p-10 md:p-14 text-white relative">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <span className="text-brand-red text-[11px] font-black uppercase tracking-[0.4em] mb-3 block">Private Sanctuary</span>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-3">Namaste, {user.name}</h2>
              <div className="flex items-center gap-4 text-slate-400">
                 <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">+91 {user.phone}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={onLogout}
                className="px-8 py-4 bg-brand-red hover:bg-white hover:text-brand-red text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        <div className="p-10 md:p-14">
          <div className="flex gap-8 mb-12 border-b border-slate-100 pb-1 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`pb-5 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === 'bookings' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
            >
              Recent Bookings
              {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-red rounded-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('hosting')}
              className={`pb-5 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === 'hosting' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
            >
              My Broadcasts
              {activeTab === 'hosting' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-red rounded-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`pb-5 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === 'settings' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
            >
              Governance
              {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-red rounded-full"></div>}
            </button>
          </div>

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {userBookings.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-300 text-[11px] font-black uppercase tracking-widest italic">No bookings found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userBookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-brand-red text-[9px] font-black uppercase tracking-widest block">{booking.category}</span>
                           {localPreferences.smsReminders || localPreferences.emailReminders ? (
                             <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Reminders Synced</span>
                             </div>
                           ) : null}
                        </div>
                        <h4 className="text-slate-900 font-black italic uppercase tracking-tight text-xl mb-3">{booking.eventTitle}</h4>
                        <div className="flex items-center gap-5 text-slate-400 text-[11px] font-bold">
                          <span>{booking.eventDate}</span>
                          <span>{booking.time}</span>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-50 text-[9px] font-black text-slate-400 uppercase italic flex justify-between">
                        <span>Ref: #{booking.id.split('-').pop()}</span>
                        {booking.reminderSent && <span className="text-emerald-500">Alert Dispatched</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                <div className="max-w-md">
                   <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900 mb-2">Host New Experience</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Broadcast your unique frequency to the community.</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-red transition-all"
                >
                  Create Broadcast
                </button>
              </div>

              {userEvents.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-300 text-[11px] font-black uppercase tracking-widest italic">No active broadcasts found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {userEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm group">
                      <div className="relative h-48 overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-6 left-8">
                          <span className="bg-brand-red text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full mb-2 block w-fit shadow-lg">{event.category}</span>
                          <h4 className="text-white font-black italic uppercase tracking-tight text-xl">{event.title}</h4>
                        </div>
                      </div>
                      <div className="p-8">
                         <div className="flex justify-between items-center mb-6">
                            <span className="text-2xl font-black italic text-slate-900">₹{event.price}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{event.dates.length} Dates Live</span>
                         </div>
                         <button 
                            className="w-full py-4 bg-slate-900 hover:bg-brand-red text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                            onClick={async () => {
                              if (confirm("Terminate this broadcast?")) {
                                await api.deleteEvent(event.id);
                                onRefreshEvents?.();
                              }
                            }}
                         >
                            Terminate
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <section className="space-y-8">
                 <div className="border-b border-slate-100 pb-4">
                   <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Resonance Settings</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">How we communicate with your profile</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                       <div className="space-y-1">
                          <h4 className="text-sm font-black italic text-slate-900 uppercase">SMS Notifications</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Urgent temporal updates via +91 {user.phone}</p>
                       </div>
                       <button 
                         onClick={() => updatePreferences('sms')}
                         className={`w-14 h-8 rounded-full transition-all relative ${localPreferences.smsReminders ? 'bg-brand-red' : 'bg-slate-200'}`}
                       >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${localPreferences.smsReminders ? 'left-7' : 'left-1'}`}></div>
                       </button>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                       <div className="space-y-1">
                          <h4 className="text-sm font-black italic text-slate-900 uppercase">Email Sync</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Detailed resonance reports and receipts</p>
                       </div>
                       <button 
                         onClick={() => updatePreferences('email')}
                         className={`w-14 h-8 rounded-full transition-all relative ${localPreferences.emailReminders ? 'bg-brand-red' : 'bg-slate-200'}`}
                       >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${localPreferences.emailReminders ? 'left-7' : 'left-1'}`}></div>
                       </button>
                    </div>
                 </div>
              </section>

              <section className="space-y-6">
                 <div className="border-b border-slate-100 pb-4">
                   <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Governance Protocol</h3>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['terms', 'privacy', 'refund', 'shipping'].map(policy => (
                      <button 
                        key={policy}
                        onClick={() => onOpenPolicy?.(policy as PolicyType)}
                        className="bg-white border-2 border-slate-100 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-brand-red hover:text-brand-red transition-all text-center"
                      >
                        {policy}
                      </button>
                    ))}
                 </div>
              </section>

              {user.role === 'admin' && (
                <button 
                  onClick={onOpenAdmin}
                  className="w-full py-6 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-900 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] transition-all"
                >
                  Access Superuser Hub
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateEventModal 
          user={user} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => { onRefreshEvents?.(); }} 
        />
      )}
    </div>
  );
};

export default Dashboard;