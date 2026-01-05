
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, limit } from 'firebase/firestore';
import { ShieldCheck, Zap, Instagram, MessageCircle, Twitter, Lock, Globe, Fingerprint } from 'lucide-react';
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
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#8B0000] rounded-full animate-spin glow-red"></div>
    </div>
  );

  return (
    <div className="flex flex-col bg-transparent min-h-screen fade-in text-white pb-20">
      <header className="sticky top-0 z-40 glass-panel px-6 py-5 flex justify-between items-center border-b border-white/5 shadow-2xl">
        <h1 className="text-2xl font-black tracking-tighter italic leading-none text-gradient-red">
          CLUB 18<span className="not-italic text-glow ml-1">+</span>
        </h1>
        <div className="flex items-center gap-4">
          <Zap size={18} className="text-white opacity-40 animate-pulse" />
          <Fingerprint size={18} className="text-[#8B0000] opacity-80" />
        </div>
      </header>

      <div className="flex flex-col gap-10 py-8 px-5">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
             <ShieldCheck size={64} className="text-zinc-600 mb-8" />
             <p className="text-[12px] font-black uppercase tracking-[0.6em] text-zinc-500 text-center leading-relaxed">Establishing Member<br/>Directory...</p>
          </div>
        ) : (
          members.map((member) => (
            <div 
              key={member.id} 
              className="glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 hover-scale active:scale-[0.98] transition-all group relative"
              onClick={() => onMemberTap(member.id)}
            >
              {/* Subtle card highlight streak */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

              <div className="px-6 py-4 flex items-center justify-between bg-black/40 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-zinc-900 border border-[#8B0000]/40 p-[2px] overflow-hidden shadow-2xl relative">
                    <img src={member.image} className="w-full h-full rounded-full object-cover" alt={member.name} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
                  </div>
                  <div className="flex flex-col leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-black text-white italic tracking-tighter group-hover:text-red-500 transition-colors">@{member.username}</span>
                      <ShieldCheck size={14} className="text-[#8B0000] text-glow" />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] pt-1 opacity-60">{member.name}</span>
                  </div>
                </div>
                <div className="bg-[#8B0000]/20 px-3 py-1.5 rounded-full border border-[#8B0000]/30 backdrop-blur-md">
                  <span className="text-[8px] font-black uppercase text-[#FF0000] tracking-widest text-glow">Verified</span>
                </div>
              </div>
              
              <div className="media-container relative aspect-[4/5] bg-zinc-900 overflow-hidden cursor-pointer">
                <img src={member.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 group-hover:rotate-1" alt="Member Preview" />
                
                {/* Image Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 opacity-80"></div>
                
                <div className="absolute inset-x-0 bottom-0 p-8 z-20">
                  <p className="text-[16px] font-medium italic text-white/90 line-clamp-2 mb-6 leading-relaxed text-glow drop-shadow-md">
                    "{member.bio || 'Club member since 2025. This profile is restricted to members only.'}"
                  </p>
                  <div className="flex gap-5 opacity-60 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-500">
                    {member.socials?.instagram && <Instagram size={20} className="hover:text-pink-500 transition-colors" />}
                    {member.socials?.whatsapp && <MessageCircle size={20} className="hover:text-green-500 transition-colors" />}
                    {member.socials?.tiktok && <Globe size={20} className="hover:text-zinc-300 transition-colors" />}
                    {member.socials?.x && <Twitter size={20} className="hover:text-blue-400 transition-colors" />}
                    {member.socials?.onlyfans && <Lock size={20} className="hover:text-[#00aff0] transition-colors" />}
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 flex items-center justify-between bg-black/60">
                 <div className="flex flex-col">
                   <span className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.4em]">Member Link</span>
                   <span className="text-[11px] font-black tracking-widest uppercase text-gradient-red">Protocol: Active</span>
                 </div>
                 <button className="btn-reflective bg-white text-black px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-[0_10px_30px_rgba(255,255,255,0.15)]">
                   View Identity
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="h-20"></div>
    </div>
  );
};

export default FeedScreen;
