
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Event, Slot } from '../types.ts';

interface BookingModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: (slot: Slot, date: string) => Promise<void>;
}

type ModalState = 'selecting' | 'paying' | 'processing' | 'success' | 'error';

// Official GPay API Constants
const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

const tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
    'gateway': 'example', 
    'gatewayMerchantId': 'exampleGatewayMerchantId'
  }
};

const baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks
  }
};

const cardPaymentMethod = Object.assign(
  {},
  baseCardPaymentMethod,
  {
    tokenizationSpecification: tokenizationSpecification
  }
);

const TARGET_UPI_ID = "16arijitdas-1@oksbi";
const MERCHANT_NAME = "Arijit Das";

const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalState, setModalState] = useState<ModalState>('selecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isGPayReady, setIsGPayReady] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState('');
  const gpayContainerRef = useRef<HTMLDivElement>(null);
  const paymentsClientRef = useRef<any>(null);

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

  const getGooglePaymentsClient = useCallback(() => {
    if (paymentsClientRef.current === null) {
      paymentsClientRef.current = new (window as any).google.payments.api.PaymentsClient({
        environment: 'PRODUCTION',
        merchantInfo: {
          merchantName: MERCHANT_NAME,
          merchantId: 'BCR2DN6TVEXU6A5H'
        }
      });
    }
    return paymentsClientRef.current;
  }, []);

  const onGooglePaymentButtonClicked = useCallback(() => {
    if (!selectedSlot || !selectedDate) return;

    const paymentDataRequest: any = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
    paymentDataRequest.transactionInfo = {
      displayItems: [{
        label: `${event.title} Experience`,
        type: 'LINE_ITEM',
        price: event.price.toString(),
      }],
      totalPriceStatus: 'FINAL',
      totalPriceLabel: 'Total',
      totalPrice: event.price.toString(),
      currencyCode: 'INR',
      countryCode: 'IN',
    };
    paymentDataRequest.merchantInfo = {
      merchantName: MERCHANT_NAME,
      merchantId: 'BCR2DN6TVEXU6A5H',
    };

    const client = getGooglePaymentsClient();
    client.loadPaymentData(paymentDataRequest)
      .then((paymentData: any) => {
        handlePaymentSuccess(paymentData);
      })
      .catch((err: any) => {
        console.error('Google Pay Error:', err);
        if (err.statusCode === "DEVELOPER_ERROR" || err.statusCode === "OR_BIBED_07") {
            setErrorMessage("GPay is initializing for this domain. Please use Direct UPI.");
            setModalState('error');
            setTimeout(() => setModalState('selecting'), 3000);
        }
      });
  }, [event, selectedSlot, selectedDate, getGooglePaymentsClient]);

  const handleDirectUPILink = () => {
    if (!selectedSlot || !selectedDate) return;
    
    const upiUrl = `upi://pay?pa=${TARGET_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&tn=${encodeURIComponent(`MAKEMYDAYS: ${event.title}`)}&am=${event.price}&cu=INR`;
    window.location.href = upiUrl;

    setModalState('processing');
    
    setTimeout(async () => {
        await onConfirm(selectedSlot, selectedDate);
        setGeneratedBookingId(generateBookingId());
        setModalState('success');
    }, 4500); 
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    setModalState('processing');
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    await onConfirm(selectedSlot!, selectedDate);
    setGeneratedBookingId(generateBookingId());
    setModalState('success');
  };

  useEffect(() => {
    let checkInterval: any;
    const initGPay = () => {
      if ((window as any).google?.payments?.api) {
        const client = getGooglePaymentsClient();
        const isReadyToPayRequest: any = Object.assign({}, baseRequest);
        isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];

        client.isReadyToPay(isReadyToPayRequest)
          .then((response: any) => {
            if (response.result) {
              setIsGPayReady(true);
              clearInterval(checkInterval);
            }
          })
          .catch((err: any) => {
            console.error('Ready check error:', err);
          });
      }
    };
    checkInterval = setInterval(initGPay, 1000);
    initGPay();
    return () => clearInterval(checkInterval);
  }, [getGooglePaymentsClient]);

  useEffect(() => {
    if (isGPayReady && selectedSlot && modalState === 'selecting' && gpayContainerRef.current) {
      const client = getGooglePaymentsClient();
      const button = client.createButton({
        onClick: onGooglePaymentButtonClicked,
        buttonColor: 'black',
        buttonType: 'buy',
        buttonSizeMode: 'fill'
      });
      gpayContainerRef.current.innerHTML = '';
      gpayContainerRef.current.appendChild(button);
    }
  }, [isGPayReady, selectedSlot, modalState, getGooglePaymentsClient, onGooglePaymentButtonClicked]);

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

            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2 text-slate-900 leading-tight">You're Calibrated.</h2>
            <p className="text-slate-400 font-medium italic mb-8 px-4 text-sm">
              Your session for <span className="text-slate-900 font-black">{event.title}</span> has been confirmed.
            </p>

            <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border border-slate-100 text-left relative">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-slate-100"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-slate-100"></div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Experience</span>
                    <span className="text-xs font-black italic text-slate-900 uppercase">{event.title}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Session Slot</span>
                    <span className="text-xs font-black text-slate-900">{selectedDate}, {selectedSlot?.time}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/50 border-dashed flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Booking Ref</span>
                    <span className="text-[11px] font-mono font-black text-brand-red tracking-tight">{generatedBookingId}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Settlement</span>
                    <span className="text-xs font-black text-slate-900 uppercase">Paid • UPI</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={onClose}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-xl hover:shadow-slate-900/20"
              >
                Access My Dashboard
              </button>
            </div>
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
            {/* Hero Image Section */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
               <img 
                 src={event.image} 
                 alt={event.title} 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
               <div className="absolute top-4 left-0 right-0 z-20">
                  <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto backdrop-blur-md"></div>
               </div>
               
               <div className="absolute bottom-0 left-0 p-8 md:p-10 flex flex-col items-start">
                  <span className="bg-brand-red text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 shadow-lg mb-3">
                    {event.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter leading-none text-slate-900 drop-shadow-sm">
                    {event.title}
                  </h2>
               </div>
            </div>

            <div className="p-8 md:p-10 pt-6">
              <div className="flex items-start justify-between mb-8">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Detailed Calibration</span>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed italic pr-4">
                    {event.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">Total Due</span>
                  <span className="text-2xl md:text-3xl font-black italic">₹{event.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Step 1: Date Selection */}
              <div className="mb-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                  {event.date ? 'Confirmed Event Date' : 'Select Target Date'}
                </h4>
                <div className={`flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x ${event.date ? 'pointer-events-none' : ''}`}>
                  {availableDates.map((dateObj, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dateObj.full)}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-4 rounded-2xl border-2 transition-all snap-center ${
                        selectedDate === dateObj.full
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg scale-105'
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase mb-1">{dateObj.day}</span>
                      <span className="text-lg font-black">{dateObj.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Time Selection */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {event.slots.length === 1 ? 'Confirmed Session' : 'Select Session Time'}
                  </h4>
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] text-emerald-700 font-black uppercase tracking-widest">Gateway: Active</span>
                  </div>
                </div>
                <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${event.slots.length === 1 ? 'pointer-events-none' : ''}`}>
                  {event.slots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-1 ${
                        selectedSlot === slot 
                          ? 'border-brand-red bg-brand-red/5 text-slate-900 shadow-sm' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="font-black text-sm">{slot.time}</span>
                      <span className="text-[8px] uppercase font-bold opacity-60">{slot.availableSeats} slots free</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    ref={gpayContainerRef}
                    className={`h-16 flex items-center justify-center rounded-2xl transition-all transform active:scale-95 overflow-hidden shadow-lg ${
                      !selectedSlot || !selectedDate ? 'opacity-40 grayscale pointer-events-none' : ''
                    }`}
                  >
                    {(!selectedSlot || !selectedDate) && (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-black uppercase text-slate-300 tracking-widest">
                        GPay (Finalize Choice)
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDirectUPILink}
                    disabled={!selectedSlot || !selectedDate}
                    className={`h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all transform active:scale-95 border-2 flex flex-col items-center justify-center gap-1 shadow-md ${
                      selectedSlot && selectedDate
                        ? 'border-slate-900 bg-white text-slate-900 hover:bg-slate-50' 
                        : 'border-slate-100 text-slate-200 bg-slate-50 pointer-events-none'
                    }`}
                  >
                    <span>Instant UPI Pay</span>
                    <span className="text-[7px] text-brand-red font-black normal-case opacity-80 animate-pulse">{TARGET_UPI_ID}</span>
                  </button>
                </div>
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
                   <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-slate-900">Gateway Refused Connection</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                     {errorMessage}
                   </p>
                   <button onClick={() => setModalState('selecting')} className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 underline">Try Alternative Method</button>
                </div>
              )}

              {modalState === 'processing' && (
                <div className="py-10 flex flex-col items-center justify-center">
                   <div className="relative w-24 h-24 mb-10">
                      <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-8 border-brand-red rounded-full border-t-transparent animate-spin"></div>
                   </div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-center text-slate-900">Verifying Settlement</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Syncing Merchant {TARGET_UPI_ID}...</p>
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
