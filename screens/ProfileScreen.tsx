
import React, { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { Camera, Check } from 'lucide-react';

const ProfileScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!auth.currentUser || !file) return alert("Please upload a photo.");
    setLoading(true);
    try {
      const storageRef = ref(storage, `photos/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name, age: parseInt(age), bio, location, image: url
      });
      alert("Profile updated successfully.");
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6 flex flex-col items-center">
      <h2 className="text-2xl font-black uppercase tracking-widest italic">Member Setup</h2>
      
      <div className="relative w-32 h-32 rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center border-2 border-zinc-800">
        {file ? (
          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
        ) : (
          <Camera size={32} className="text-zinc-700" />
        )}
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="w-full space-y-4">
        <input 
          placeholder="Public Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-sm"
        />
        <input 
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-sm"
        />
        <input 
          placeholder="Location (e.g. NYC, London)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-sm"
        />
        <textarea 
          placeholder="Short Bio..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-sm h-24"
        />

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full py-4 bg-[#8B0000] text-white rounded-full font-black text-xs uppercase tracking-widest"
        >
          {loading ? 'Processing...' : 'Complete Profile'}
        </button>
        
        <button onClick={() => auth.signOut()} className="w-full text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Logout</button>
      </div>
    </div>
  );
};

export default ProfileScreen;
