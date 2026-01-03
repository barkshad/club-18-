import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { Camera, CheckCircle2, AlertCircle, Edit3, MapPin, Plus, Image as ImageIcon, Play, LogOut, Grid } from 'lucide-react';
import { UserProfile, Post } from '../types';

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Media Upload State
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
          setIsEditing(false);
        } else {
          setIsEditing(true); // First time setup
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
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.secure_url;
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    if (!file && !profile?.image) return alert("Please upload a profile photo.");
    
    setLoading(true);
    setSaveStatus('idle');
    
    try {
      let url = profile?.image || '';
      if (file) {
        url = await uploadToCloudinary(file);
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
      setFile(null);
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false); // Take user to View mode after saving
      }, 1000);
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
      alert("Moment upload failed.");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="p-8 space-y-6 flex flex-col items-center max-w-sm mx-auto min-h-screen bg-black fade-in pb-24">
        <h2 className="text-2xl font-black uppercase tracking-widest italic mt-4">Settings</h2>
        
        <div className="relative w-36 h-36 rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center border-2 border-zinc-800 shadow-2xl group">
          {file ? (
            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
          ) : profile?.image ? (
            <img src={profile.image} className="w-full h-full object-cover" />
          ) : (
            <Camera size={32} className="text-zinc-700" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera size={24} className="text-white" />
          </div>
          <input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="w-full space-y-4">
          <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest px-1">Display Name</label>
              <input 
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm focus:outline-none focus:border-[#8B0000] transition-colors text-white"
              />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest px-1">Age</label>
                  <input 
                      placeholder="21"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm focus:outline-none focus:border-[#8B0000] transition-colors text-white"
                  />
              </div>
              <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest px-1">Location</label>
                  <input 
                      placeholder="City"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm focus:outline-none focus:border-[#8B0000] transition-colors text-white"
                  />
              </div>
          </div>
          <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest px-1">About Me</label>
              <textarea 
                  placeholder="Tell your story..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm h-28 focus:outline-none focus:border-[#8B0000] transition-colors resize-none text-white"
              />
          </div>

          <div className="flex gap-4 pt-2">
              {profile && (
                <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 rounded-full font-black text-[10px] uppercase tracking-widest border border-zinc-800 text-zinc-500"
                >
                    Cancel
                </button>
              )}
              <button 
                  onClick={handleSave}
                  disabled={loading}
                  className={`${profile ? 'flex-[2]' : 'w-full'} py-4 bg-[#8B0000] text-white rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 premium-glow disabled:opacity-50`}
              >
                  {loading ? 'Processing...' : 'Save Member Data'}
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black fade-in pb-20">
      {/* Header / Profile Cover */}
      <div className="relative h-80 w-full overflow-hidden">
        {profile?.image ? (
            <img src={profile.image} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <ImageIcon size={48} className="text-zinc-800" />
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-90"
        >
            <Edit3 size={18} />
        </button>
        
        <button 
            onClick={() => auth.signOut()}
            className="absolute top-6 left-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-90"
        >
            <LogOut size={18} className="text-zinc-400" />
        </button>

        <div className="absolute bottom-6 left-8 right-8 text-left">
            <h1 className="text-4xl font-black italic tracking-tighter mb-1 text-white">
                {profile?.name || 'New Member'}, {profile?.age || '--'}
            </h1>
            <div className="flex items-center gap-1.5 text-zinc-400">
                <MapPin size={12} className="text-[#8B0000]" />
                <span className="text-[10px] font-black uppercase tracking-widest">{profile?.location || 'Undisclosed'}</span>
            </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8 text-left">
        {/* Bio */}
        <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Confidential Bio</h3>
            <p className="text-sm font-medium leading-relaxed italic text-zinc-300 opacity-90">
                {profile?.bio || "No biography provided yet."}
            </p>
        </div>

        {/* Moments Section */}
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Exclusive Moments</h3>
                    <div className="px-1.5 py-0.5 rounded-full bg-zinc-900 border border-white/5 text-[8px] font-black text-zinc-500 uppercase tracking-tighter">
                        {posts.length} Media
                    </div>
                </div>
                <button 
                    onClick={() => setIsUploadingMoment(true)}
                    className="flex items-center gap-1.5 text-[#8B0000] text-[10px] font-black uppercase tracking-widest active:scale-95"
                >
                    <Plus size={14} /> Add Content
                </button>
            </div>

            {isUploadingMoment && (
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">New Moment Upload</span>
                        <button onClick={() => setIsUploadingMoment(false)} className="text-zinc-700 font-black text-[10px]">Close</button>
                    </div>
                    <div className="relative h-40 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                        {momentFile ? (
                            momentFile.type.startsWith('video/') ? (
                                <video src={URL.createObjectURL(momentFile)} className="w-full h-full object-cover" controls />
                            ) : (
                                <img src={URL.createObjectURL(momentFile)} className="w-full h-full object-cover" />
                            )
                        ) : (
                            <Camera size={24} className="text-zinc-800" />
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
                            className="w-full py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full disabled:opacity-50"
                        >
                            {loading ? 'Uploading...' : 'Publish to Private Feed'}
                        </button>
                    )}
                </div>
            )}

            {posts.length === 0 ? (
                <div className="h-40 bg-zinc-950 border border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-40">
                    <Grid size={24} className="text-zinc-800" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Your gallery is empty</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {posts.map(post => (
                        <div key={post.id} className="relative aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 shadow-lg group">
                            {post.type === 'video' ? (
                                <video src={post.url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={post.url} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {post.type === 'video' && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
                                    <Play size={10} fill="currentColor" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Security / Verification footer */}
        <div className="pt-10 flex flex-col items-center gap-6 opacity-40">
            <div className="h-[1px] w-20 bg-zinc-900"></div>
            <div className="flex flex-col items-center gap-2">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Member ID: {auth.currentUser?.uid.slice(0, 8)}</p>
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[#8B0000]">Status: Exclusive Elite</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;