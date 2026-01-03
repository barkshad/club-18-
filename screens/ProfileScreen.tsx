
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Camera, Edit3, MapPin, Instagram, MessageCircle, Twitter, Globe, Lock, LogOut, ArrowLeft, Trash2, ShieldCheck, X } from 'lucide-react';
import { UserProfile, Post } from '../types';

const ProfileScreen: React.FC<{userId: string, onBack: () => void}> = ({ userId, onBack }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit state
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

    const q = query(collection(db, "posts"), where("uid", "==", userId));
    const unsubPosts = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    });

    fetchProfile();
    return () => unsubPosts();
  }, [userId]);

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

  if (loading) return <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin"></div></div>;

  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen bg-black fade-in overflow-y-auto pb-32 text-white p-8">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black italic uppercase tracking-widest">Edit Profile</h2>
          <button onClick={() => setIsEditing(false)} className="text-zinc-500"><X size={24} /></button>
        </header>
        <div className="space-y-6 max-w-sm mx-auto w-full">
          <div className="space-y-4">
            <input placeholder="NAME" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none" />
            <input placeholder="USERNAME" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none" />
            <textarea placeholder="BIO" value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-xs font-medium text-white h-24 focus:outline-none resize-none" />
            
            <div className="h-[1px] w-full bg-zinc-900 my-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Social Handles</p>
            
            <input placeholder="INSTAGRAM" value={ig} onChange={e => setIg(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-[10px] font-bold text-white focus:outline-none" />
            <input placeholder="WHATSAPP" value={wa} onChange={e => setWa(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-[10px] font-bold text-white focus:outline-none" />
            <input placeholder="TIKTOK" value={tt} onChange={e => setTt(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-[10px] font-bold text-white focus:outline-none" />
            <input placeholder="X (TWITTER)" value={x} onChange={e => setX(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-[10px] font-bold text-white focus:outline-none" />
            <input placeholder="ONLYFANS" value={of} onChange={e => setOf(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-[10px] font-bold text-white focus:outline-none" />
          </div>
          <button onClick={handleSave} className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs uppercase tracking-widest active:scale-95 shadow-2xl">Save Changes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black fade-in text-white pb-32">
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img src={profile?.image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="absolute top-8 left-6 right-6 flex justify-between items-center">
          <button onClick={onBack} className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/5 active:scale-90"><ArrowLeft size={22} /></button>
          {isOwnProfile ? (
            <button onClick={() => auth.signOut()} className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/5 active:scale-90"><LogOut size={20} className="text-[#8B0000]" /></button>
          ) : null}
        </div>
        <div className="absolute bottom-10 left-8 right-8">
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black italic tracking-tighter text-white">{profile?.name || 'Member'}</h1>
                <ShieldCheck size={20} className="text-[#8B0000]" />
            </div>
            <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">@{profile?.username || 'member'}</p>
            {isOwnProfile && <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">Edit Socials</button>}
        </div>
      </div>

      <div className="px-8 py-10 space-y-12">
        <div className="space-y-4">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-700">Statement</h3>
            <p className="text-[15px] font-medium leading-relaxed italic text-zinc-400">"{profile?.bio || "Confidential member profile. Membership details are kept discreet."}"</p>
        </div>

        <div className="space-y-6">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-700">Exclusives</h3>
            <div className="space-y-3">
              {profile?.socials?.instagram && (
                <button onClick={() => openSocial(`https://instagram.com/${profile.socials?.instagram}`)} className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-between px-6 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4"><Instagram size={20} className="text-pink-500" /><span className="text-xs font-bold tracking-widest uppercase">Instagram</span></div>
                  <span className="text-[10px] font-black text-zinc-600 tracking-tighter">@{profile.socials.instagram}</span>
                </button>
              )}
              {profile?.socials?.whatsapp && (
                <button onClick={() => openSocial(`https://wa.me/${profile.socials?.whatsapp}`)} className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-between px-6 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4"><MessageCircle size={20} className="text-green-500" /><span className="text-xs font-bold tracking-widest uppercase">WhatsApp</span></div>
                  <span className="text-[10px] font-black text-zinc-600 tracking-tighter">{profile.socials.whatsapp}</span>
                </button>
              )}
              {profile?.socials?.tiktok && (
                <button onClick={() => openSocial(`https://tiktok.com/@${profile.socials?.tiktok}`)} className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-between px-6 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4"><Globe size={20} className="text-white" /><span className="text-xs font-bold tracking-widest uppercase">TikTok</span></div>
                  <span className="text-[10px] font-black text-zinc-600 tracking-tighter">@{profile.socials.tiktok}</span>
                </button>
              )}
              {profile?.socials?.x && (
                <button onClick={() => openSocial(`https://x.com/${profile.socials?.x}`)} className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-between px-6 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4"><Twitter size={20} className="text-white" /><span className="text-xs font-bold tracking-widest uppercase">X</span></div>
                  <span className="text-[10px] font-black text-zinc-600 tracking-tighter">@{profile.socials.x}</span>
                </button>
              )}
              {profile?.socials?.onlyfans && (
                <button onClick={() => openSocial(`https://onlyfans.com/${profile.socials?.onlyfans}`)} className="w-full py-4 bg-[#8B0000] rounded-2xl flex items-center justify-between px-6 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4"><Lock size={20} className="text-white" /><span className="text-xs font-bold tracking-widest uppercase">OnlyFans</span></div>
                  <span className="text-[10px] font-black text-white/50 tracking-tighter">@{profile.socials.onlyfans}</span>
                </button>
              )}
              {!profile?.socials && <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">No social accounts connected yet.</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
