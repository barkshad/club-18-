
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { Camera, Send, X, Image as ImageIcon, Play, CheckCircle2 } from 'lucide-react';

const CreatePostScreen: React.FC<{onSuccess: () => void}> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

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

  const handlePublish = async () => {
    if (!file || !auth.currentUser) return;
    setLoading(true);
    try {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userSnap.data();

      const url = await uploadToCloudinary(file);
      await addDoc(collection(db, "posts"), {
        uid: auth.currentUser.uid,
        userName: userData?.name || 'Member',
        userImage: userData?.image || '',
        url,
        caption,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        timestamp: Date.now()
      });
      setStatus('success');
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      console.error(err);
      alert("Transmission failed. Please check network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black fade-in p-8">
      <header className="flex justify-between items-center mb-10">
        <h2 className="text-xl font-black uppercase tracking-widest italic">New Moment</h2>
        <button onClick={() => onSuccess()} className="text-zinc-600"><X size={24} /></button>
      </header>

      <div className="flex-1 space-y-8 flex flex-col">
        <div className="relative aspect-square bg-zinc-900/50 rounded-3xl overflow-hidden border border-dashed border-zinc-800 flex items-center justify-center group transition-all hover:border-[#8B0000]/50">
          {file ? (
            file.type.startsWith('video/') ? (
              <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" controls />
            ) : (
              <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="flex flex-col items-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Camera size={48} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Capture Moment</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*,video/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="space-y-4">
          <textarea 
            placeholder="Add a cryptic caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-zinc-300 text-sm italic h-24 resize-none leading-relaxed"
          />
          <div className="h-[1px] w-full bg-zinc-900"></div>
        </div>

        <button 
          onClick={handlePublish}
          disabled={!file || loading}
          className="w-full py-5 bg-[#8B0000] text-white rounded-full font-black text-xs uppercase tracking-[0.4em] active:scale-95 disabled:opacity-20 premium-glow flex items-center justify-center gap-3"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : status === 'success' ? (
             <><CheckCircle2 size={18} /> Published</>
          ) : (
            <><Send size={18} /> Transmit</>
          )}
        </button>
      </div>

      <footer className="text-center opacity-20 text-[8px] font-black uppercase tracking-[0.5em] mt-10">
        End-to-End Encrypted Upload
      </footer>
    </div>
  );
};

export default CreatePostScreen;
