
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface AgeGateProps {
  onVerify: () => void;
}

const AgeGate: React.FC<AgeGateProps> = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageChecked, setAgeChecked] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    if (!isLogin && !ageChecked) {
      setError('You must confirm you are 18+ to enter the club.');
      return;
    }
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-8 text-center bg-black">
      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter mb-2 italic">
          CLUB 18<span className="text-[#8B0000] not-italic">+</span>
        </h1>
        <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold">
          The Private Members Club
        </p>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        <input 
          type="email" 
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8B0000]"
        />
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8B0000]"
        />

        {!isLogin && (
          <div className="flex items-start gap-3 text-left p-3 bg-zinc-950 rounded-lg border border-zinc-900">
            <input 
              type="checkbox" 
              id="age" 
              checked={ageChecked}
              onChange={(e) => setAgeChecked(e.target.checked)}
              className="mt-1 accent-[#8B0000]"
            />
            <label htmlFor="age" className="text-[10px] text-zinc-400">
              I verify that I am 18+ and accept the Club Terms.
            </label>
          </div>
        )}

        {error && <p className="text-[#8B0000] text-[10px] font-bold">{error}</p>}

        <button 
          onClick={handleAuth}
          className="w-full py-4 bg-white text-black rounded-full font-black text-xs tracking-widest uppercase active:scale-95 transition-all"
        >
          {isLogin ? 'Enter Club' : 'Request Access'}
        </button>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest hover:text-white"
        >
          {isLogin ? "Need an invitation? Sign Up" : "Already a member? Log In"}
        </button>
      </div>
    </div>
  );
};

export default AgeGate;
