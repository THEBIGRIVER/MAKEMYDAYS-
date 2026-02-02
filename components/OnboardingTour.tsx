
import React, { useState, useEffect, useRef } from 'react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps = [
  {
    targetId: null,
    title: "The Aura Check",
    description: "Welcome, Explorer. MAKEMYDAYS is a sanctuary for unconventional wellness and high-octane adventure. Let's calibrate your experience.",
    position: 'center'
  },
  {
    targetId: 'mood-search-container',
    title: "Mood Resonance",
    description: "Tell us how you feel. Our AI analyzes your current frequency to curate sessions that either complement or enhance your state.",
    position: 'bottom'
  },
  {
    targetId: 'event-grid-container',
    title: "Experience Stream",
    description: "Browse curated events from Elite Paintball to MMD Originals. Each session is designed for maximum presence.",
    position: 'top'
  },
  {
    targetId: 'user-sanctuary-trigger',
    title: "Personal Sanctuary",
    description: "Access your tickets, manage your aura, and review your governance protocols here in your private profile.",
    position: 'bottom'
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const step = steps[currentStep];
    if (step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
        
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-500" />
      
      {step.targetId && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1001]">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect 
                x={coords.left - 10} 
                y={coords.top - 10 - window.scrollY} 
                width={coords.width + 20} 
                height={coords.height + 20} 
                rx="24" 
                fill="black" 
                className="transition-all duration-700 ease-in-out"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(10, 12, 16, 0.4)" mask="url(#spotlight-mask)" />
        </svg>
      )}

      <div 
        className={`absolute z-[1002] pointer-events-auto transition-all duration-700 ease-in-out w-full max-w-sm px-6
          ${!step.targetId ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
        `}
        style={step.targetId ? {
          top: step.position === 'top' ? coords.top - window.scrollY - 200 : coords.top + coords.height - window.scrollY + 20,
          left: coords.left + coords.width / 2 - 192, 
        } : {}}
      >
        <div className="glass-card rounded-[2.5rem] p-8 shadow-3xl border border-white/20 animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-brand-red">Step {currentStep + 1} of {steps.length}</span>
            <button onClick={onComplete} className="text-slate-400 hover:text-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-100 mb-3">{step.title}</h3>
          <p className="text-slate-400 text-xs font-medium italic leading-relaxed mb-8">
            {step.description}
          </p>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleNext}
              className="flex-1 py-4 bg-slate-100 text-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
            >
              {currentStep === steps.length - 1 ? "Initiate" : "Synchronize"}
            </button>
            {currentStep < steps.length - 1 && (
              <button 
                onClick={onComplete}
                className="px-6 py-4 text-slate-400 hover:text-slate-100 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
      
      {step.targetId && (
        <div 
          className="absolute z-[1001] w-4 h-4 bg-brand-red rounded-full animate-ping opacity-75 transition-all duration-700"
          style={{
            top: coords.top + coords.height / 2 - window.scrollY - 8,
            left: coords.left + coords.width / 2 - 8
          }}
        />
      )}
    </div>
  );
};

export default OnboardingTour;
