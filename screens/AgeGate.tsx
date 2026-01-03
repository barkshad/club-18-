
import React, { useState, useRef } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { ShieldCheck, ChevronRight, User as UserIcon, Lock, Mail, Fingerprint, Camera, Upload, CheckCircle2 } from 'lucide-react';

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
  
  // Onboarding Media state
  const [onboardFile, setOnboardFile] = useState<File | null>(null);
  const [onboardCaption, setOnboardCaption] = useState('');

  const uploadToCloudinary = async (f: File) => {
    const formData = new FormData();
    formData.append('file', f);
    formData.append('upload_preset', 'real_unsigned');
    const resourceType = f.type.startsWith('video/') ? 'video' : 'image';
    const response = await fetch(`https://api.cloudinary.com/v1_1/ds2mbrzcn/${resourceType}/upload`, {
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
        onVerify(); // Success for login
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        // Create initial user doc
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
      setStep(isLogin ? 'password' : 'email');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!onboardFile || !auth.currentUser) return;
    setLoading(true);
    try {
      const url = await uploadToCloudinary(onboardFile);
      
      // Add first post
      await addDoc(collection(db, "posts"), {
        uid: auth.currentUser.uid,
        userName: fullName,
        userImage: '',
        url,
        caption: onboardCaption,
        type: onboardFile.type.startsWith('video/') ? 'video' : 'image',
        timestamp: Date.now()
      });

      // Update user status
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        status: 'verified_member',
        image: url // Use first post as profile pic for now
      }, { merge: true });

      onVerify();
    } catch (err) {
      setError("Gallery establishment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'mode':
        return (
          <div className="space-y-6 w-full fade-in">
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
          <div className="space-y-6 w-full fade-in">
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
              className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 transition-all shadow-[0_0_20px_rgba(139,0,0,0.3)]"
            >
              Establish Connection
            </button>
            <button onClick={() => setStep('mode')} className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Back to Portal</button>
          </div>
        );
      case 'details':
        return (
          <div className="space-y-4 w-full fade-in">
            <input 
              type="text" 
              placeholder="FULL LEGAL NAME"
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
              Create Identity
            </button>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-6 w-full fade-in">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="password" 
                placeholder="ACCESS KEY"
                value={password}
                autoFocus
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 pl-12 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 transition-all text-white"
              />
            </div>
            <button 
              onClick={() => isLogin ? handleAuth() : setStep('verify')}
              disabled={password.length < 6}
              className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 transition-all"
            >
              {isLogin ? 'Authenticate' : 'Secure Account'}
            </button>
          </div>
        );
      case 'verify':
        return (
          <div className="space-y-6 w-full fade-in">
            <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl text-center space-y-6">
              <div className="w-16 h-16 bg-[#8B0000]/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="text-[#8B0000]" size={32} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Maturity Protocol</h3>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-widest">
                This club is restricted to verified adults. Unauthorized access is a violation of club bylaws.
              </p>
              <button 
                onClick={() => setAgeChecked(!ageChecked)}
                className={`w-full py-4 rounded-xl border transition-all flex items-center justify-center gap-3 ${ageChecked ? 'bg-[#8B0000] border-[#8B0000] text-white' : 'bg-transparent border-zinc-800 text-zinc-600'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${ageChecked ? 'bg-white border-white' : 'border-zinc-700'}`}>
                  {ageChecked && <ChevronRight size={12} className="text-[#8B0000]" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Confirm 18+ Status</span>
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
      case 'onboard':
        return (
          <div className="space-y-8 w-full fade-in">
             <div className="text-center">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] italic mb-2">Establish Presence</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Every member begins with a Moment.</p>
             </div>
             
             <div className="relative aspect-square bg-zinc-900/50 rounded-3xl overflow-hidden border border-dashed border-zinc-800 flex items-center justify-center group transition-all hover:border-[#8B0000]/50">
                {onboardFile ? (
                   <img src={URL.createObjectURL(onboardFile)} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-4 opacity-30">
                     <Camera size={40} />
                     <p className="text-[9px] font-black uppercase tracking-[0.4em]">Initial Media</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setOnboardFile(e.target.files?.[0] || null)} />
             </div>

             <textarea 
                placeholder="Write your first cryptic caption..." 
                value={onboardCaption}
                onChange={(e) => setOnboardCaption(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-xs font-medium italic focus:outline-none resize-none h-24"
             />

             <button 
                onClick={handleCompleteOnboarding}
                disabled={!onboardFile || loading}
                className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs tracking-[0.3em] uppercase active:scale-95 disabled:opacity-20 premium-glow"
             >
                {loading ? 'Establishing...' : 'Join Inner Circle'}
             </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-black relative overflow-hidden text-white">
      {/* Dynamic Background */}
      <div className={`absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#8B0000]/10 blur-[150px] rounded-full transition-opacity duration-1000 ${step === 'onboard' ? 'opacity-80' : 'opacity-40'}`}></div>
      
      <div className="mb-12 z-10 text-center flex flex-col items-center">
        <div className="w-12 h-12 mb-6 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,1)]">
           <Fingerprint className="text-[#8B0000]" size={24} />
        </div>
        <h1 className="text-7xl font-black tracking-tighter italic leading-none mb-2 select-none">
          CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span>
        </h1>
        <div className="flex items-center gap-3">
            <div className="h-[1px] w-4 bg-zinc-800"></div>
            <p className="text-zinc-600 uppercase tracking-[0.6em] text-[8px] font-black">
                {step === 'onboard' ? 'GALLERY ESTABLISHMENT' : 'MEMBER PROTOCOL'}
            </p>
            <div className="h-[1px] w-4 bg-zinc-800"></div>
        </div>
      </div>

      <div className="w-full max-w-[320px] z-10">
        {error && (
          <div className="mb-4 p-3 bg-red-900/10 border border-red-900/30 rounded-xl animate-bounce">
             <p className="text-[#ff4444] text-[9px] text-center font-black uppercase tracking-widest">{error}</p>
          </div>
        )}
        {renderStep()}
      </div>

      <footer className="absolute bottom-10 text-[8px] text-zinc-800 font-black uppercase tracking-[0.5em] flex items-center gap-4 opacity-50">
        <span>EST. 2025</span>
        <div className="w-1 h-1 bg-zinc-900 rounded-full"></div>
        <span>PRIVATE ACCESS</span>
      </footer>
    </div>
  );
};

export default AgeGate;
