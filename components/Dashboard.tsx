
import React, { useState } from 'react';
import { User, Booking } from '../types';
import { PolicyType } from './LegalModal';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  onOpenPolicy?: (type: PolicyType) => void;
}

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

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onOpenAdmin, onOpenPolicy }) => {
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  return (
    <div className="max-w-4xl mx-auto py-12 px-5 md:px-0 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
                    booking.category === 'Sports' ? 'bg-indigo-50 text-indigo-500 border border-indigo-100' :
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
                      {booking.eventDate}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => setSelectedTicket(booking)}
                    className="flex-1 md:flex-none px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-900 border-2 border-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                   >
                    Access Ticket
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* NEW LEGAL SECTION IN PROFILE */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-4 max-w-xs">
            <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter">Governance Protocol</h2>
            <p className="text-slate-400 text-xs font-medium italic leading-relaxed">
              Your profile is a sacred digital boundary. Calibrate your awareness of our legal and ethical frameworks.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 flex-1">
            {[
              { label: 'Terms of Resonance', type: 'terms' as PolicyType },
              { label: 'Privacy Calibration', type: 'privacy' as PolicyType },
              { label: 'Refund Protocol', type: 'refund' as PolicyType },
              { label: 'Shipping Disclaimer', type: 'shipping' as PolicyType }
            ].map((p) => (
              <button 
                key={p.type}
                onClick={() => onOpenPolicy?.(p.type)}
                className="text-left group"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-brand-red transition-all block mb-1">Frequency {p.type}</span>
                <span className="text-white font-bold text-sm border-b border-white/10 group-hover:border-brand-red transition-all">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-12 bg-white rounded-[3rem] text-center border border-slate-100 shadow-xl relative overflow-hidden">
        <h2 className="text-slate-900 text-2xl font-black italic uppercase mb-4 tracking-tighter">Deep Presence Protocol</h2>
        <p className="text-slate-400 text-sm italic max-w-md mx-auto leading-relaxed">
          "The most precious gift we can offer others is our presence. When mindfulness embraces those we love, they will bloom like flowers."
        </p>
      </div>

      {selectedTicket && (
        <TicketModal 
          booking={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
