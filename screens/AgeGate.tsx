
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ShieldCheck, ChevronRight, User as UserIcon } from 'lucide-react';

const AgeGate: React.FC<{onVerify: () => void}> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [ageChecked, setAgeChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError('');
    if (!isLogin && !ageChecked) {
      setError('You must be 18+ to access the club.');
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        // Create initial user doc with username
        await setDoc(doc(db, "users", userCred.user.uid), {
          username: username.toLowerCase().replace(/\s/g, ''),
          createdAt: Date.now()
        }, { merge: true });
      }
    } catch (err: any) {
      const msg = err.message.replace('Firebase: ', '');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-black relative overflow-hidden fade-in">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B0000]/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8B0000]/5 blur-[120px] rounded-full"></div>

      <div className="mb-16 z-10 text-center">
        <h1 className="text-6xl font-black tracking-tighter mb-1 italic leading-none">
          CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span>
        </h1>
        <div className="flex items-center justify-center gap-2">
          <div className="h-[1px] w-4 bg-zinc-800"></div>
          <p className="text-zinc-500 uppercase tracking-[0.4em] text-[9px] font-bold">
            Private Access
          </p>
          <div className="h-[1px] w-4 bg-zinc-800"></div>
        </div>
      </div>

      <div className="space-y-4 w-full max-w-[280px] z-10">
        <div className="space-y-2">
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-[#8B0000]/50 transition-all placeholder:text-zinc-600"
            />
          )}
          <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-[#8B0000]/50 transition-all placeholder:text-zinc-600"
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-[#8B0000]/50 transition-all placeholder:text-zinc-600"
          />
        </div>

        {!isLogin && (
          <div className="flex items-center gap-3 text-left p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50 group cursor-pointer" onClick={() => setAgeChecked(!ageChecked)}>
            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${ageChecked ? 'bg-[#8B0000] border-[#8B0000]' : 'border-zinc-700'}`}>
              {ageChecked && <ShieldCheck size={12} className="text-white" />}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">I verify I am of legal adult age</span>
          </div>
        )}

        {error && (
          <p className="text-[#ff4444] text-[10px] text-center font-bold px-2">{error}</p>
        )}

        <button 
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-4 bg-white text-black rounded-full font-black text-xs tracking-[0.2em] uppercase active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-200 premium-glow"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
          ) : (
            <>
              {isLogin ? 'Enter The Club' : 'Request Membership'}
              <ChevronRight size={16} />
            </>
          )}
        </button>

        <button 
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="w-full text-zinc-500 text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors py-2"
        >
          {isLogin ? "Prospective Member? Join" : "Existing Member? Sign In"}
        </button>
      </div>

      <footer className="absolute bottom-10 text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
        Discrete • Exclusive • Private
      </footer>
    </div>
  );
};

export default AgeGate;
