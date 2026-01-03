
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { Camera, CheckCircle2, Edit3, MapPin, Plus, Image as ImageIcon, Play, LogOut, Grid, ShieldCheck, Fingerprint } from 'lucide-react';
import { UserProfile, Post } from '../types';

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [username, setUsername] = useState('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [isUploadingMoment, setIsUploadingMoment] = useState(false);
  const [momentFile, setMomentFile] = useState<File | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const userUid = auth.currentUser.uid;
    
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userUid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setName(data.name || '');
          setUsername(data.username || '');
          setAge(data.age?.toString() || '');
          setBio(data.bio || '');
          setLocation(data.location || '');
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    const q = query(
      collection(db, "posts"),
      where("uid", "==", userUid),
      orderBy("timestamp", "desc")
    );
    const unsubPosts = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    });

    fetchProfile();
    return () => unsubPosts();
  }, []);

  const uploadToCloudinary = async (f: File) => {
    const formData = new FormData();
    formData.append('file', f);
    formData.append('upload_preset', 'real_unsigned');
    const resourceType = f.type.startsWith('video/') ? 'video' : 'image';
    const response = await fetch(`https://api.cloudinary.com/v1_1/ds2mbrzcn/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data.secure_url;
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      let url = profile?.image || '';
      if (profileFile) {
        url = await uploadToCloudinary(profileFile);
      }

      const updatedProfile = {
        name, 
        username: username.toLowerCase().replace(/\s/g, ''),
        age: parseInt(age), 
        bio, 
        location, 
        image: url,
        updatedAt: Date.now()
      };

      await setDoc(doc(db, "users", auth.currentUser.uid), updatedProfile, { merge: true });
      setProfile({ ...profile, ...updatedProfile } as UserProfile);
      setSaveStatus('success');
      setTimeout(() => {
        setIsEditing(false);
        setSaveStatus('idle');
      }, 800);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMoment = async () => {
    if (!momentFile || !auth.currentUser) return;
    setLoading(true);
    try {
      const url = await uploadToCloudinary(momentFile);
      await addDoc(collection(db, "posts"), {
        uid: auth.currentUser.uid,
        userName: profile?.name || 'Member',
        userImage: profile?.image || '',
        url,
        type: momentFile.type.startsWith('video/') ? 'video' : 'image',
        timestamp: Date.now()
      });
      setMomentFile(null);
      setIsUploadingMoment(false);
    } catch (err) {
      alert("Transmission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen bg-black fade-in overflow-y-auto pb-32 text-white">
        <header className="px-8 py-10 border-b border-white/5 glass-panel sticky top-0 z-20 flex justify-between items-center">
          <h2 className="text-xl font-black italic tracking-[0.2em] uppercase">Identity Setup</h2>
          {profile && <button onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Protocol Exit</button>}
        </header>

        <div className="p-8 space-y-12 flex flex-col items-center max-w-sm mx-auto w-full">
          <div className="relative w-48 h-48 rounded-full bg-zinc-950 overflow-hidden flex items-center justify-center border-2 border-zinc-900 shadow-2xl group ring-8 ring-[#8B0000]/5">
            {profileFile ? (
              <img src={URL.createObjectURL(profileFile)} className="w-full h-full object-cover" />
            ) : profile?.image ? (
              <img src={profile.image} className="w-full h-full object-cover" />
            ) : (
              <Camera size={40} className="text-zinc-800" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
               <Camera size={24} className="text-white" />
            </div>
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} />
          </div>

          <div className="w-full space-y-6">
            <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-black text-zinc-700 tracking-[0.4em] px-1">Display Pseudonym</label>
                <input placeholder="Member Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 transition-colors text-white" />
            </div>
            <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-black text-zinc-700 tracking-[0.4em] px-1">Club Handle</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-xs">@</span>
                  <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 pl-10 text-xs font-bold tracking-widest focus:outline-none focus:border-[#8B0000]/50 transition-colors text-white" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-700 tracking-[0.4em] px-1">Age</label>
                    <input placeholder="21" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-xs font-bold focus:outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-700 tracking-[0.4em] px-1">Base Location</label>
                    <input placeholder="City" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-xs font-bold focus:outline-none" />
                </div>
            </div>
            <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-black text-zinc-700 tracking-[0.4em] px-1">Club Statement</label>
                <textarea placeholder="Your story..." value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-xs font-medium leading-relaxed h-36 focus:outline-none resize-none" />
            </div>

            <button onClick={handleSaveProfile} disabled={loading} className="w-full py-6 bg-[#8B0000] text-white rounded-full font-black text-xs uppercase tracking-[0.4em] active:scale-95 premium-glow disabled:opacity-50 shadow-2xl">
                {loading ? 'Processing Protocol...' : saveStatus === 'success' ? 'Protocol Success' : 'Finalize Identity'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black fade-in pb-32 text-white">
      {/* High Impact Profile Header */}
      <div className="relative h-[550px] w-full overflow-hidden shadow-2xl">
        {profile?.image ? <img src={profile.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-950" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        
        {/* Floating Actions */}
        <div className="absolute top-10 left-8 right-8 flex justify-between items-center z-10">
          <button 
            onClick={() => auth.signOut()} 
            className="w-14 h-14 bg-black/40 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/5 active:scale-90 text-zinc-500 hover:text-[#8B0000] transition-colors shadow-2xl"
          >
            <LogOut size={22} />
          </button>
          <button 
            onClick={() => setIsEditing(true)} 
            className="px-6 py-4 bg-white/10 backdrop-blur-2xl rounded-full flex items-center gap-3 border border-white/10 active:scale-90 transition-all hover:bg-white/20"
          >
            <Edit3 size={18} className="text-[#8B0000]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Profile Protocol</span>
          </button>
        </div>

        {/* Identity Plate */}
        <div className="absolute bottom-16 left-10 right-10 text-left">
            <div className="flex items-center gap-3 mb-3">
                <h1 className="text-6xl font-black italic tracking-tighter text-white drop-shadow-2xl">{profile?.name || 'Member'}, {profile?.age || '--'}</h1>
                <div className="w-8 h-8 rounded-full bg-[#8B0000]/20 flex items-center justify-center border border-[#8B0000]/50">
                   <ShieldCheck size={18} className="text-[#8B0000]" />
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px]">
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#8B0000]" />
                    <span>{profile?.location || 'Undisclosed'}</span>
                </div>
                <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                <span className="text-[#8B0000] italic">@{profile?.username || 'member'}</span>
            </div>
        </div>
      </div>

      <div className="px-10 py-12 space-y-16">
        {/* Biography Section */}
        <div className="space-y-6">
            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-700 border-l-2 border-[#8B0000] pl-4">Statement</h3>
            <p className="text-[15px] font-medium leading-[1.8] italic text-zinc-400 opacity-90 max-w-lg">
              "{profile?.bio || "This member has not yet released their club statement. Confidential profiles remain discreet by default."}"
            </p>
        </div>

        {/* Exclusive Moments Gallery */}
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-700">Moments</h3>
                  <p className="text-[9px] font-bold text-zinc-500 tracking-[0.3em] uppercase">{posts.length} EXCLUSIVE ITEMS</p>
                </div>
                <button 
                  onClick={() => setIsUploadingMoment(true)} 
                  className="bg-[#8B0000] px-6 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-2xl premium-glow"
                >
                  <Plus size={18} /> Add New
                </button>
            </div>

            {isUploadingMoment && (
                <div className="p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] animate-in slide-in-from-top-4 zoom-in-95 duration-500 shadow-2xl relative">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Moment Protocol</span>
                      <button onClick={() => setIsUploadingMoment(false)} className="text-zinc-700 hover:text-white transition-colors"><Grid size={20} /></button>
                    </div>
                    <div className="relative h-60 bg-zinc-900/50 rounded-3xl overflow-hidden border border-dashed border-zinc-800 flex items-center justify-center group transition-all hover:border-[#8B0000]/50">
                        {momentFile ? (
                          <div className="w-full h-full relative">
                            {momentFile.type.startsWith('video/') ? (
                              <video src={URL.createObjectURL(momentFile)} className="w-full h-full object-cover" autoPlay muted loop />
                            ) : (
                              <img src={URL.createObjectURL(momentFile)} className="w-full h-full object-cover" />
                            )}
                            <button onClick={() => setMomentFile(null)} className="absolute top-4 right-4 bg-black/60 p-2 rounded-full text-white">X</button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4 opacity-20">
                             <ImageIcon size={40} />
                             <p className="text-[9px] font-black uppercase tracking-[0.4em]">SELECT MEDIA</p>
                          </div>
                        )}
                        <input type="file" accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setMomentFile(e.target.files?.[0] || null)} />
                    </div>
                    {momentFile && (
                      <button 
                        onClick={handleUploadMoment} 
                        disabled={loading}
                        className="w-full mt-6 py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl active:scale-95 transition-all shadow-xl"
                      >
                        {loading ? 'TRANSMITTING...' : 'POST TO GALLERY'}
                      </button>
                    )}
                </div>
            )}

            {posts.length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center gap-6 bg-zinc-950/40 rounded-[3rem] border border-zinc-900 border-dashed opacity-30">
                  <Grid size={40} className="text-zinc-800" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Gallery Awaiting Content</p>
               </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 rounded-3xl overflow-hidden bg-zinc-950">
                  {posts.map(post => (
                      <div key={post.id} className="relative aspect-square bg-zinc-900 overflow-hidden group">
                          {post.type === 'video' ? (
                            <video src={post.url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                          ) : (
                            <img src={post.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" />
                          )}
                          <div className="absolute inset-0 bg-[#8B0000]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {post.type === 'video' && <div className="absolute top-3 right-3 opacity-60"><Play size={12} fill="white" className="text-white" /></div>}
                      </div>
                  ))}
              </div>
            )}
        </div>

        {/* Premium Footer with Member ID */}
        <div className="pt-24 flex flex-col items-center gap-10 opacity-40 pb-20">
            <div className="w-16 h-16 rounded-full border border-dashed border-zinc-800 flex items-center justify-center">
               <Fingerprint size={24} className="text-zinc-800" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600">MEMBER IDENTIFICATION</p>
              <div className="px-6 py-2 bg-zinc-900/50 rounded-full border border-white/5">
                <p className="text-[12px] font-black italic tracking-[0.1em] text-white">ID: {auth.currentUser?.uid.slice(0, 15).toUpperCase()}</p>
              </div>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.8em] text-zinc-800 pt-10">EST. 2025 • CLUB 18+</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
