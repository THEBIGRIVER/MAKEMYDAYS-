
import React from 'react';

export type PolicyType = 'terms' | 'privacy' | 'refund' | 'shipping';

interface LegalModalProps {
  type: PolicyType;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const content = {
    terms: {
      title: "Terms of Resonance",
      text: `By accessing the MAKEMYDAYS platform, you agree to calibrate your usage according to our Frequency Standards. 
      1. User Conduct: Explorers must provide accurate identification (Name and Phone) to maintain the integrity of the community.
      2. Intellectual Property: The "Frequency Protocol", specific UI elements, and curated experience lists are proprietary technology of Beneme.
      3. Limitation of Liability: MAKEMYDAYS acts as a conduit for experiences. While we vet all partners, the final resonance of the activity is between the provider and the explorer.
      4. Account Security: Your profile is your personal sanctuary; do not share your access codes with uncalibrated individuals.`
    },
    privacy: {
      title: "Privacy Calibration",
      text: `Your data is part of your unique aura. We treat it with radical transparency.
      1. Data Collection: We collect your name and phone number solely for booking verification.
      2. AI Processing: Your 'mood queries' are processed via Gemini AI to provide personalized frequency matching. No personal identity is shared with the AI models.
      3. Third-Party Access: We do not sell your data. We only share booking details with the specific experience provider you have selected.
      4. Cookies: We use minimal local storage to remember your profile settings and recent calibrations.`
    },
    refund: {
      title: "Return & Refund Protocol",
      text: `Resonance changes, but logistics require stability.
      1. Cancellation Window: Full refunds are issued if requested at least 24 hours before the scheduled experience.
      2. Last-Minute Shifts: Cancellations within 24 hours are subject to a 50% recalibration fee, as providers have already reserved their energy for you.
      3. No-Show: Failure to attend a session without prior notice results in a 100% forfeiture of the settlement.
      4. Quality Guarantee: If an experience fails to meet its described frequency due to provider error, a full credit will be applied to your account.`
    },
    shipping: {
      title: "Shipping & Logistics",
      text: `1. Physical Goods: MAKEMYDAYS provides digital access protocols for live experiences. We do not manufacture or ship physical atoms.
      2. Delivery Method: Upon successful settlement, your ticket is instantly generated in your Personal Sanctuary (Dashboard).
      3. Shipping Disclaimer: As we deal exclusively in digital access and experiential resonance, traditional postal shipping is not applicable to our services.
      4. Digital Latency: While access is typically instantaneous, please allow up to 60 seconds for global frequency synchronization during high-load periods.`
    }
  };

  const active = content[type];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-brand-red text-[8px] font-black uppercase tracking-[0.3em] block mb-1">Legal Protocol</span>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">{active.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-10 max-h-[60vh] overflow-y-auto">
          <div className="prose prose-slate max-w-none">
            {active.text.split('\n').map((para, i) => (
              <p key={i} className="text-slate-600 text-sm leading-relaxed italic mb-4 last:mb-0 whitespace-pre-line">
                {para.trim()}
              </p>
            ))}
          </div>
        </div>
        <div className="p-8 bg-slate-900 text-center">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
            Last Calibrated: October 2024 • Version 2.1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
