
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { ShieldCheck, Mail, Lock, Camera, Instagram, MessageCircle, Twitter, Globe, Fingerprint, ChevronRight, Zap } from 'lucide-react';

type Step = 'mode' | 'email' | 'details' | 'password' | 'verify' | 'onboard';

const AgeGate: React.FC<{onVerify: () => void}> = ({ onVerify }) => {
  const [step, setStep] = useState<Step>('mode');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [ageChecked, setAgeChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Socials
  const [ig, setIg] = useState('');
  const [wa, setWa] = useState('');
  const [tt, setTt] = useState('');
  const [x, setX] = useState('');
  const [of, setOf] = useState('');

  const [onboardFile, setOnboardFile] = useState<File | null>(null);

  const uploadToCloudinary = async (f: File) => {
    const formData = new FormData();
    formData.append('file', f);
    formData.append('upload_preset', 'real_unsigned');
    const response = await fetch(`https://api.cloudinary.com/v1_1/ds2mbrzcn/image/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Transmission failed');
    const data = await response.json();
    return data.secure_url;
  };

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
        onVerify();
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          uid: userCred.user.uid,
          username: username.toLowerCase().replace(/\s/g, ''),
          name: fullName,
          email: email,
          createdAt: Date.now(),
          status: 'pending_onboarding'
        });
        setStep('onboard');
      }
    } catch (err: any) {
      console.error(err);
      setError('System Error: Authentication Protocol Failed. Use Bypass for preview.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!onboardFile || !auth.currentUser) return;
    setLoading(true);
    try {
      const url = await uploadToCloudinary(onboardFile);
      
      await addDoc(collection(db, "posts"), {
        uid: auth.currentUser.uid,
        userName: fullName || username,
        userImage: url,
        url,
        caption: "Joined the Inner Circle",
        type: 'image',
        timestamp: Date.now()
      });

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        status: 'verified_member',
        image: url,
        name: fullName || username,
        username: username,
        socials: {
          instagram: ig,
          whatsapp: wa,
          tiktok: tt,
          x: x,
          onlyfans: of
        }
      }, { merge: true });

      onVerify();
    } catch (err) {
      setError("Establishment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'mode':
        return (
          <div className="space-y-6 w-full fade-in">
            <button onClick={() => { setIsLogin(true); setStep('email'); }} className="btn-reflective w-full py-5 bg-white text-black rounded-full font-black text-[11px] tracking-[0.4em] uppercase active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">Sign In</button>
            <button onClick={() => { setIsLogin(false); setStep('email'); }} className="w-full py-5 glass-panel text-white rounded-full border border-white/10 font-black text-[11px] tracking-[0.4em] uppercase active:scale-95 hover:bg-white/5 transition-all">Request Membership</button>
            
            <div className="flex items-center gap-4 py-4">
              <div className="h-[1px] flex-1 bg-white/5"></div>
              <span className="text-[8px] font-black uppercase text-zinc-700 tracking-[0.4em]">Emergency Entry</span>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>

            <button 
              onClick={() => onVerify()} 
              className="w-full py-5 rounded-3xl border border-[#8B0000]/30 glass-panel flex items-center justify-center gap-4 active:scale-95 transition-all group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-[#8B0000]/5 group-hover:bg-[#8B0000]/10 transition-colors"></div>
              <Zap size={16} className="text-[#FF0000] animate-pulse glow-red" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#FF0000] relative z-10 text-glow">Bypass Protocol</span>
            </button>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-6 w-full fade-in">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#8B0000] transition-colors" size={18} />
              <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass-panel rounded-2xl p-5 pl-14 text-xs font-bold tracking-[0.1em] focus:outline-none focus:border-[#8B0000]/50 transition-all text-white placeholder:text-zinc-800" />
            </div>
            <button onClick={() => setStep(isLogin ? 'password' : 'details')} disabled={!email.includes('@')} className="btn-reflective w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-[11px] tracking-[0.4em] uppercase active:scale-95 disabled:opacity-20 transition-all shadow-2xl glow-red">Continue <ChevronRight size={14} className="inline ml-2" /></button>
            <button onClick={() => setStep('mode')} className="w-full text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-zinc-400 transition-colors">Abort Access</button>
          </div>
        );
      case 'details':
        return (
          <div className="space-y-4 w-full fade-in">
            <input type="text" placeholder="FULL NAME" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full glass-panel rounded-2xl p-5 text-xs font-bold tracking-[0.1em] focus:outline-none focus:border-[#8B0000]/50 text-white" />
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-xs">@</span>
              <input type="text" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full glass-panel rounded-2xl p-5 pl-11 text-xs font-bold tracking-[0.1em] focus:outline-none focus:border-[#8B0000]/50 text-white" />
            </div>
            <button onClick={() => setStep('password')} disabled={!username || !fullName} className="btn-reflective w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-[11px] tracking-[0.4em] uppercase active:scale-95 disabled:opacity-20 shadow-2xl glow-red">Identity Next</button>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-6 w-full fade-in">
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full glass-panel rounded-2xl p-5 pl-14 text-xs font-bold tracking-[0.1em] focus:outline-none focus:border-[#8B0000]/50 text-white" />
            </div>
            <button onClick={() => isLogin ? handleAuth() : setStep('verify')} disabled={password.length < 6} className="btn-reflective w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-[11px] tracking-[0.4em] uppercase active:scale-95 disabled:opacity-20 shadow-2xl glow-red">Establish Identity</button>
          </div>
        );
      case 'verify':
        return (
          <div className="space-y-6 w-full fade-in">
            <div className="p-10 glass-panel rounded-[2.5rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/5 to-transparent pointer-events-none"></div>
              <ShieldCheck className="text-[#FF0000] mx-auto text-glow glow-red" size={56} />
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-[0.4em] italic text-gradient-red">Maturity Protocol</h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] leading-relaxed">Membership restricted to<br/>verified adults (18+).</p>
              </div>
              <button onClick={() => setAgeChecked(!ageChecked)} className={`w-full py-5 rounded-2xl border transition-all flex items-center justify-center gap-3 ${ageChecked ? 'bg-[#8B0000] border-[#8B0000] text-white glow-red shadow-xl' : 'bg-transparent border-white/10 text-zinc-600'}`}>
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">{ageChecked ? '✓ IDENTITY VERIFIED' : 'DECLARE 18+ STATUS'}</span>
              </button>
            </div>
            <button onClick={handleAuth} disabled={!ageChecked || loading} className="btn-reflective w-full py-5 bg-white text-black rounded-full font-black text-[11px] tracking-[0.5em] uppercase active:scale-95 disabled:opacity-20 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">Enter Inner Circle</button>
          </div>
        );
      case 'onboard':
        return (
          <div className="space-y-8 w-full fade-in overflow-y-auto max-h-[75vh] no-scrollbar px-2">
             <div className="text-center space-y-2">
                <h3 className="text-sm font-black uppercase tracking-[0.5em] italic text-gradient-red">Member Archive</h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] leading-none opacity-60">Mandatory Setup</p>
             </div>
             
             <div className="relative aspect-square glass-panel rounded-[3rem] overflow-hidden border border-white/10 flex items-center justify-center group transition-all hover:border-[#8B0000]/50 shadow-2xl hover-scale cursor-pointer">
                {onboardFile ? (
                   <img src={URL.createObjectURL(onboardFile)} className="w-full h-full object-cover animate-in zoom-in duration-700" />
                ) : (
                  <div className="flex flex-col items-center gap-6 opacity-30 group-hover:opacity-60 transition-all duration-700">
                     <div className="p-8 rounded-full bg-white/5 border border-white/5 backdrop-blur-3xl">
                       <Camera size={48} className="text-white" />
                     </div>
                     <p className="text-[11px] font-black uppercase tracking-[0.6em] text-zinc-400">Capture Visual</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setOnboardFile(e.target.files?.[0] || null)} />
             </div>

             <div className="space-y-4">
                <div className="relative group">
                  <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-pink-500 transition-colors" size={16} />
                  <input placeholder="INSTAGRAM HANDLE" value={ig} onChange={e => setIg(e.target.value)} className="w-full glass-panel rounded-2xl p-5 pl-14 text-[11px] font-bold text-white focus:outline-none focus:border-white/20" />
                </div>
                <div className="relative group">
                  <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-green-500 transition-colors" size={16} />
                  <input placeholder="WHATSAPP NUMBER" value={wa} onChange={e => setWa(e.target.value)} className="w-full glass-panel rounded-2xl p-5 pl-14 text-[11px] font-bold text-white focus:outline-none focus:border-white/20" />
                </div>
                <div className="relative group">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={16} />
                  <input placeholder="TIKTOK IDENTITY" value={tt} onChange={e => setTt(e.target.value)} className="w-full glass-panel rounded-2xl p-5 pl-14 text-[11px] font-bold text-white focus:outline-none focus:border-white/20" />
                </div>
                <div className="relative group">
                  <Twitter className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-400 transition-colors" size={16} />
                  <input placeholder="X PROTOCOL" value={x} onChange={e => setX(e.target.value)} className="w-full glass-panel rounded-2xl p-5 pl-14 text-[11px] font-bold text-white focus:outline-none focus:border-white/20" />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white/80 transition-colors" size={16} />
                  <input placeholder="ONLYFANS VAULT" value={of} onChange={e => setOf(e.target.value)} className="w-full glass-panel rounded-2xl p-5 pl-14 text-[11px] font-bold text-white focus:outline-none focus:border-white/20" />
                </div>
             </div>

             <button onClick={handleCompleteOnboarding} disabled={!onboardFile || loading} className="btn-reflective w-full py-6 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.5em] uppercase active:scale-95 disabled:opacity-20 premium-glow shadow-2xl glow-red mt-4 mb-16 transition-all">
                {loading ? 'Transmitting Data...' : 'Confirm Identity'}
             </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-10 bg-transparent relative overflow-hidden text-white">
      {/* Dynamic light pulse behind logo */}
      <div className="absolute top-[-25%] left-[-25%] w-[100%] h-[100%] bg-[#8B0000]/10 blur-[200px] rounded-full animate-pulse pointer-events-none"></div>
      
      <div className="mb-14 z-10 text-center flex flex-col items-center">
        <div className="mb-6 p-5 rounded-full glass-panel border border-[#8B0000]/40 glow-red shadow-[0_0_30px_rgba(139,0,0,0.3)]">
          <Fingerprint className="text-[#FF0000]" size={48} />
        </div>
        <h1 className="text-7xl font-black tracking-tighter italic leading-none mb-3 text-gradient-red drop-shadow-2xl">
          CLUB 18<span className="not-italic text-glow ml-1 text-white">+</span>
        </h1>
        <p className="text-zinc-600 uppercase tracking-[1em] text-[10px] font-black opacity-80">Private Network Portal</p>
      </div>

      <div className="w-full max-w-[340px] z-10 relative">
        {error && <div className="mb-10 p-5 glass-panel border border-red-900/50 rounded-2xl text-center text-[#ff4444] text-[10px] font-black uppercase tracking-widest animate-pulse shadow-2xl">{error}</div>}
        {renderStep()}
      </div>

      {/* Subtle branding footer */}
      <div className="absolute bottom-10 opacity-20 flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.6em] pointer-events-none">
        <span>Discrete</span>
        <div className="w-1.5 h-1.5 bg-[#8B0000] rounded-full shadow-[0_0_5px_#8B0000]"></div>
        <span>Encrypted</span>
        <div className="w-1.5 h-1.5 bg-[#8B0000] rounded-full shadow-[0_0_5px_#8B0000]"></div>
        <span>Elite</span>
      </div>
    </div>
  );
};

export default AgeGate;
