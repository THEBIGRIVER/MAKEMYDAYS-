import React, { useState } from 'react';
import { Event, Booking, Category } from '../types';
import { api } from '../services/api';

interface AdminPanelProps {
  events: Event[];
  bookings: Booking[];
  onClose: () => void;
  onRefresh: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ events, bookings, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'bookings'>('overview');
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);

  const totalRevenue = bookings.reduce((acc, curr) => {
    const event = events.find(e => e.id === curr.eventId);
    return acc + (event?.price || 0);
  }, 0);

  const totalCustomers = new Set(bookings.map(b => b.userEmail)).size;

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Delete this experience forever?')) {
      await api.deleteEvent(id);
      onRefresh();
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent && editingEvent.title && editingEvent.category) {
      const eventToSave = {
        ...editingEvent,
        id: editingEvent.id || Math.random().toString(36).substr(2, 9),
        slots: editingEvent.slots || [{ time: '10:00 AM', availableSeats: 10 }],
        price: Number(editingEvent.price) || 0
      } as Event;
      
      await api.saveEvent(eventToSave);
      setEditingEvent(null);
      onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-black italic uppercase tracking-tight text-xl">Owner's Console</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Platform Management v1.0</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Exit Panel
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'events', label: 'Experiences', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { id: 'bookings', label: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-emerald-500 text-white font-bold' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-10 bg-[#0a0c10]">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Gross Revenue</p>
                  <p className="text-4xl font-black text-white italic">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Unique Customers</p>
                  <p className="text-4xl font-black text-white italic">{totalCustomers}</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Tickets Sold</p>
                  <p className="text-4xl font-black text-white italic">{bookings.length}</p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-white font-bold">Latest Booking Activity</h3>
                  <span className="text-emerald-500 text-[10px] font-bold">REAL-TIME FEED</span>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Experience</th>
                        <th className="px-6 py-4">Session</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300 divide-y divide-slate-800">
                      {bookings.slice(0, 10).map(b => (
                        <tr key={b.id} className="hover:bg-slate-800/30">
                          <td className="px-6 py-4">
                            <p className="font-bold text-white">{b.userName || 'Anonymous'}</p>
                            <p className="text-[10px] text-slate-500">{b.userEmail}</p>
                          </td>
                          <td className="px-6 py-4 font-bold">{b.eventTitle}</td>
                          <td className="px-6 py-4 text-xs">{b.time}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-full border border-emerald-500/20 uppercase">Booked</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black text-white italic uppercase">Experience Catalog</h3>
                  <p className="text-slate-500 text-xs">Manage your storefront items.</p>
                </div>
                <button 
                  onClick={() => setEditingEvent({})}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Create New Experience
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {events.map(event => (
                  <div key={event.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800">
                        <img src={event.image} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                      </div>
                      <div>
                        <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">{event.category}</span>
                        <h4 className="text-white font-bold text-lg">{event.title}</h4>
                        <p className="text-slate-500 text-xs">₹{event.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingEvent(event)}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in duration-500">
               <div className="p-8 border-b border-slate-800">
                  <h3 className="text-white font-black italic text-xl uppercase tracking-tight">Full Platform Booking Ledger</h3>
                  <p className="text-slate-500 text-xs mt-1">Audit-ready records for all platform transactions.</p>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800 bg-slate-900/50">
                        <th className="px-8 py-5">Customer Details</th>
                        <th className="px-8 py-5">Experience Reserved</th>
                        <th className="px-8 py-5">Session Time</th>
                        <th className="px-8 py-5">Date Booked</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300 divide-y divide-slate-800">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-800/20">
                          <td className="px-8 py-6">
                            <p className="font-bold text-white">{b.userName || 'Anonymous User'}</p>
                            <p className="text-[10px] text-emerald-500 font-mono">{b.userEmail}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-white">{b.eventTitle}</p>
                            <p className="text-[9px] uppercase font-black text-slate-500">{b.category}</p>
                          </td>
                          <td className="px-8 py-6 text-sm">{b.time}</td>
                          <td className="px-8 py-6 text-sm opacity-50">{new Date(b.bookedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
                 {bookings.length === 0 && (
                   <div className="p-20 text-center text-slate-600 uppercase font-black tracking-widest text-[10px]">
                     No bookings found in platform history.
                   </div>
                 )}
               </div>
            </div>
          )}
        </main>
      </div>

      {/* Event Editor Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setEditingEvent(null)}></div>
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-3xl overflow-hidden p-10">
            <h3 className="text-2xl font-black italic text-white uppercase mb-8">
              {editingEvent.id ? 'Edit Experience' : 'New Experience'}
            </h3>
            <form onSubmit={handleSaveEvent} className="space-y-6">
              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Title</label>
                <input 
                  type="text" 
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                  className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Category</label>
                  <select 
                    value={editingEvent.category || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, category: e.target.value as Category})}
                    className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Activity">Activity</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Team Building">Team Building</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Price (₹)</label>
                  <input 
                    type="number" 
                    value={editingEvent.price || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, price: Number(e.target.value)})}
                    className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Image URL</label>
                <input 
                  type="text" 
                  value={editingEvent.image || ''}
                  onChange={(e) => setEditingEvent({...editingEvent, image: e.target.value})}
                  className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Description</label>
                <textarea 
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20"
                >
                  Save experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;