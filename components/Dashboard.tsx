
import React, { useState, useRef, useMemo } from 'react';
import { Booking, Event, Category, User } from '../types.ts';
import { PolicyType } from './LegalModal.tsx';
import { api } from '../services/api.ts';
import { auth } from '../services/firebase.ts';
import { signOut } from 'firebase/auth';

interface DashboardProps {
  events: Event[];
  bookings: Booking[];
  currentUser: User | null;
  initialTab?: 'bookings' | 'hosting' | 'settings';
  onOpenAdmin?: () => void;
  onOpenPolicy?: (type: PolicyType) => void;
  onRefreshEvents?: () => void;
}

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
    slots: [{ time: '10:00', availableSeats: 20 }]
  });
  const [singleDate, setSingleDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    // Validation Fix: Allow price to be 0
    const isPriceValid = formData.price !== undefined && !isNaN(Number(formData.price));
    if (!formData.title || !isPriceValid || !formData.image || !singleDate || !formData.hostPhone) {
      alert("Please complete all sections to finalize the launch. Ensure an image is selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newEvent: Event = {
        id: `user-event-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title || '',
        category: formData.category as Category || 'Activity',
        price: Number(formData.price),
        description: formData.description || '',
        image: formData.image || '',
        dates: [new Date(singleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
        hostPhone: formData.hostPhone || '',
        slots: [formData.slots![0]],
        createdAt: new Date().toISOString()
      };
      await api.saveEvent(newEvent, userUid);
      localStorage.setItem('mmd_host_phone', formData.hostPhone!);
      setIsSuccessfullyLaunched(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2500);
    } catch (err: any) {
      console.error("Launch Error:", err);
      alert(`Launch disrupted: ${err.message || "Permission denied. Check your Firestore rules."}`);
    } finally { setIsSubmitting(false); }
  };

  if (isSuccessfullyLaunched) {
    return (
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl"></div>
        <div className="relative text-center space-y-6 animate-in zoom-in-95 duration-700">
           <div className="w-24 h-24 bg-brand-red rounded-full flex items-center justify-center mx-auto shadow-2xl animate-music-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
           </div>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-100">Broadcasting...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-[3.5rem] shadow-3xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 flex justify-between items-center bg-slate-900 border-b border-white/5">
          <h2 className="text-2xl font-black italic uppercase text-slate-200">Broadcast Experience</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Event Title" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
              <option value="Activity">Activity</option><option value="Shows">Shows</option><option value="Mindfulness">Mindfulness</option><option value="Workshop">Workshop</option><option value="MMD Originals">MMD Originals</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={singleDate} onChange={e => setSingleDate(e.target.value)} />
            <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={formData.slots![0].time} onChange={e => setFormData({...formData, slots: [{...formData.slots![0], time: e.target.value, availableSeats: 20}]})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" placeholder="Price (₹) - Use 0 for Free" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})} />
            <input required type="tel" placeholder="Your WhatsApp Number" className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 font-bold" value={formData.hostPhone} onChange={e => setFormData({...formData, hostPhone: e.target.value.replace(/\D/g, '')})} />
          </div>
          <div onClick={() => !isSubmitting && fileInputRef.current?.click()} className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-brand-red transition-all relative overflow-hidden">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <div className="text-center"><p className="text-slate-500 font-black uppercase text-[10px]">Add Image Aura</p><p className="text-slate-600 text-[8px] mt-1 font-bold italic">(Required to Launch)</p></div>}
          </div>
          <textarea required placeholder="Description..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-slate-200 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-red hover:text-white transition-all disabled:opacity-50">
            {isSubmitting ? "Broadcasting Frequency..." : "Launch Experience"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ events, bookings, currentUser, initialTab, onOpenAdmin, onOpenPolicy, onRefreshEvents }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'hosting' | 'settings'>(initialTab || 'bookings');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const userName = currentUser?.name || 'Explorer';
  const myEvents = useMemo(() => events.filter(e => e.ownerUid === currentUser?.uid), [events, currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload(); 
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="glass-card rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/10 bg-slate-900/40 backdrop-blur-3xl">
        <div className="p-10 md:p-14 border-b border-white/5 flex justify-between items-center">
           <div>
             <span className="text-brand-red text-[11px] font-black uppercase tracking-[0.4em] mb-2 block">Open Sanctuary</span>
             <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-200">Namaste, {userName}</h2>
           </div>
           <button 
             onClick={handleLogout}
             className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-brand-red hover:text-white transition-all shadow-xl"
           >
             Disconnect Node
           </button>
        </div>
        <div className="p-10 md:p-14">
          <div className="flex gap-8 mb-12 border-b border-white/5 overflow-x-auto scrollbar-hide">
            {['bookings', 'hosting', 'settings'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-5 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-slate-100' : 'text-slate-500 hover:text-slate-200'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-red rounded-full"></div>}
              </button>
            ))}
          </div>

          {activeTab === 'bookings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.length === 0 ? <div className="col-span-2 py-20 text-center text-slate-600 font-black italic">Your anchored sessions will appear here.</div> :
                bookings.map((b) => (
                  <div key={b.id} className="glass-card p-6 rounded-[2rem] border border-white/10">
                    <span className="text-brand-red text-[8px] font-black uppercase">{b.category}</span>
                    <h4 className="text-slate-200 font-black italic text-lg">{b.eventTitle}</h4>
                    <p className="text-slate-500 text-[10px] uppercase font-bold mt-2">{b.eventDate} @ {b.time}</p>
                  </div>
                ))
              }
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center glass-card p-8 rounded-[2.5rem] border border-brand-accent/20">
                <div className="max-w-md"><h3 className="text-xl font-black italic text-slate-100">Broadcast Node</h3><p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">Add your experience to the global discovery feed.</p></div>
                <button onClick={() => setShowCreateModal(true)} className="bg-slate-200 px-8 py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-brand-red hover:text-white transition-all">Create Event</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myEvents.length === 0 ? (
                  <div className="col-span-2 py-10 text-center text-slate-600 font-bold italic uppercase tracking-widest text-[10px]">
                    No active broadcasts found from your node.
                  </div>
                ) : (
                  myEvents.map(e => (
                    <div key={e.id} className="glass-card rounded-[2rem] overflow-hidden border border-white/10 group">
                      <div className="h-32 bg-slate-800 overflow-hidden"><img src={e.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                      <div className="p-6">
                        <h4 className="text-slate-200 font-black italic uppercase text-base">{e.title}</h4>
                        <button className="mt-4 w-full py-2 bg-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-brand-red hover:text-white transition-all" onClick={async () => { if(confirm("Terminate broadcast?")){ await api.deleteEvent(e.id, currentUser?.uid || ''); onRefreshEvents?.(); } }}>Terminate</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Terms', 'Privacy', 'Refund'].map(p => <button key={p} className="glass-card p-4 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-brand-red transition-all" onClick={() => onOpenPolicy?.(p.toLowerCase() as any)}>{p}</button>)}
            </div>
          )}
        </div>
      </div>
      {showCreateModal && currentUser && <CreateEventModal userUid={currentUser.uid} onClose={() => setShowCreateModal(false)} onSuccess={() => onRefreshEvents?.()} />}
    </div>
  );
};

export default Dashboard;
