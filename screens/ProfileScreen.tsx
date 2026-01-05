
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Edit3, Instagram, MessageCircle, Twitter, Globe, Lock, LogOut, ArrowLeft, ShieldCheck, X, Camera, Fingerprint, MapPin } from 'lucide-react';
import { UserProfile, Post } from '../types';

const ProfileScreen: React.FC<{userId: string, onBack: () => void}> = ({ userId, onBack }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [ig, setIg] = useState('');
  const [wa, setWa] = useState('');
  const [tt, setTt] = useState('');
  const [x, setX] = useState('');
  const [of, setOf] = useState('');

  const isOwnProfile = auth.currentUser?.uid === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setProfile(data);
        if (isOwnProfile) {
          setName(data.name || '');
          setUsername(data.username || '');
          setBio(data.bio || '');
          setIg(data.socials?.instagram || '');
          setWa(data.socials?.whatsapp || '');
          setTt(data.socials?.tiktok || '');
          setX(data.socials?.x || '');
          setOf(data.socials?.onlyfans || '');
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId, isOwnProfile]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    const updated = {
      name,
      username: username.toLowerCase().replace(/\s/g, ''),
      bio,
      socials: {
        instagram: ig,
        whatsapp: wa,
        tiktok: tt,
        x,
        onlyfans: of
      }
    };
    await setDoc(doc(db, "users", auth.currentUser.uid), updated, { merge: true });
    setProfile(prev => prev ? ({ ...prev, ...updated }) : null);
    setIsEditing(false);
    setLoading(false);
  };

  const openSocial = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin glow-red"></div></div>;

  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent fade-in overflow-y-auto pb-32 text-white p-8">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-gradient-red">Identity Protocols</h2>
          <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-zinc-500 hover:text-white transition-all"><X size={20} /></button>
        </header>
        <div className="space-y-8 max-w-sm mx-auto w-full">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 px-1">Pseudonym</label>
              <input placeholder="NAME" value={name} onChange={e => setName(e.target.value)} className="w-full glass-panel rounded-2xl p-5 text-xs font-bold text-white focus:outline-none focus:border-[#8B0000]/40 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 px-1">Club Handle</label>
              <input placeholder="USERNAME" value={username} onChange={e => setUsername(e.target.value)} className="w-full glass-panel rounded-2xl p-5 text-xs font-bold text-white focus:outline-none focus:border-[#8B0000]/40 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 px-1">Club Statement</label>
              <textarea placeholder="BIO" value={bio} onChange={e => setBio(e.target.value)} className="w-full glass-panel rounded-2xl p-5 text-xs font-medium text-white h-32 focus:outline-none resize-none italic leading-relaxed" />
            </div>
            
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#8B0000] mb-6 flex items-center gap-3">
              <Lock size={12} /> External Links
            </p>
            
            <div className="space-y-3">
              {['INSTAGRAM', 'WHATSAPP', 'TIKTOK', 'X', 'ONLYFANS'].map((label, idx) => {
                const setters = [setIg, setWa, setTt, setX, setOf];
                const vals = [ig, wa, tt, x, of];
                return (
                  <div key={label} className="relative group">
                    <input 
                      placeholder={label} 
                      value={vals[idx]} 
                      onChange={e => setters[idx](e.target.value)} 
                      className="w-full glass-panel rounded-2xl p-4 pl-12 text-[11px] font-bold text-white focus:outline-none focus:border-zinc-500 transition-all" 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                      {idx === 0 && <Instagram size={16} />}
                      {idx === 1 && <MessageCircle size={16} />}
                      {idx === 2 && <Globe size={16} />}
                      {idx === 3 && <Twitter size={16} />}
                      {idx === 4 && <Lock size={16} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button onClick={handleSave} className="btn-reflective w-full py-6 bg-[#8B0000] text-white rounded-full font-black text-xs uppercase tracking-[0.5em] active:scale-95 shadow-2xl premium-glow transition-all glow-red">
            Authenticate Identity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent fade-in text-white pb-32">
      {/* Premium Profile Header */}
      <div className="relative h-[70vh] w-full overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
        {profile?.image ? (
            <img src={profile.image} className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" alt="Profile" />
        ) : (
            <div className="w-full h-full bg-zinc-950 flex items-center justify-center"><Camera size={48} className="text-zinc-800" /></div>
        )}
        
        {/* Layered vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%) z-10"></div>

        <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-20">
          <button onClick={onBack} className="w-12 h-12 glass-panel backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/10 active:scale-90 shadow-2xl transition-all">
            <ArrowLeft size={22} />
          </button>
          {isOwnProfile && (
            <button onClick={() => auth.signOut()} className="w-12 h-12 glass-panel backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/10 active:scale-90 shadow-2xl transition-all">
              <LogOut size={20} className="text-[#8B0000]" />
            </button>
          )}
        </div>

        <div className="absolute bottom-16 left-10 right-10 z-20 flex flex-col items-start">
            <div className="flex items-center gap-4 mb-3">
                <h1 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-2xl text-glow">{profile?.name || 'Member'}</h1>
                <div className="bg-[#8B0000]/30 backdrop-blur-xl p-2 rounded-full border border-[#8B0000]/40 glow-red">
                  <ShieldCheck size={24} className="text-[#FF0000]" />
                </div>
            </div>
            
            <div className="flex items-center gap-4 text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5">
                <span className="text-gradient-red">@{profile?.username || 'member'}</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                <div className="flex items-center gap-1.5">
                   <MapPin size={10} className="text-[#8B0000]" />
                   <span className="opacity-60">{profile?.location || 'Undisclosed'}</span>
                </div>
            </div>

            {isOwnProfile && (
                <button onClick={() => setIsEditing(true)} className="btn-reflective px-10 py-4 bg-white/10 backdrop-blur-2xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] active:scale-95 transition-all hover:bg-white/20 shadow-2xl">
                  Adjust Protocols
                </button>
            )}
        </div>
      </div>

      <div className="px-10 py-16 space-y-20 relative z-20">
        {/* Biography Section */}
        <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700">Inner Statement</h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-900 to-transparent"></div>
            </div>
            <p className="text-[17px] font-medium leading-[1.8] italic text-zinc-300 opacity-90 max-w-lg drop-shadow-sm">
              "{profile?.bio || "This member maintains a confidential status within the Inner Circle."}"
            </p>
        </div>

        {/* Actionable Social Connection Grid */}
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-zinc-700 leading-none">External Linkages</h3>
                  <span className="text-[8px] font-black text-[#8B0000] tracking-[0.3em] uppercase opacity-60">Verified Channels</span>
                </div>
                <Fingerprint size={24} className="text-zinc-800" />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {profile?.socials?.instagram && (
                <button 
                    onClick={() => openSocial(`https://instagram.com/${profile.socials?.instagram}`)} 
                    className="w-full py-6 glass-panel rounded-3xl flex items-center justify-between px-8 active:scale-[0.98] transition-all hover:border-pink-500/40 group shadow-2xl hover-scale"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-600 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(219,39,119,0.5)]">
                        <Instagram size={24} className="text-pink-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1.5">
                      <span className="text-xs font-black tracking-[0.2em] uppercase">Instagram</span>
                      <span className="text-[10px] font-black text-zinc-500 tracking-tighter opacity-60">Visual Archive</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-zinc-300 tracking-tighter italic opacity-40 group-hover:opacity-100 transition-opacity">@{profile.socials.instagram}</span>
                </button>
              )}
              {profile?.socials?.whatsapp && (
                <button 
                    onClick={() => openSocial(`https://wa.me/${profile.socials?.whatsapp}`)} 
                    className="w-full py-6 glass-panel rounded-3xl flex items-center justify-between px-8 active:scale-[0.98] transition-all hover:border-green-500/40 group shadow-2xl hover-scale"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-600 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(22,163,74,0.5)]">
                        <MessageCircle size={24} className="text-green-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1.5">
                      <span className="text-xs font-black tracking-[0.2em] uppercase">Direct Feed</span>
                      <span className="text-[10px] font-black text-zinc-500 tracking-tighter opacity-60">WhatsApp Communication</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-zinc-300 tracking-tighter italic opacity-40 group-hover:opacity-100 transition-opacity">{profile.socials.whatsapp}</span>
                </button>
              )}
              {profile?.socials?.tiktok && (
                <button 
                    onClick={() => openSocial(`https://tiktok.com/@${profile.socials?.tiktok}`)} 
                    className="w-full py-6 glass-panel rounded-3xl flex items-center justify-between px-8 active:scale-[0.98] transition-all hover:border-white/20 group shadow-2xl hover-scale"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <Globe size={24} className="text-white group-hover:text-black transition-colors" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1.5">
                      <span className="text-xs font-black tracking-[0.2em] uppercase">Motion Stream</span>
                      <span className="text-[10px] font-black text-zinc-500 tracking-tighter opacity-60">TikTok Presence</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-zinc-300 tracking-tighter italic opacity-40 group-hover:opacity-100 transition-opacity">@{profile.socials.tiktok}</span>
                </button>
              )}
              {profile?.socials?.x && (
                <button 
                    onClick={() => openSocial(`https://x.com/${profile.socials?.x}`)} 
                    className="w-full py-6 glass-panel rounded-3xl flex items-center justify-between px-8 active:scale-[0.98] transition-all hover:border-zinc-500/40 group shadow-2xl hover-scale"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <Twitter size={24} className="text-white group-hover:text-black transition-colors" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1.5">
                      <span className="text-xs font-black tracking-[0.2em] uppercase">X-Protocol</span>
                      <span className="text-[10px] font-black text-zinc-500 tracking-tighter opacity-60">Status Updates</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-zinc-300 tracking-tighter italic opacity-40 group-hover:opacity-100 transition-opacity">@{profile.socials.x}</span>
                </button>
              )}
              {profile?.socials?.onlyfans && (
                <button 
                    onClick={() => openSocial(`https://onlyfans.com/${profile.socials?.onlyfans}`)} 
                    className="btn-reflective w-full py-7 bg-gradient-to-r from-[#8B0000] to-[#500000] rounded-3xl flex items-center justify-between px-8 active:scale-[0.98] transition-all shadow-2xl premium-glow glow-red"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                        <Lock size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1.5">
                      <span className="text-xs font-black tracking-[0.3em] uppercase text-white">Privileged Vault</span>
                      <span className="text-[10px] font-black text-white/50 tracking-tighter">OnlyFans Subscription</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-white/40 tracking-tighter italic">@{profile.socials.onlyfans}</span>
                </button>
              )}
              {(!profile?.socials || Object.values(profile.socials).every(v => !v)) && (
                <div className="py-20 flex flex-col items-center justify-center gap-6 glass-panel rounded-[3rem] border border-dashed border-white/5 opacity-30">
                   <div className="p-5 rounded-full bg-zinc-900">
                     <Lock size={32} className="text-zinc-700" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-500">Connection Linkages Offline</p>
                </div>
              )}
            </div>
        </div>

        {/* Confidential Footer */}
        <div className="pt-20 pb-10 flex flex-col items-center gap-8 opacity-20 text-center">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#8B0000] to-transparent"></div>
            <p className="text-[8px] font-black uppercase tracking-[1em] text-zinc-600">Established 2025 • Anonymous Identity Network</p>
            <div className="flex items-center gap-6">
              <ShieldCheck size={16} />
              <Lock size={16} />
              <Fingerprint size={16} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
