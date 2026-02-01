import React, { useState } from 'react';
import { Event, Booking, Category } from '../types.ts';
import { api } from '../services/api.ts';

interface AdminPanelProps {
  events: Event[];
  bookings: Booking[];
  onClose: () => void;
  onRefresh: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ events, bookings, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'bookings'>('overview');
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [adminPasskey, setAdminPasskey] = useState('');
  const [error, setError] = useState('');

  const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasskey !== '2576') {
      setError('Invalid passkey.');
      return;
    }
    if (editingEvent?.title && editingEvent?.category) {
      await api.saveEvent({
        ...editingEvent,
        id: editingEvent.id || Math.random().toString(36).substr(2, 9),
        slots: editingEvent.slots || [{ time: '10:00 AM', availableSeats: 10 }],
        price: Number(editingEvent.price) || 0,
        image: editingEvent.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=800',
        description: editingEvent.description || '',
        hostPhone: editingEvent.hostPhone || '917686924919'
      } as Event);
      setEditingEvent(null);
      setError('');
      setAdminPasskey('');
      onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 flex items-center justify-between">
        <h2 className="text-white font-black italic uppercase tracking-tight text-xl">Admin Console</h2>
        <button onClick={onClose} className="text-white text-[10px] font-black uppercase tracking-widest bg-slate-800 px-4 py-2 rounded-lg">Exit</button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col gap-4">
          <button onClick={() => setActiveTab('overview')} className={`text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-brand-red text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Overview</button>
          <button onClick={() => setActiveTab('events')} className={`text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'events' ? 'bg-brand-red text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Experiences</button>
          <button onClick={() => setActiveTab('bookings')} className={`text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-brand-red text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Bookings</button>
        </aside>

        <main className="flex-1 overflow-y-auto p-10 bg-[#0a0c10]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Platform Revenue</p>
                <div className="text-white text-4xl font-black italic">₹{totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Tickets</p>
                <div className="text-white text-4xl font-black italic">{bookings.length}</div>
              </div>
            </div>
          )}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <button onClick={() => { setEditingEvent({}); setError(''); }} className="bg-brand-red text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">New Experience</button>
              <div className="grid grid-cols-1 gap-4">
                {events.map(event => (
                  <div key={event.id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex justify-between items-center group hover:border-brand-red/50 transition-all">
                    <div>
                      <span className="text-brand-red text-[8px] font-black uppercase tracking-widest">{event.category}</span>
                      <h4 className="text-white font-bold text-lg italic uppercase">{event.title}</h4>
                    </div>
                    <button onClick={() => setEditingEvent(event)} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-brand-red transition-all">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'bookings' && (
             <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-900/50">
                     <th className="px-6 py-4">Bearer</th>
                     <th className="px-6 py-4">Experience</th>
                     <th className="px-6 py-4 text-right">Price</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 text-slate-300">
                   {bookings.map(b => (
                     <tr key={b.id}>
                       <td className="px-6 py-4">{b.userName}</td>
                       <td className="px-6 py-4">{b.eventTitle}</td>
                       <td className="px-6 py-4 text-right">₹{b.price}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
        </main>
      </div>

      {editingEvent && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingEvent(null)}></div>
          <form onSubmit={handleSaveEvent} className="relative bg-slate-900 p-10 rounded-[3rem] w-full max-w-lg space-y-6 border border-slate-800 shadow-3xl">
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Experience Details</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Title" value={editingEvent.title || ''} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-brand-red" required />
              <select value={editingEvent.category || ''} onChange={e => setEditingEvent({...editingEvent, category: e.target.value as Category})} className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-brand-red" required>
                <option value="">Category</option>
                <option value="Shows">Shows</option>
                <option value="Activity">Activity</option>
                <option value="Therapy">Therapy</option>
                <option value="Mindfulness">Mindfulness</option>
                <option value="Workshop">Workshop</option>
              </select>
              <input type="number" placeholder="Price (₹)" value={editingEvent.price || ''} onChange={e => setEditingEvent({...editingEvent, price: Number(e.target.value)})} className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-brand-red" required />
              <textarea placeholder="Description" value={editingEvent.description || ''} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})} className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-brand-red h-24" />
              <div className="pt-4 border-t border-slate-800">
                <input type="password" placeholder="Admin Passkey" value={adminPasskey} onChange={e => setAdminPasskey(e.target.value)} className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-brand-red" required />
                {error && <p className="text-brand-red text-[10px] font-black uppercase mt-2">{error}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditingEvent(null)} className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-black uppercase text-[10px]">Discard</button>
              <button type="submit" className="flex-1 py-4 bg-brand-red text-white rounded-xl font-black uppercase text-[10px]">Authorize</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;