
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { Camera, CheckCircle2, Edit3, MapPin, Plus, Image as ImageIcon, Play, LogOut, Grid, Trash2 } from 'lucide-react';
import { UserProfile, Post } from '../types';

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Form state for editing
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Media Upload State for new moments
  const [isUploadingMoment, setIsUploadingMoment] = useState(false);
  const [momentFile, setMomentFile] = useState<File | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const userUid = auth.currentUser.uid;
    
    // Fetch user profile data
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
          setIsEditing(true); // First time setup if doc doesn't exist
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    // Real-time listener for the user's posts (moments)
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
    const resourceType = f.type.startsWith('video/') ? 'video' : (f.type.startsWith('audio/') ? 'video' : 'image');
    const response = await fetch(`https://api.cloudinary.com/v1_1/ds2mbrzcn/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.secure_url;
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    if (!profileFile && !profile?.image) return alert("A profile photo is required.");
    
    setLoading(true);
    setSaveStatus('idle');
    
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
      
      setProfile({ id: auth.currentUser.uid, ...updatedProfile } as UserProfile);
      setSaveStatus('success');
      setProfileFile(null);
      
      // Navigate to View mode after a short delay for visual feedback
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false);
      }, 800);
    } catch (err: any) {
      console.error(err);
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
        url,
        type: momentFile.type.startsWith('video/') ? 'video' : 'image',
        timestamp: Date.now()
      });
      setMomentFile(null);
      setIsUploadingMoment(false);
    } catch (err) {
      console.error(err);
      alert("Failed to upload. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen bg-black fade-in overflow-y-auto pb-32">
        <header className="px-6 py-6 border-b border-white/5 glass-panel sticky top-0 z-20 flex justify-between items-center">
          <h2 className="text-xl font-black italic tracking-widest uppercase">Profile Settings</h2>
          {profile && (
             <button onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Cancel</button>
          )}
        </header>

        <div className="p-8 space-y-8 flex flex-col items-center max-w-sm mx-auto w-full">
          <div className="relative w-40 h-40 rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center border-2 border-zinc-800 shadow-2xl group">
            {profileFile ? (
              <img src={URL.createObjectURL(profileFile)} className="w-full h-full object-cover" />
            ) : profile?.image ? (
              <img src={profile.image} className="w-full h-full object-cover" />
            ) : (
              <Camera size={40} className="text-zinc-700" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera size={24} className="text-white" />
            </div>
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="w-full space-y-5">
            <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest px-1">Display Name</label>
                <input 
                    placeholder="e.g. Maverick"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm focus:outline-none focus:border-[#8B0000] transition-colors text-white"
                />
            </div>
            <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest px-1">Age</label>
                    <input 
                        placeholder="21"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm focus:outline-none focus:border-[#8B0000] transition-colors text-white"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest px-1">Location</label>
                    <input 
                        placeholder="City"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm focus:outline-none focus:border-[#8B0000] transition-colors text-white"
                    />
                </div>
            </div>
            <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest px-1">Bio</label>
                <textarea 
                    placeholder="Share your interests..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm h-32 focus:outline-none focus:border-[#8B0000] transition-colors resize-none text-white leading-relaxed"
                />
            </div>

            <button 
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs uppercase tracking-[0.3em] active:scale-95 premium-glow transition-all flex items-center justify-center gap-3"
            >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : saveStatus === 'success' ? (
                  <><CheckCircle2 size={18} /> Profile Saved</>
                ) : (
                  'Lock In Identity'
                )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black fade-in pb-24">
      {/* Dynamic Header */}
      <div className="relative h-96 w-full overflow-hidden shadow-2xl">
        {profile?.image ? (
            <img src={profile.image} className="w-full h-full object-cover" alt="Profile" />
        ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <ImageIcon size={64} className="text-zinc-800" />
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        {/* Actions */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <button 
              onClick={() => auth.signOut()}
              className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 active:scale-90 text-zinc-400"
          >
              <LogOut size={20} />
          </button>
          <button 
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-full flex items-center gap-2 border border-white/10 active:scale-90"
          >
              <Edit3 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Edit Profile</span>
          </button>
        </div>

        {/* Name/Age Overlay */}
        <div className="absolute bottom-10 left-8 right-8 text-left">
            <h1 className="text-5xl font-black italic tracking-tighter mb-2 text-white drop-shadow-lg">
                {profile?.name || 'New Member'}, {profile?.age || '--'}
            </h1>
            <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-[0.2em] text-xs">
                <MapPin size={14} className="text-[#8B0000]" />
                <span>{profile?.location || 'Undisclosed'}</span>
            </div>
        </div>
      </div>

      <div className="px-8 py-10 space-y-12 text-left">
        {/* Bio */}
        <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 border-l-2 border-[#8B0000] pl-3">Biography</h3>
            <p className="text-[15px] font-medium leading-relaxed italic text-zinc-400 opacity-90 max-w-md">
                "{profile?.bio || "Tell the club about yourself..."}"
            </p>
        </div>

        {/* Moments Section - "Upload more photos and videos" */}
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Exclusive Moments</h3>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{posts.length} Media items</p>
                </div>
                <button 
                    onClick={() => setIsUploadingMoment(true)}
                    className="flex items-center gap-2 bg-[#8B0000] px-4 py-2.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest active:scale-95"
                >
                    <Plus size={16} /> Add Moments
                </button>
            </div>

            {isUploadingMoment && (
                <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New Moment</span>
                        <button onClick={() => setIsUploadingMoment(false)} className="text-zinc-600 font-black text-[10px] uppercase">Cancel</button>
                    </div>
                    <div className="relative h-48 bg-zinc-900/50 rounded-2xl overflow-hidden border border-dashed border-zinc-800 flex items-center justify-center group">
                        {momentFile ? (
                            momentFile.type.startsWith('video/') ? (
                                <video src={URL.createObjectURL(momentFile)} className="w-full h-full object-cover" autoPlay muted loop />
                            ) : (
                                <img src={URL.createObjectURL(momentFile)} className="w-full h-full object-cover" />
                            )
                        ) : (
                            <div className="flex flex-col items-center gap-3 opacity-30">
                                <ImageIcon size={32} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Select photo or video</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*,video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => setMomentFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    {momentFile && (
                        <button 
                            onClick={handleUploadMoment}
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl active:scale-95"
                        >
                            {loading ? 'Transmitting...' : 'Post to Private Feed'}
                        </button>
                    )}
                </div>
            )}

            {posts.length === 0 ? (
                <div className="h-64 bg-zinc-950/30 border border-dashed border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center gap-4 opacity-40">
                    <Grid size={40} className="text-zinc-800" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Your gallery is empty</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="relative aspect-[4/5] bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 shadow-xl group">
                            {post.type === 'video' ? (
                                <video src={post.url} className="w-full h-full object-cover" muted loop />
                            ) : (
                                <img src={post.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Moment" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {post.type === 'video' && (
                                <div className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
                                    <Play size={12} fill="currentColor" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Branding Footer */}
        <div className="pt-20 flex flex-col items-center gap-8 opacity-40 pb-10">
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">MEMBER ID • {auth.currentUser?.uid.slice(0, 10).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
