
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { Camera, CheckCircle2, Edit3, MapPin, Plus, Image as ImageIcon, Play, LogOut, Grid, ShieldCheck } from 'lucide-react';
import { UserProfile, Post } from '../types';

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
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
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen bg-black fade-in overflow-y-auto pb-32">
        <header className="px-6 py-8 border-b border-white/5 glass-panel sticky top-0 z-20 flex justify-between items-center">
          <h2 className="text-xl font-black italic tracking-widest uppercase">Member Onboarding</h2>
          {profile && <button onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase text-zinc-500">Close</button>}
        </header>

        <div className="p-8 space-y-10 flex flex-col items-center max-w-sm mx-auto w-full">
          <div className="relative w-44 h-44 rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center border-2 border-zinc-800 shadow-2xl group ring-4 ring-[#8B0000]/10">
            {profileFile ? (
              <img src={URL.createObjectURL(profileFile)} className="w-full h-full object-cover" />
            ) : profile?.image ? (
              <img src={profile.image} className="w-full h-full object-cover" />
            ) : (
              <Camera size={40} className="text-zinc-700" />
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} />
          </div>

          <div className="w-full space-y-6">
            <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.3em] px-1">Pseudonym</label>
                <input placeholder="Your club name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#8B0000]/50 transition-colors text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.3em] px-1">Age</label>
                    <input placeholder="21" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-sm focus:outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.3em] px-1">Location</label>
                    <input placeholder="City" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-sm focus:outline-none" />
                </div>
            </div>
            <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.3em] px-1">Secret Bio</label>
                <textarea placeholder="Tell your story..." value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-sm h-32 focus:outline-none resize-none" />
            </div>

            <button onClick={handleSaveProfile} disabled={loading} className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs uppercase tracking-[0.4em] active:scale-95 premium-glow disabled:opacity-50">
                {loading ? 'Authenticating...' : saveStatus === 'success' ? 'Profile Verified' : 'Complete Registration'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black fade-in pb-24">
      <div className="relative h-[450px] w-full overflow-hidden shadow-2xl">
        {profile?.image ? <img src={profile.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-900" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <button onClick={() => auth.signOut()} className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 active:scale-90 text-zinc-400"><LogOut size={20} /></button>
          <button onClick={() => setIsEditing(true)} className="px-5 py-3 bg-white/10 backdrop-blur-xl rounded-full flex items-center gap-2 border border-white/10 active:scale-90"><Edit3 size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Settings</span></button>
        </div>

        <div className="absolute bottom-12 left-8 right-8 text-left">
            <div className="flex items-center gap-2 mb-2">
                <h1 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-2xl">{profile?.name || 'New Member'}, {profile?.age || '--'}</h1>
                <ShieldCheck size={20} className="text-[#8B0000]" />
            </div>
            <div className="flex items-center gap-2 text-zinc-300 font-black uppercase tracking-[0.2em] text-[10px]">
                <MapPin size={14} className="text-[#8B0000]" />
                <span>{profile?.location || 'Undisclosed'}</span>
                <span className="mx-2 opacity-30">•</span>
                <span className="text-[#8B0000]">@{profile?.username || 'member'}</span>
            </div>
        </div>
      </div>

      <div className="px-8 py-10 space-y-12">
        <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-700">Membership Details</h3>
            <p className="text-sm font-medium leading-relaxed italic text-zinc-400 opacity-90">"{profile?.bio || "Confidential member profile."}"</p>
        </div>

        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-700">Personal Gallery</h3>
                <button onClick={() => setIsUploadingMoment(true)} className="text-[#8B0000] text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Plus size={16} /> Add Moments</button>
            </div>

            {isUploadingMoment && (
                <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between mb-4"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">New Content</span><button onClick={() => setIsUploadingMoment(false)} className="text-zinc-700 text-[10px] font-black">Cancel</button></div>
                    <div className="relative h-48 bg-zinc-900/50 rounded-2xl overflow-hidden border border-dashed border-zinc-800 flex items-center justify-center">
                        {momentFile ? <img src={URL.createObjectURL(momentFile)} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="opacity-20" />}
                        <input type="file" accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setMomentFile(e.target.files?.[0] || null)} />
                    </div>
                    {momentFile && <button onClick={handleUploadMoment} className="w-full mt-4 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl">Transmit to Gallery</button>}
                </div>
            )}

            <div className="grid grid-cols-3 gap-1">
                {posts.map(post => (
                    <div key={post.id} className="relative aspect-square bg-zinc-900 overflow-hidden group">
                        <img src={post.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        {post.type === 'video' && <div className="absolute top-2 right-2"><Play size={10} fill="currentColor" /></div>}
                    </div>
                ))}
            </div>
        </div>

        <div className="pt-20 flex flex-col items-center gap-6 opacity-40 pb-10">
            <div className="h-[1px] w-12 bg-zinc-800"></div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600">ID: {auth.currentUser?.uid.slice(0, 12).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
