import React, { useState, useRef, useMemo } from 'react';
import { Booking, Event, Category, User, Slot } from '../types.ts';
import { PolicyType } from './LegalModal.tsx';
import { api } from '../services/api.ts';
import { auth } from '../services/firebase.ts';
import { signOut } from 'firebase/auth';

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(base64Str), 5000);
    const img = new Image();
    img.src = base64Str;
    img.onerror = () => { clearTimeout(timeout); resolve(base64Str); };
    img.onload = () => {
      clearTimeout(timeout);
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
      else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

const CreateEventModal: React.FC<{ userUid: string, onClose: () => void, onSuccess: () => void }> = ({ userUid, onClose, onSuccess }) => {
  const [isSuccessfullyLaunched, setIsSuccessfullyLaunched] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    category: 'Activity',
    price: 0,
    capacity: 0,
    description: '',
    image: '',
    hostPhone: localStorage.getItem('mmd_host_phone') || '',
  });
  
  const [dates, setDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState('');
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [newSlotCapacity, setNewSlotCapacity] = useState<number | ''>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeHostPhone = (phone: string): string => {
    let cleaned = phone.toString().replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return cleaned.substring(1);
    }
    return cleaned;
  };

  const handleAddDate = () => {
    if (!newDate) return;
    const dateObj = new Date(newDate);
    const formatted = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!dates.includes(formatted)) {
      setDates([...dates, formatted].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()));
    }
    setNewDate('');
  };

  const removeDate = (dateToRemove: string) => {
    setDates(dates.filter(d => d !== dateToRemove));
  };

  const handleAddSlot = () => {
    if (!newSlotTime || !newSlotCapacity || Number(newSlotCapacity) <= 0) {
      alert("Please choose a valid time and capacity (at least 1 spot).");
      return;
    }
    const [hours, minutes] = newSlotTime.split(':');
    const h = parseInt(hours);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const timeString = `${displayH.toString().padStart(2, '0')}:${minutes} ${suffix}`;
    
    if (!slots.find(s => s.time === timeString)) {
      setSlots([...slots, { time: timeString, availableSeats: Number(newSlotCapacity) }]);
      setNewSlotCapacity('');
    } else {
      alert("This time slot already exists.");
    }
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const compressed = await compressImage(base64String);
        setImagePreview(compressed);
        setFormData(prev => ({ ...prev, image: compressed }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = normalizeHostPhone(formData.hostPhone || '');
    
    if (!formData.title) { alert("Title required."); return; }
    if (dates.length === 0) { alert("Add at least one Date."); return; }
    if (slots.length === 0) { alert("Add at least one Time Slot."); return; }
    if (cleanPhone.length !== 10) { alert("10-digit mobile required."); return; }
    if (!formData.image) { alert("Image Aura required."); return; }

    setIsSubmitting(true);
    try {
      const newEvent: Event = {
        id: `user-event-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title || '',
        category: formData.category as Category || 'Activity',
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        description: formData.description || '',
        image: formData.image || '',
        dates: dates,
        hostPhone: cleanPhone,
        slots: slots,
        createdAt: new Date().toISOString(),
        ownerUid: userUid
      };
      await api.saveEvent(newEvent, userUid);
      localStorage.setItem('mmd_host_phone', cleanPhone);
      setIsSuccessfullyLaunched(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2500);
    } catch (err: any) {
      alert(`Launch disrupted: ${err.message || "Access denied."}`);
    } finally { setIsSubmitting(false); }
  };

  if (isSuccessfullyLaunched) {
    return (
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl"></div>
        <div className="relative text-center space-y-6 animate-in zoom-in-95 duration-700">
           <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-moss rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
           </div>
           <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-slate-100">Broadcasting...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-slate-900 h-[95vh] md:h-auto rounded-t-[2.5rem] md:rounded-[3.5rem] shadow-3xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 pb-[env(safe-area-inset-bottom)]">
        <div className="p-6 flex justify-between items-center border-b border-white/5 bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black italic uppercase text-slate-200 leading-tight">Launch Node</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto h-[calc(95vh-80px)] md:max-h-[75vh] scrollbar-hide">
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Core Frequency</p>
            <input required placeholder="Title" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
              <option value="Activity">Activity</option><option value="Shows">Shows</option><option value="Mindfulness">Mindfulness</option><option value="Workshop">Workshop</option><option value="MMD Originals">MMD Originals</option>
            </select>
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Dates</p>
            <div className="flex gap-3">
              <input type="date" className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base" value={newDate} onChange={e => setNewDate(e.target.value)} />
              <button type="button" onClick={handleAddDate} className="px-6 bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px]">Add</button>
            </div>
            {dates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dates.map(d => (
                  <div key={d} className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-300">{d}</span>
                    <button type="button" onClick={() => removeDate(d)} className="text-slate-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Slots</p>
            <div className="grid grid-cols-3 gap-2">
              <input type="time" className="bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-sm" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} />
              <input type="number" placeholder="Cap" className="bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-sm" value={newSlotCapacity} onChange={e => setNewSlotCapacity(e.target.value === '' ? '' : Number(e.target.value))} />
              <button type="button" onClick={handleAddSlot} className="bg-slate-800 text-white rounded-2xl font-black uppercase text-[9px]">Add</button>
            </div>
            {slots.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-xs font-black text-slate-100 italic">{s.time} ({s.availableSeats})</span>
                <button type="button" onClick={() => removeSlot(i)} className="text-slate-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Contact & Exchange</p>
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" placeholder="₹ Price" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : Number(e.target.value)})} />
              <input required type="number" placeholder="Capacity" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base" value={formData.capacity === 0 ? '' : formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value === '' ? 0 : Number(e.target.value)})} />
            </div>
            <input required type="tel" placeholder="WhatsApp (10 digits)" className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 font-bold text-base" value={formData.hostPhone} onChange={e => setFormData({...formData, hostPhone: e.target.value})} />
          </div>

          <div className="space-y-4 pb-12">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Aura</p>
            <div onClick={() => !isSubmitting && fileInputRef.current?.click()} className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <p className="text-slate-500 font-black uppercase text-[9px]">Tap to upload Visual Aura</p>
              )}
            </div>
            <textarea required placeholder="Experience Narrative..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-[0.98] transition-all disabled:opacity-50">
              {isSubmitting ? "Launching..." : "Broadcast Node"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RatingStars: React.FC<{ rating?: number, onRate: (rating: number) => void, disabled?: boolean }> = ({ rating = 0, onRate, disabled }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRate(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          className={`transition-all ${disabled ? 'cursor-default' : 'cursor-pointer active:scale-90'}`}
        >
          <svg className={`w-5 h-5 ${(hover || rating) >= star ? 'text-brand-gold fill-current' : 'text-slate-600'}`} viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

interface DashboardProps {
  events: Event[];
  bookings: Booking[];
  currentUser: User | null;
  initialTab?: 'bookings' | 'hosting' | 'settings';
  onOpenPolicy?: (policy: PolicyType) => void;
  onRefreshEvents?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ events, bookings, currentUser, initialTab, onOpenPolicy, onRefreshEvents }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'hosting' | 'settings'>(initialTab || 'bookings');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRatingLoading, setIsRatingLoading] = useState<string | null>(null);
  
  const userName = currentUser?.name || 'Explorer';
  const myEvents = useMemo(() => events.filter(e => e.ownerUid === currentUser?.uid), [events, currentUser]);

  const handleLogout = async () => {
    try { await signOut(auth); window.location.reload(); } catch (err) { console.error("Logout failed:", err); }
  };

  const handleRate = async (booking: Booking, rating: number) => {
    if (isRatingLoading || booking.rating) return;
    setIsRatingLoading(booking.id);
    try {
      await api.submitRating(booking.id, booking.eventId, rating);
      onRefreshEvents?.();
    } catch {
      alert("Calibration failed.");
    } finally {
      setIsRatingLoading(null);
    }
  };

  const isCompleted = (eventDate: string) => {
    const d = new Date(eventDate);
    return !isNaN(d.getTime()) && d < new Date();
  };

  const connectToHost = (booking: Booking) => {
    if (!booking.hostPhone) { alert("Host contact missing."); return; }
    let phone = booking.hostPhone.toString().replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    const message = `Hi, I booked '${booking.eventTitle}' on ${booking.eventDate}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="pb-10">
      <div className="glass-card rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 bg-slate-900/40 min-h-[70vh] pb-[env(safe-area-inset-bottom)]">
        <div className="p-6 md:p-14 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center">
           <div className="text-center md:text-left">
             <span className="text-brand-moss text-[9px] font-black uppercase tracking-[0.3em] mb-1 block">Sanctuary</span>
             <h2 className="text-2xl md:text-6xl font-black italic uppercase text-slate-100 leading-tight">Namaste, {userName.split(' ')[0]}</h2>
           </div>
           <button onClick={handleLogout} className="px-6 py-3 border border-white/10 rounded-xl text-[9px] font-black uppercase text-slate-400 active:scale-95 transition-all">Disconnect</button>
        </div>
        <div className="p-4 md:p-14">
          <div className="flex gap-6 mb-8 border-b border-white/5 overflow-x-auto scrollbar-hide">
            {['bookings', 'hosting', 'settings'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-[10px] md:text-[12px] font-black uppercase tracking-widest relative whitespace-nowrap ${activeTab === tab ? 'text-slate-100' : 'text-slate-500'}`}>
                {tab} {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-moss rounded-full"></div>}
              </button>
            ))}
          </div>

          {activeTab === 'bookings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-50">
                  <p className="font-black italic uppercase text-[10px] tracking-widest">No active frequencies.</p>
                </div>
              ) :
                bookings.map((b) => {
                  const completed = isCompleted(b.eventDate);
                  return (
                    <div key={b.id} className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-full min-h-[160px]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <span className="text-brand-moss text-[7px] font-black uppercase">{b.category}</span>
                          <h4 className="text-slate-100 font-black italic text-sm mt-0.5 line-clamp-1">{b.eventTitle}</h4>
                          <p className="text-slate-500 text-[8px] uppercase font-bold mt-1">{b.eventDate} @ {b.time}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${completed ? 'bg-brand-moss/20 text-brand-moss' : 'bg-slate-800 text-slate-500'}`}>
                           {completed ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg>}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {completed ? (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                            <span className="text-[7px] font-black uppercase text-slate-500">Rate Resonance</span>
                            {isRatingLoading === b.id ? <div className="w-3 h-3 border-2 border-brand-moss border-t-transparent rounded-full animate-spin"></div> : <RatingStars rating={b.rating} onRate={(r) => handleRate(b, r)} disabled={!!b.rating} />}
                          </div>
                        ) : (
                          <button onClick={() => connectToHost(b)} className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">WhatsApp Host</button>
                        )}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-6">
              <div className="p-5 md:p-8 rounded-2xl border border-brand-moss/20 bg-brand-moss/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-sm md:text-xl font-black italic text-slate-100 uppercase leading-none">Broadcast Node</h3>
                  <p className="text-slate-500 text-[8px] uppercase mt-1 font-bold">Add your frequency to the global discovery stream.</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto bg-white text-slate-900 px-6 py-3 rounded-xl font-black uppercase text-[10px] active:scale-95 transition-all">Launch</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myEvents.map(e => (
                  <div key={e.id} className="glass-card rounded-2xl overflow-hidden border border-white/10 flex items-center p-3 gap-3">
                    <img src={e.image} className="w-16 h-16 rounded-lg object-cover" alt={e.title} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-100 font-bold italic text-xs truncate uppercase">{e.title}</h4>
                      <p className="text-[7px] text-slate-500 uppercase font-black">{e.dates.length} Days Scheduled</p>
                    </div>
                    <button className="text-red-500 p-2" onClick={async () => { if(confirm("Terminate broadcast?")){ await api.deleteEvent(e.id, currentUser?.uid || ''); onRefreshEvents?.(); } }}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5"/></svg></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-2 gap-3">
              {['Terms', 'Privacy', 'Refund'].map(p => (
                <button key={p} className="glass-card p-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95 transition-all" onClick={() => onOpenPolicy?.(p.toLowerCase() as any)}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {showCreateModal && currentUser && <CreateEventModal userUid={currentUser.uid} onClose={() => setShowCreateModal(false)} onSuccess={() => onRefreshEvents?.()} />}
    </div>
  );
};

export default Dashboard;