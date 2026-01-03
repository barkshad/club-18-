
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { ShieldCheck, ChevronRight, Lock, Mail, Fingerprint, Camera, Instagram, MessageCircle, Twitter, Globe } from 'lucide-react';

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
  const [onboardCaption, setOnboardCaption] = useState('');

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
      setError(err.message.replace('Firebase: ', ''));
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
        userName: fullName,
        userImage: url,
        url,
        caption: onboardCaption,
        type: 'image',
        timestamp: Date.now()
      });

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        status: 'verified_member',
        image: url,
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
            <button onClick={() => { setIsLogin(true); setStep('email'); }} className="w-full py-5 bg-white text-black rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 premium-glow">Sign In</button>
            <button onClick={() => { setIsLogin(false); setStep('email'); }} className="w-full py-5 bg-zinc-900 text-white rounded-full border border-zinc-800 font-black text-xs tracking-[0.3em] uppercase active:scale-95">Request Membership</button>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-6 w-full fade-in">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 pl-12 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 transition-all text-white placeholder:text-zinc-800" />
            </div>
            <button onClick={() => setStep(isLogin ? 'password' : 'details')} disabled={!email.includes('@')} className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 transition-all shadow-[0_0_20px_rgba(139,0,0,0.3)]">Continue</button>
            <button onClick={() => setStep('mode')} className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Back</button>
          </div>
        );
      case 'details':
        return (
          <div className="space-y-4 w-full fade-in">
            <input type="text" placeholder="FULL NAME" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 text-white" />
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-xs">@</span>
              <input type="text" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 pl-10 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 text-white" />
            </div>
            <button onClick={() => setStep('password')} disabled={!username || !fullName} className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 transition-all">Next</button>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-6 w-full fade-in">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 pl-12 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 text-white" />
            </div>
            <button onClick={() => isLogin ? handleAuth() : setStep('verify')} disabled={password.length < 6} className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 transition-all">Authenticate</button>
          </div>
        );
      case 'verify':
        return (
          <div className="space-y-6 w-full fade-in">
            <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl text-center space-y-6">
              <ShieldCheck className="text-[#8B0000] mx-auto" size={32} />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Maturity Protocol</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Confirm you are 18+ to enter the club.</p>
              <button onClick={() => setAgeChecked(!ageChecked)} className={`w-full py-4 rounded-xl border flex items-center justify-center gap-3 ${ageChecked ? 'bg-[#8B0000] border-[#8B0000] text-white' : 'bg-transparent border-zinc-800 text-zinc-600'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest">{ageChecked ? '✓ VERIFIED' : 'CONFIRM 18+'}</span>
              </button>
            </div>
            <button onClick={handleAuth} disabled={!ageChecked || loading} className="w-full py-5 bg-white text-black rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 premium-glow">Join Club</button>
          </div>
        );
      case 'onboard':
        return (
          <div className="space-y-6 w-full fade-in overflow-y-auto max-h-[70vh] no-scrollbar px-1">
             <div className="text-center">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] italic mb-2">Connect Your Socials</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Mandatory photo and social links required.</p>
             </div>
             
             <div className="relative aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 flex items-center justify-center group transition-all hover:border-[#8B0000]/50">
                {onboardFile ? (
                   <img src={URL.createObjectURL(onboardFile)} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-4 opacity-30">
                     <Camera size={40} />
                     <p className="text-[9px] font-black uppercase tracking-[0.4em]">Primary Photo</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setOnboardFile(e.target.files?.[0] || null)} />
             </div>

             <div className="space-y-3">
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input placeholder="INSTAGRAM USERNAME" value={ig} onChange={e => setIg(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 pl-12 text-[10px] font-bold text-white focus:outline-none" />
                </div>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input placeholder="WHATSAPP NUMBER" value={wa} onChange={e => setWa(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 pl-12 text-[10px] font-bold text-white focus:outline-none" />
                </div>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input placeholder="TIKTOK USERNAME" value={tt} onChange={e => setTt(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 pl-12 text-[10px] font-bold text-white focus:outline-none" />
                </div>
                <div className="relative">
                  <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input placeholder="X (TWITTER) USERNAME" value={x} onChange={e => setX(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 pl-12 text-[10px] font-bold text-white focus:outline-none" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input placeholder="ONLYFANS USERNAME" value={of} onChange={e => setOf(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 pl-12 text-[10px] font-bold text-white focus:outline-none" />
                </div>
             </div>

             <button onClick={handleCompleteOnboarding} disabled={!onboardFile || loading} className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20">Finalize Profile</button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-black relative overflow-hidden text-white">
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#8B0000]/10 blur-[150px] rounded-full"></div>
      
      <div className="mb-10 z-10 text-center flex flex-col items-center">
        <Fingerprint className="text-[#8B0000] mb-4" size={32} />
        <h1 className="text-6xl font-black tracking-tighter italic leading-none mb-2">CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span></h1>
        <p className="text-zinc-600 uppercase tracking-[0.6em] text-[8px] font-black">Private Identity Portal</p>
      </div>

      <div className="w-full max-w-[320px] z-10">
        {error && <div className="mb-4 p-3 bg-red-900/10 border border-red-900/30 rounded-xl text-center text-[#ff4444] text-[9px] font-black uppercase tracking-widest">{error}</div>}
        {renderStep()}
      </div>
    </div>
  );
};

export default AgeGate;
