
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ShieldCheck, ChevronRight, User as UserIcon, Lock, Mail, Fingerprint } from 'lucide-react';

const AgeGate: React.FC<{onVerify: () => void}> = () => {
  const [step, setStep] = useState<'mode' | 'email' | 'details' | 'password' | 'verify'>('mode');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [ageChecked, setAgeChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError('');
    if (!isLogin && !ageChecked) {
      setError('Membership requires adult verification.');
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          username: username.toLowerCase().replace(/\s/g, ''),
          name: fullName,
          createdAt: Date.now(),
          status: 'verified_member'
        }, { merge: true });
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
      setStep(isLogin ? 'password' : 'email');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'mode':
        return (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => { setIsLogin(true); setStep('email'); }}
              className="w-full py-5 bg-white text-black rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 premium-glow"
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setStep('email'); }}
              className="w-full py-5 bg-zinc-900 text-white rounded-full border border-zinc-800 font-black text-xs tracking-[0.3em] uppercase active:scale-95"
            >
              Request Membership
            </button>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS"
                value={email}
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 pl-12 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 transition-all text-white placeholder:text-zinc-800"
              />
            </div>
            <button 
              onClick={() => setStep(isLogin ? 'password' : 'details')}
              disabled={!email.includes('@')}
              className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 transition-all"
            >
              Continue
            </button>
            <button onClick={() => setStep('mode')} className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Go Back</button>
          </div>
        );
      case 'details':
        return (
          <div className="space-y-4 w-full animate-in fade-in slide-in-from-right-4 duration-500">
            <input 
              type="text" 
              placeholder="FULL NAME"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 transition-all"
            />
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-xs">@</span>
              <input 
                type="text" 
                placeholder="USERNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 pl-10 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 transition-all"
              />
            </div>
            <button 
              onClick={() => setStep('password')}
              disabled={!username || !fullName}
              className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 transition-all"
            >
              Next Step
            </button>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="password" 
                placeholder="SECURE PASSWORD"
                value={password}
                autoFocus
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 pl-12 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 transition-all text-white placeholder:text-zinc-800"
              />
            </div>
            <button 
              onClick={() => isLogin ? handleAuth() : setStep('verify')}
              disabled={password.length < 6}
              className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 transition-all"
            >
              {isLogin ? 'Enter' : 'Finalize'}
            </button>
          </div>
        );
      case 'verify':
        return (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl text-center space-y-6">
              <div className="w-16 h-16 bg-[#8B0000]/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="text-[#8B0000]" size={32} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Age Protocol</h3>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-widest">
                Club 18+ is an exclusive directory for verified adults only. By proceeding, you confirm your legal age.
              </p>
              <button 
                onClick={() => setAgeChecked(!ageChecked)}
                className={`w-full py-4 rounded-xl border transition-all flex items-center justify-center gap-3 ${ageChecked ? 'bg-[#8B0000] border-[#8B0000] text-white' : 'bg-transparent border-zinc-800 text-zinc-600'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${ageChecked ? 'bg-white border-white' : 'border-zinc-700'}`}>
                  {ageChecked && <ChevronRight size={12} className="text-[#8B0000]" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">I am 18+ years old</span>
              </button>
            </div>
            <button 
              onClick={handleAuth}
              disabled={!ageChecked || loading}
              className="w-full py-5 bg-white text-black rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 premium-glow"
            >
              {loading ? 'Transmitting...' : 'Establish Profile'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-black relative overflow-hidden fade-in text-white">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#8B0000]/10 blur-[150px] rounded-full opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-zinc-900/40 blur-[120px] rounded-full opacity-30"></div>

      <div className="mb-20 z-10 text-center flex flex-col items-center">
        <div className="w-12 h-12 mb-6 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
           <Fingerprint className="text-[#8B0000]" size={24} />
        </div>
        <h1 className="text-7xl font-black tracking-tighter italic leading-none mb-2">
          CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span>
        </h1>
        <p className="text-zinc-600 uppercase tracking-[0.6em] text-[8px] font-black">
          {step === 'mode' ? 'PRIVATE ACCESS' : 'MEMBER PROTOCOL'}
        </p>
      </div>

      <div className="w-full max-w-[320px] z-10">
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-xl">
             <p className="text-[#ff4444] text-[9px] text-center font-black uppercase tracking-widest">{error}</p>
          </div>
        )}
        {renderStep()}
      </div>

      <footer className="absolute bottom-10 text-[8px] text-zinc-800 font-black uppercase tracking-[0.5em] flex items-center gap-4">
        <span>ENCRYPTED</span>
        <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
        <span>ANONYMOUS</span>
        <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
        <span>SECURE</span>
      </footer>
    </div>
  );
};

export default AgeGate;
