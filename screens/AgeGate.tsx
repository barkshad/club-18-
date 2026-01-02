
import React, { useState } from 'react';

interface AgeGateProps {
  onVerify: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onVerify }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-black">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">CLUB 18<span className="text-[#C41E3A]">+</span></h1>
        <p className="text-zinc-500 uppercase tracking-widest text-xs">The Private Members Club</p>
      </div>

      <div className="space-y-6 w-full max-w-xs">
        <p className="text-zinc-400 text-sm leading-relaxed">
          Welcome to an exclusive space for adults to connect, chat, and find meaningful relationships.
        </p>

        <div className="flex items-start gap-3 text-left">
          <input 
            type="checkbox" 
            id="age-check" 
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 accent-[#C41E3A] bg-zinc-900 border-zinc-800"
          />
          <label htmlFor="age-check" className="text-xs text-zinc-500 cursor-pointer">
            I confirm that I am at least 18 years of age and agree to the Terms of Service and Privacy Policy.
          </label>
        </div>

        <button 
          disabled={!checked}
          onClick={onVerify}
          className={`w-full py-4 rounded-full font-bold transition-all duration-300 ${
            checked 
              ? 'bg-white text-black hover:bg-zinc-200 active:scale-95' 
              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
          }`}
        >
          ENTER CLUB
        </button>
      </div>

      <p className="mt-12 text-[10px] text-zinc-700 uppercase tracking-widest">
        Excellence • Discretion • Connection
      </p>
    </div>
  );
};

export default AgeGate;
