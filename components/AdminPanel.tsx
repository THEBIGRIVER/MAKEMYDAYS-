
import React, { useState } from 'react';
import type { Event, Booking, Category } from '../types.ts';
import { api } from '../services/api.ts';

interface AdminPanelProps {
  events: Event[];
  bookings: Booking[];
  onClose: () => void;
  onRefresh: () => void;
  userUid?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ events, bookings, onClose, onRefresh, userUid }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'bookings'>('overview');
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [adminPasskey, setAdminPasskey] = useState('');
  const [error, setError] = useState('');

  const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasskey !== '2576') { setError('Invalid passkey.'); return; }
    if (editingEvent?.title && editingEvent?.category) {
      await api.saveEvent({
        ...editingEvent,
        id: editingEvent.id || `admin-${Math.random().toString(36).substr(2, 9)}`,
        slots: editingEvent.slots || [{ time: '10:00 AM', availableSeats: 10 }],
        price: Number(editingEvent.price) || 0,
        image: editingEvent.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800',
        description: editingEvent.description || '',
        hostPhone: editingEvent.hostPhone || '917686924919'
      } as Event, userUid || 'admin');
      setEditingEvent(null);
      setError('');
      setAdminPasskey('');
      onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-slate-950 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-white/5 px-6 md:px-8 py-4 md:py-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white font-black">M</div>
          <h2 className="text-slate-100 font-black italic uppercase tracking-tighter text-lg md:text-xl">Admin Console</h2>
        </div>
        <button onClick={onClose} className="text-slate-100 text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-brand-red transition-all">Exit</button>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Responsive Sidebar/Bottom Nav */}
        <aside className="fixed bottom-0 left-0 right-0 md:relative md:w-64 bg-slate-900 md:bg-slate-900/50 border-t md:border-t-0 md:border-r border-white/5 p-4 md:p-6 flex md:flex-col gap-2 md:gap-4 z-20">
          {['overview', 'events', 'bookings'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)} 
              className={`flex-1 md:flex-none text-center md:text-left px-4 py-3 rounded-xl transition-all text-[10px] md:text-sm font-black uppercase tracking-widest ${activeTab === tab ? 'bg-brand-red text-white shadow-[0_0_20px_rgba(248,68,100,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#07090d] pb-24 md:pb-10">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Total Yield</p>
                <div className="text-slate-100 text-3xl md:text-4xl font-black italic leading-none">₹{totalRevenue.toLocaleString()}</div>
                <div className="w-full bg-slate-800 h-1 mt-6 rounded-full overflow-hidden">
                  <div className="bg-brand-red h-full w-[65%]" />
                </div>
              </div>
              <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Total Anchors</p>
                <div className="text-slate-100 text-3xl md:text-4xl font-black italic leading-none">{bookings.length}</div>
                <div className="w-full bg-slate-800 h-1 mt-6 rounded-full overflow-hidden">
                  <div className="bg-brand-accent h-full w-[40%]" />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-slate-100 font-black italic uppercase tracking-widest text-xs">Catalog Protocol</h3>
                <button onClick={() => { setEditingEvent({}); setError(''); }} className="w-full sm:w-auto bg-brand-red text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Launch New</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {events.map(event => (
                  <div key={event.id} className="bg-slate-900/80 p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-brand-red/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                        <img src={event.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-brand-red text-[7px] font-black uppercase tracking-widest">{event.category}</span>
                        <h4 className="text-slate-100 font-bold text-sm italic uppercase leading-none mt-1">{event.title}</h4>
                      </div>
                    </div>
                    <button onClick={() => setEditingEvent(event)} className="w-full sm:w-auto bg-slate-800 text-slate-300 px-5 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-brand-red hover:text-white transition-all">Edit Node</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'bookings' && (
             <div className="space-y-4">
               <h3 className="text-slate-100 font-black italic uppercase tracking-widest text-xs md:hidden">Anchor Logs</h3>
               <div className="md:bg-slate-900 md:rounded-[2rem] md:border md:border-white/5 md:overflow-hidden">
                 {/* Desktop Table View */}
                 <table className="hidden md:table w-full text-left">
                   <thead>
                     <tr className="border-b border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900/50">
                       <th className="px-8 py-5">Bearer</th>
                       <th className="px-8 py-5">Experience</th>
                       <th className="px-8 py-5 text-right">Value</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-slate-300">
                     {bookings.map(b => (
                       <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                         <td className="px-8 py-5 font-bold">{b.userName}</td>
                         <td className="px-8 py-5">{b.eventTitle}</td>
                         <td className="px-8 py-5 text-right font-black text-slate-100">₹{b.price}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 
                 {/* Mobile Card View */}
                 <div className="md:hidden space-y-3">
                   {bookings.map(b => (
                     <div key={b.id} className="bg-slate-900 p-5 rounded-2xl border border-white/5 flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                         <span className="text-slate-100 font-black italic text-sm">{b.userName}</span>
                         <span className="text-brand-red font-black text-[10px]">₹{b.price}</span>
                       </div>
                       <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">{b.eventTitle}</p>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          )}
        </main>
      </div>

      {editingEvent && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setEditingEvent(null)}></div>
          <form onSubmit={handleSaveEvent} className="relative bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] w-full max-w-lg space-y-6 border border-white/10 shadow-3xl animate-in zoom-in-95">
            <h3 className="text-xl md:text-2xl font-black italic text-slate-100 uppercase tracking-tighter">Event Protocol</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Title" value={editingEvent.title || ''} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-base outline-none focus:border-brand-red" required />
              <select value={editingEvent.category || ''} onChange={e => setEditingEvent({...editingEvent, category: e.target.value as Category})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-base outline-none focus:border-brand-red" required>
                <option value="">Select Category</option>
                <option value="Shows">Shows</option><option value="Activity">Activity</option><option value="MMD Originals">MMD Originals</option><option value="Mindfulness">Mindfulness</option><option value="Workshop">Workshop</option>
              </select>
              <input type="number" placeholder="Price (₹)" value={editingEvent.price || ''} onChange={e => setEditingEvent({...editingEvent, price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-base outline-none focus:border-brand-red" required />
              <div className="pt-4 border-t border-white/5">
                <input type="password" placeholder="Admin Passkey" value={adminPasskey} onChange={e => setAdminPasskey(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-base outline-none focus:border-brand-red" required />
                {error && <p className="text-brand-red text-[10px] font-black uppercase mt-2 tracking-widest">{error}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditingEvent(null)} className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</button>
              <button type="submit" className="flex-1 py-4 bg-brand-red text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Save Node</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
