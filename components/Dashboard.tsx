import React from 'react';
import { User } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onOpenAdmin?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onOpenAdmin }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-5 md:px-0">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-brand-red text-[10px] font-black uppercase tracking-[0.4em]">Personal Sanctuary</span>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 leading-none">Namaste, {user.name}</h1>
          <p className="text-slate-400 font-medium italic">You have curated {user.bookings.length} upcoming experiences.</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'admin' && onOpenAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Manage Platform
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

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 italic">Experience Timeline</h2>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        </div>
        <div className="divide-y divide-slate-50">
          {user.bookings.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No bookings detected in your frequency yet.</p>
            </div>
          ) : (
            user.bookings.map((booking) => (
              <div key={booking.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/50 transition-all group">
                <div className="mb-6 md:mb-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase mb-3 tracking-widest ${
                    booking.category === 'Adventure' ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                    booking.category === 'Activity' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                    booking.category === 'Wellness' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                    'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}>
                    {booking.category}
                  </span>
                  <h3 className="text-xl font-black italic text-slate-900 mb-2 leading-none">{booking.eventTitle}</h3>
                  <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {booking.time}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(booking.bookedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button className="flex-1 md:flex-none px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-900 border-2 border-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95">
                    Access Ticket
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-red/10 blur-[100px]"></div>
        <h2 className="text-white text-2xl font-black italic uppercase mb-4">Deep Presence Protocol</h2>
        <p className="text-slate-400 text-sm italic max-w-md mx-auto leading-relaxed">
          "The most precious gift we can offer others is our presence. When mindfulness embraces those we love, they will bloom like flowers."
        </p>
      </div>
    </div>
  );
};

export default Dashboard;