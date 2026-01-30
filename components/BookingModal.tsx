
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, Slot } from '../types.ts';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot, date: string) => Promise<void>;
}

type ModalState = 'selecting' | 'paying' | 'processing' | 'success' | 'error';

const TARGET_UPI_ID = "16arijitdas-1@oksbi";
const MERCHANT_NAME = "MAKEMYDAYS";

const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalState, setModalState] = useState<ModalState>('selecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedBookingId, setGeneratedBookingId] = useState('');

  const availableDates = useMemo(() => {
    if (event.date) {
      const [day, month, year] = event.date.split(' ');
      return [{
        full: event.date,
        day: 'ONE-TIME',
        date: parseInt(day)
      }];
    }

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        full: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        date: d.getDate()
      });
    }
    return dates;
  }, [event.date]);

  useEffect(() => {
    if (availableDates.length === 1) {
      setSelectedDate(availableDates[0].full);
    } else if (!selectedDate) {
      setSelectedDate(availableDates[0].full);
    }

    if (event.slots.length === 1) {
      setSelectedSlot(event.slots[0]);
    }
  }, [availableDates, selectedDate, event.slots]);

  const generateBookingId = () => {
    return `MMD-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  };

  const handlePayment = useCallback(() => {
    if (!selectedSlot || !selectedDate) return;
    
    // Construct standard UPI URL
    // pn: Payee Name, pa: Payee Address (UPI ID), tn: Transaction Note, am: Amount, cu: Currency
    const upiUrl = `upi://pay?pa=${TARGET_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&tn=${encodeURIComponent(`MMD: ${event.title}`)}&am=${event.price}&cu=INR`;
    
    // Attempt to open the UPI app intent
    window.location.href = upiUrl;

    setModalState('processing');
    
    // Simulate payment verification delay for UX feedback
    setTimeout(async () => {
        try {
          await onConfirm(selectedSlot, selectedDate);
          setGeneratedBookingId(generateBookingId());
          setModalState('success');
        } catch (err) {
          setErrorMessage('Calibration sync failed. Please attempt settlement again.');
          setModalState('error');
        }
    }, 4000); 
  }, [event, selectedSlot, selectedDate, onConfirm]);

  if (modalState === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-0">
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl transition-opacity animate-in fade-in duration-700"></div>
        
        <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in duration-500 transform-gpu">
          <div className="h-2 bg-emerald-500 w-full"></div>
          
          <div className="p-10 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2 text-slate-900 leading-tight">Confirmed.</h2>
            <p className="text-slate-400 font-medium italic mb-8 px-4 text-sm">
              Your resonance for <span className="text-slate-900 font-black">{event.title}</span> is now active.
            </p>

            <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border border-slate-100 text-left relative">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-slate-100"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-slate-100"></div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Calibration</span>
                    <span className="text-xs font-black italic text-slate-900 uppercase line-clamp-1">{event.title}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Time Sync</span>
                    <span className="text-xs font-black text-slate-900">{selectedDate}, {selectedSlot?.time}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/50 border-dashed flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Reference</span>
                    <span className="text-[11px] font-mono font-black text-brand-red tracking-tight">{generatedBookingId}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</span>
                    <span className="text-xs font-black text-slate-900 uppercase">Settled • UPI</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-xl"
            >
              Enter Sanctuary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white w-full md:max-w-2xl rounded-t-[3rem] shadow-3xl overflow-hidden animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto scrollbar-hide">
        
        {modalState === 'selecting' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
               <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
               <div className="absolute bottom-0 left-0 p-8 md:p-10 flex flex-col items-start">
                  <span className="bg-brand-red text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 shadow-lg mb-3">
                    {event.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter leading-none text-slate-900">
                    {event.title}
                  </h2>
               </div>
            </div>

            <div className="p-8 md:p-10 pt-6">
              <div className="flex items-start justify-between mb-8">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Calibration Data</span>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed italic pr-4 line-clamp-2">
                    {event.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Energy Value</span>
                  <span className="text-2xl md:text-3xl font-black italic">₹{event.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Select Target Date</h4>
                <div className={`flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x ${event.date ? 'pointer-events-none' : ''}`}>
                  {availableDates.map((dateObj, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dateObj.full)}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-4 rounded-2xl border-2 transition-all snap-center ${
                        selectedDate === dateObj.full
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase mb-1">{dateObj.day}</span>
                      <span className="text-lg font-black">{dateObj.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Session Time</h4>
                <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${event.slots.length === 1 ? 'pointer-events-none' : ''}`}>
                  {event.slots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-1 ${
                        selectedSlot === slot 
                          ? 'border-brand-red bg-brand-red/5 text-slate-900' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="font-black text-sm">{slot.time}</span>
                      <span className="text-[8px] uppercase font-bold opacity-60">{slot.availableSeats} slots free</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Custom High-Fidelity GPay Button triggering UPI intent */}
                <button
                  onClick={handlePayment}
                  disabled={!selectedSlot || !selectedDate}
                  className={`relative h-16 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center overflow-hidden group ${
                    !selectedSlot || !selectedDate ? 'opacity-40 grayscale pointer-events-none bg-slate-100' : 'bg-slate-900 shadow-xl hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-14 h-6 text-white" viewBox="0 0 100 40" fill="currentColor">
                       <path d="M12.5 15.5h-5.4v9.6h-2.3v-11.8h7.7v2.2zm7.1 2.4c0 1.5-.4 2.7-1.2 3.5s-1.9 1.3-3.2 1.3h-1.5v2.4h-2.2v-9.6h3.7c1.3 0 2.3.4 3.1 1.2s1.3 2 1.3 3.4zm-2.2.1c0-.9-.2-1.6-.6-2s-1-.6-1.7-.6h-1.4v5.3h1.4c.7 0 1.2-.2 1.7-.7s.6-1.2.6-2zm9.3 2.1l1.5 5h-2.3l-.4-1.6h-3.4l-.4 1.6h-2.3l1.5-5.1 1.6-4.9h2.3l1.9 5zm-1.8 1.4l-1.1-4.1-1.1 4.1h2.2zm6.2-1.1l-2.9-6.3h2.4l1.6 4 1.6-4h2.4l-2.9 6.3v3.3h-2.2v-3.3z" />
                       <path d="M55.4 11.2c-5.7 0-10.4 4.7-10.4 10.4s4.7 10.4 10.4 10.4 10.4-4.7 10.4-10.4-4.7-10.4-10.4-10.4zm0 18.6c-4.5 0-8.2-3.7-8.2-8.2s3.7-8.2 8.2-8.2 8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z" fill="#4285F4"/>
                       <path d="M78.6 11.2c-5.7 0-10.4 4.7-10.4 10.4s4.7 10.4 10.4 10.4 10.4-4.7 10.4-10.4-4.7-10.4-10.4-10.4zm0 18.6c-4.5 0-8.2-3.7-8.2-8.2s3.7-8.2 8.2-8.2 8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z" fill="#EA4335"/>
                       <path d="M100 21.6c0 5.7-4.7 10.4-10.4 10.4s-10.4-4.7-10.4-10.4 4.7-10.4 10.4-10.4c5.7 0 10.4 4.7 10.4 10.4zm-18.6 0c0 4.5 3.7 8.2 8.2 8.2s8.2-3.7 8.2-8.2-3.7-8.2-8.2-8.2-8.2 3.7-8.2 8.2z" fill="#FBBC05"/>
                       <path d="M120 21.6c0 5.7-4.7 10.4-10.4 10.4s-10.4-4.7-10.4-10.4 4.7-10.4 10.4-10.4c5.7 0 10.4 4.7 10.4 10.4zm-18.6 0c0 4.5 3.7 8.2 8.2 8.2s8.2-3.7 8.2-8.2-3.7-8.2-8.2-8.2-8.2 3.7-8.2 8.2z" fill="#34A853"/>
                    </svg>
                    <span className="text-white text-xs font-black tracking-widest uppercase">Pay with GPay</span>
                  </div>
                </button>

                <button
                  onClick={handlePayment}
                  disabled={!selectedSlot || !selectedDate}
                  className={`h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all transform active:scale-95 border-2 flex flex-col items-center justify-center gap-1 ${
                    selectedSlot && selectedDate
                      ? 'border-slate-900 bg-white text-slate-900 hover:bg-slate-50' 
                      : 'border-slate-100 text-slate-200 bg-slate-50 pointer-events-none'
                  }`}
                >
                  <span>Alternative UPI Pay</span>
                  <span className="text-[7px] text-brand-red font-black normal-case opacity-80">{TARGET_UPI_ID}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {(modalState === 'error' || modalState === 'processing') && (
           <div className="p-10 pt-20">
              {modalState === 'error' && (
                <div className="py-10 text-center">
                   <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                   </div>
                   <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-slate-900">Sync Failure</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                     {errorMessage}
                   </p>
                   <button onClick={() => setModalState('selecting')} className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 underline">Try Alternative Protocol</button>
                </div>
              )}

              {modalState === 'processing' && (
                <div className="py-10 flex flex-col items-center justify-center">
                   <div className="relative w-24 h-24 mb-10">
                      <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-8 border-brand-red rounded-full border-t-transparent animate-spin"></div>
                   </div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-center text-slate-900">Verifying Resonance</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse text-center">
                     Connecting to Protocol {TARGET_UPI_ID}...
                   </p>
                </div>
              )}
           </div>
        )}
        
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default BookingModal;
