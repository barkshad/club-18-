
import React, { useState } from 'react';

/* 
  LOGO PROMPT INSPIRATION:
  "A minimalist, luxury emblem for 'Club 18+'. A stylized, intertwined 'C' and '18' 
  in a sophisticated serif font. The '+' is a delicate deep-red glow. 
  Premium matte black texture, gold-embossed finish, high-end fashion branding style."
*/

interface AgeGateProps {
  onVerify: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onVerify }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-black">
      <div className="mb-16">
        <h1 className="text-5xl font-black tracking-tighter mb-2 italic">
          CLUB 18<span className="text-[#8B0000] not-italic">+</span>
        </h1>
        <div className="h-px w-12 bg-[#8B0000] mx-auto mb-4"></div>
        <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold">
          The Private Members Club
        </p>
      </div>

      <div className="space-y-8 w-full max-w-xs">
        <div className="space-y-2">
          <p className="text-white text-lg font-medium">Identity Verification</p>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Access to this digital brothel is restricted to verified adults only. Discretion is our priority.
          </p>
        </div>

        <div className="flex items-start gap-4 text-left p-4 bg-zinc-950 rounded-xl border border-zinc-900">
          <div className="pt-1">
            <input 
              type="checkbox" 
              id="age-check" 
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-5 h-5 accent-[#8B0000] bg-black border-zinc-800 rounded cursor-pointer"
            />
          </div>
          <label htmlFor="age-check" className="text-[11px] text-zinc-400 cursor-pointer leading-snug">
            I confirm that I am at least 18 years of age and agree to the 
            <span className="text-white underline ml-1">Privacy Charter</span>.
          </label>
        </div>

        <button 
          disabled={!checked}
          onClick={onVerify}
          className={`w-full py-4 rounded-full font-black tracking-[0.2em] text-xs transition-all duration-500 ${
            checked 
              ? 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
              : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
          }`}
        >
          REQUEST ENTRY
        </button>
      </div>

      <p className="mt-20 text-[9px] text-zinc-800 uppercase tracking-[0.4em] font-black">
        Excellence • Discretion • Love
      </p>
    </div>
  );
};

export default AgeGate;
