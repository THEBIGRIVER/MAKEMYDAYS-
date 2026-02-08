
import React, { useState, useRef, useMemo } from 'react';
import { Booking, Event, Category, User, Slot } from '../types.ts';
import { PolicyType } from './LegalModal.tsx';
import { api } from '../services/api.ts';
import { auth } from '../services/firebase.ts';
// Fixed: Changed from 'firebase/auth' to '@firebase/auth' to resolve export resolution issues in TypeScript
import { signOut } from '@firebase/auth';

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
    description: '',
    image: '',
    hostPhone: localStorage.getItem('mmd_host_phone') || '',
  });
  
  const [dates, setDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState('');
  
  const [slots, setSlots] = useState<Slot[]>([{ time: '10:00 AM', availableSeats: 20 }]);
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [newSlotCapacity, setNewSlotCapacity] = useState(20);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Fixed: Added const to the declaration of fileInputRef to resolve "Cannot find name 'fileInputRef'" error.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeHostPhone = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return cleaned.substring(1);
    }
    return cleaned;
  };

  const handleAddDate = () => {
    if (!newDate) return;
    const formatted = new Date(newDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!dates.includes(formatted)) {
      setDates([...dates, formatted]);
    }
    setNewDate('');
  };

  const removeDate = (dateToRemove: string) => {
    setDates(dates.filter(d => d !== dateToRemove));
  };

  const handleAddSlot = () => {
    if (!newSlotTime) return;
    const [hours, minutes] = newSlotTime.split(':');
    const h = parseInt(hours);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const timeString = `${displayH.toString().padStart(2, '0')}:${minutes} ${suffix}`;
    
    if (!slots.find(s => s.time === timeString)) {
      setSlots([...slots, { time: timeString, availableSeats: newSlotCapacity }]);
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
    const isPriceValid = formData.price !== undefined && !isNaN(Number(formData.price));
    
    if (!formData.title) { alert("Experience Title required."); return; }
    if (dates.length === 0) { alert("Add at least one available Date."); return; }
    if (slots.length === 0) { alert("Add at least one Time Slot."); return; }
    if (!isPriceValid) { alert("Enter a valid price."); return; }
    if (cleanPhone.length < 10) { alert("10-digit WhatsApp number required."); return; }
    if (!formData.image) { alert("Image Aura required."); return; }

    setIsSubmitting(true);
    try {
      const newEvent: Event = {
        id: `user-event-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title || '',
        category: formData.category as Category || 'Activity',
        price: Number(formData.price),
        description: formData.description || '',
        image: formData.image || '',
        dates: dates,
        hostPhone: cleanPhone,
        slots: slots,
        createdAt: new Date().toISOString()
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
           <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-red rounded-full flex items-center justify-center mx-auto shadow-2xl animate-music-pulse">
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
      <div className="relative w-full max-w-2xl bg-slate-900 h-[92vh] md:h-auto rounded-t-[2.5rem] md:rounded-[3.5rem] shadow-3xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-500 md:zoom-in-95">
        <div className="p-6 md:p-10 flex justify-between items-center bg-slate-900 border-b border-white/5 sticky top-0 z-10">
          <h2 className="text-xl md:text-2xl font-black italic uppercase text-slate-200">Launch Frequency</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 transition-colors"><svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 overflow-y-auto h-[calc(92vh-80px)] md:max-h-[75vh] scrollbar-hide">
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Core Frequency</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Experience Title" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base outline-none focus:border-brand-red transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base outline-none focus:border-brand-red transition-all appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                <option value="Activity">Activity</option><option value="Shows">Shows</option><option value="Mindfulness">Mindfulness</option><option value="Workshop">Workshop</option><option value="MMD Originals">MMD Originals</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Temporal Alignment (Dates)</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="date" className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base outline-none focus:border-brand-red transition-all" value={newDate} onChange={e => setNewDate(e.target.value)} />
              <button type="button" onClick={handleAddDate} className="px-6 py-4 sm:py-0 bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-brand-red active:scale-95 transition-all">Add Date</button>
            </div>
            {dates.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {dates.map(d => (
                  <div key={d} className="bg-white/10 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 transition-all hover:border-brand-red">
                    <span className="text-[9px] font-bold text-slate-300">{d}</span>
                    <button type="button" onClick={() => removeDate(d)} className="text-slate-500 hover:text-brand-red p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Capacity Channels (Slots)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="time" className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base outline-none focus:border-brand-red transition-all" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} />
              <input type="number" placeholder="Seats" className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base outline-none focus:border-brand-red transition-all" value={newSlotCapacity} onChange={e => setNewSlotCapacity(Number(e.target.value))} />
              <button type="button" onClick={handleAddSlot} className="bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] py-4 sm:py-0 hover:bg-brand-red active:scale-95 transition-all">Add Slot</button>
            </div>
            {slots.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {slots.map((s, i) => (
                  <div key={i} className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all hover:border-brand-accent">
                    <div>
                      <p className="text-[10px] font-black text-slate-100 italic uppercase">{s.time}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{s.availableSeats} Seats</p>
                    </div>
                    <button type="button" onClick={() => removeSlot(i)} className="text-slate-500 hover:text-brand-red p-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Contact & Exchange (WhatsApp for Direct Connection)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="number" placeholder="Price (₹)" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base outline-none focus:border-brand-red transition-all" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : Number(e.target.value)})} />
              <input required type="tel" placeholder="Host WhatsApp Number" className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 font-bold text-base outline-none focus:border-emerald-400 transition-all" value={formData.hostPhone} onChange={e => setFormData({...formData, hostPhone: e.target.value})} />
            </div>
            <p className="text-[8px] text-slate-500 font-medium italic">Your number allows bookers to connect with you directly after their anchor is confirmed.</p>
          </div>

          <div className="space-y-4 pb-10">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Aura & Narrative</p>
            <div onClick={() => !isSubmitting && fileInputRef.current?.click()} className="w-full h-44 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-brand-red transition-all relative overflow-hidden group">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              {imagePreview ? (
                <div className="w-full h-full relative">
                  <img src={imagePreview} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Swap Aura</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-slate-500 font-black uppercase text-[10px]">Upload Visual Aura</p>
                  <p className="text-slate-600 text-[8px] mt-1 font-bold italic tracking-wider">TAP TO SELECT</p>
                </div>
              )}
            </div>
            <textarea required placeholder="Narrative... What happens here?" rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base resize-none outline-none focus:border-brand-red transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <button type="submit" disabled={isSubmitting} className="w-full py-5 md:py-6 bg-slate-200 text-slate-900 rounded-2xl md:rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-brand-red hover:text-white active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl">
              {isSubmitting ? "Broadcasting..." : "Launch Experience"}
            </button>
          </div>
        </form>
      </div>
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
  const userName = currentUser?.name || 'Explorer';
  const myEvents = useMemo(() => events.filter(e => e.ownerUid === currentUser?.uid), [events, currentUser]);

  const handleLogout = async () => {
    try { await signOut(auth); window.location.reload(); } catch (err) { console.error("Logout failed:", err); }
  };

  const connectToHost = (booking: Booking) => {
    if (!booking.hostPhone) {
      alert("Host contact details are not available for this legacy booking.");
      return;
    }
    const message = `Hi, I have booked your experience '${booking.eventTitle}' on ${booking.eventDate} via MAKEMYDAYS. Looking forward to it!`;
    const url = `https://wa.me/${booking.hostPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
      <div className="glass-card rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/10 bg-slate-900/40 backdrop-blur-3xl min-h-[70vh]">
        <div className="p-8 md:p-14 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left">
           <div>
             <span className="text-brand-red text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Personal Sanctuary</span>
             <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-100 leading-none">Namaste, <br className="sm:hidden" />{userName.split(' ')[0]}</h2>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full md:w-auto bg-white/5 border border-white/10 px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-brand-red hover:text-white transition-all shadow-xl"
           >
             Disconnect Node
           </button>
        </div>
        <div className="p-6 md:p-14">
          <div className="flex gap-6 md:gap-8 mb-10 md:mb-12 border-b border-white/5 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {['bookings', 'hosting', 'settings'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-5 text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-slate-100' : 'text-slate-500 hover:text-slate-200'}`}>
                {tab} {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-red rounded-full"></div>}
              </button>
            ))}
          </div>

          {activeTab === 'bookings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {bookings.length === 0 ? (
                <div className="col-span-2 py-20 text-center space-y-3">
                  <p className="text-slate-600 font-black italic uppercase text-xs tracking-widest leading-loose">No anchored frequencies found.</p>
                  <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-brand-red text-[10px] font-black uppercase underline tracking-widest">Explore Discovery Feed</button>
                </div>
              ) :
                bookings.map((b) => (
                  <div key={b.id} className="glass-card p-5 md:p-6 rounded-[2rem] border border-white/10 group hover:border-brand-red/30 transition-all flex flex-col justify-between h-full min-h-[220px]">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <span className="text-brand-red text-[8px] font-black uppercase tracking-widest">{b.category}</span>
                        <h4 className="text-slate-100 font-black italic text-base md:text-lg leading-tight mt-1 group-hover:text-brand-red transition-colors line-clamp-2">{b.eventTitle}</h4>
                        <p className="text-slate-500 text-[9px] uppercase font-bold mt-2 tracking-wider">{b.eventDate} <span className="text-white/20 px-1">•</span> {b.time}</p>
                      </div>
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                         <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-2">
                       <button 
                        onClick={() => connectToHost(b)}
                        className="w-full py-4 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.555 4.197 1.608 6.044L0 24l6.102-1.601a11.81 11.81 0 005.94 1.595h.005c6.635 0 12.045-5.41 12.05-12.048a11.82 11.82 0 00-3.582-8.52"/>
                        </svg>
                        Connect via WhatsApp
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-brand-accent/20 bg-brand-accent/[0.03]">
                <div className="max-w-md text-center md:text-left">
                  <h3 className="text-lg md:text-xl font-black italic text-slate-100 uppercase tracking-tight leading-none">Broadcast Node</h3>
                  <p className="text-slate-500 text-[9px] uppercase tracking-[0.2em] mt-2 font-bold leading-relaxed">Add your frequency to the global discovery stream.</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto bg-slate-100 text-slate-900 px-8 py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-red hover:text-white active:scale-95 transition-all shadow-xl">Launch Frequency</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {myEvents.length === 0 ? (
                  <div className="col-span-2 py-10 text-center">
                    <p className="text-slate-600 font-bold italic uppercase tracking-widest text-[9px]">Node currently silent.</p>
                  </div>
                ) : (
                  myEvents.map(e => (
                    <div key={e.id} className="glass-card rounded-[2rem] overflow-hidden border border-white/10 group flex flex-col h-full">
                      <div className="h-32 bg-slate-800 overflow-hidden relative">
                        <img src={e.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h4 className="text-slate-200 font-black italic uppercase text-sm md:text-base leading-tight mb-4">{e.title}</h4>
                        <div className="mt-auto flex gap-2">
                          <button className="flex-1 py-2.5 bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-brand-red hover:text-white transition-all active:scale-95" onClick={async () => { if(confirm("Terminate broadcast?")){ await api.deleteEvent(e.id, currentUser?.uid || ''); onRefreshEvents?.(); } }}>Terminate</button>
                          <button className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Edit</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {['Terms', 'Privacy', 'Refund'].map(p => (
                <button key={p} className="glass-card p-4 md:p-5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-brand-red active:scale-95 transition-all" onClick={() => onOpenPolicy?.(p.toLowerCase() as any)}>
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
