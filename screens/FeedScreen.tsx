
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { ShieldCheck, Zap, Instagram, MessageCircle, Twitter, Lock, Globe } from 'lucide-react';
import { UserProfile } from '../types';

const FeedScreen: React.FC<{onMemberTap: (uid: string) => void}> = ({ onMemberTap }) => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
        .filter(m => m.image && m.status === 'verified_member')
      );
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-black">
      <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#8B0000] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col bg-black min-h-screen fade-in text-white pb-20">
      <header className="sticky top-0 z-40 glass-panel px-5 py-4 flex justify-between items-center border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter italic">CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span></h1>
        <Zap size={20} className="text-white opacity-40" />
      </header>

      <div className="flex flex-col gap-px bg-white/5">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
             <ShieldCheck size={48} className="text-zinc-600 mb-6" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Establishing Directory...</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="bg-black" onClick={() => onMemberTap(member.id)}>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 p-[1.5px] overflow-hidden">
                    <img src={member.image} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold text-white">@{member.username}</span>
                      <ShieldCheck size={12} className="text-[#8B0000]" />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter pt-1">{member.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="media-container relative aspect-[4/5] bg-zinc-950 overflow-hidden cursor-pointer">
                <img src={member.image} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <p className="text-sm font-medium italic text-zinc-300 line-clamp-2 mb-4">"{member.bio || 'Confidential Member Profile'}"</p>
                  <div className="flex gap-3 opacity-60">
                    {member.socials?.instagram && <Instagram size={18} />}
                    {member.socials?.whatsapp && <MessageCircle size={18} />}
                    {member.socials?.tiktok && <Globe size={18} />}
                    {member.socials?.x && <Twitter size={18} />}
                    {member.socials?.onlyfans && <Lock size={18} />}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 flex items-center justify-between">
                 <span className="text-[9px] text-zinc-700 font-black uppercase tracking-widest italic">Club Member Since 2025</span>
                 <button className="bg-[#8B0000] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">View Socials</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedScreen;
