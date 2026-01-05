
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Instagram, MessageCircle, Phone, Globe, ShieldCheck, MapPin, Video, Lock } from 'lucide-react';
import { UserProfile } from '../types';

const ProfileScreen: React.FC<{userId: string, onBack: () => void}> = ({ userId, onBack }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      // Mock data logic for guests
      if (userId.startsWith('guest')) {
          const mocks: {[key: string]: any} = {
              'guest-1': { name: 'Sasha', age: 22, distance: 1.2, area: 'Indiranagar', image: 'https://picsum.photos/seed/sasha/600/900', verified: true, bio: 'Living life one sunset at a time. Architect by day, music lover by night.', socials: { instagram: 'sashax', whatsapp: '9100000000', phone: '9100000000' } },
              'guest-2': { name: 'Jade', age: 24, distance: 3.5, area: 'Koramangala', image: 'https://picsum.photos/seed/jade/600/900', verified: true, bio: 'Architecture student & food explorer. Always down for coffee and deep talks.', socials: { instagram: 'jade_v', whatsapp: '9100000001', phone: '9100000001' } }
          };
          setProfile(mocks[userId] || mocks['guest-1']);
          setLoading(false);
          return;
      }
      
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!profile) return <div className="p-20 text-center opacity-40">Identity Lost.</div>;

  const handleAction = (type: 'ig' | 'wa' | 'call') => {
      if (!profile.socials) return;
      if (type === 'ig' && profile.socials.instagram) window.open(`https://instagram.com/${profile.socials.instagram}`, '_blank');
      if (type === 'wa' && profile.socials.whatsapp) window.open(`https://wa.me/${profile.socials.whatsapp}`, '_blank');
      if (type === 'call' && profile.socials.phone) window.open(`tel:${profile.socials.phone}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent fade-in text-white pb-32">
      <div className="relative h-[85vh] w-full overflow-hidden shadow-2xl">
        <img src={profile.image} className="w-full h-full object-cover" alt="Profile" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10"></div>
        
        <header className="absolute top-8 left-6 right-6 flex justify-between items-center z-20">
          <button onClick={onBack} className="w-12 h-12 glass-panel backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all">
            <ArrowLeft size={22} />
          </button>
          {profile.verified && (
            <div className="px-5 py-2 glass-panel rounded-full border border-white/10 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#FF0000]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Identity Match</span>
            </div>
          )}
        </header>

        <div className="absolute bottom-16 left-10 right-10 z-20 flex flex-col items-start">
            <h1 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-2xl text-glow mb-2">{profile.name}, {profile.age}</h1>
            <div className="flex items-center gap-4 text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px] bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5">
                <span className="text-gradient-red">@{profile.username || 'member'}</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                <div className="flex items-center gap-1.5"><MapPin size={10} className="text-[#8B0000]" /><span className="opacity-60">{profile.area || 'Nearby'}</span></div>
            </div>
        </div>
      </div>

      <div className="px-8 py-12 space-y-16 relative z-20">
        <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700">Protocol Biography</h3>
            <p className="text-[18px] font-medium leading-[1.8] italic text-zinc-300 opacity-90 drop-shadow-sm">
              "{profile.bio}"
            </p>
        </div>

        {/* Action Grid - Call, WhatsApp, IG */}
        <div className="grid grid-cols-1 gap-4">
            <button 
                onClick={() => handleAction('wa')}
                className="w-full py-8 glass-panel rounded-[2rem] flex items-center justify-between px-10 active:scale-[0.98] transition-all hover:border-green-500/40 group glow-red"
            >
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 group-hover:bg-green-500 transition-all">
                        <MessageCircle size={28} className="text-green-400 group-hover:text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-2">
                        <span className="text-xs font-black tracking-[0.3em] uppercase">WhatsApp</span>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Instant Connection</span>
                    </div>
                </div>
                <Globe size={20} className="opacity-10 group-hover:opacity-100 transition-opacity" />
            </button>

            <button 
                onClick={() => handleAction('call')}
                className="w-full py-8 glass-panel rounded-[2rem] flex items-center justify-between px-10 active:scale-[0.98] transition-all hover:border-blue-500/40 group glow-red"
            >
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-500 transition-all">
                        <Phone size={28} className="text-blue-400 group-hover:text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-2">
                        <span className="text-xs font-black tracking-[0.3em] uppercase">Direct Call</span>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Real-time Audio</span>
                    </div>
                </div>
                <Globe size={20} className="opacity-10 group-hover:opacity-100 transition-opacity" />
            </button>

            <button 
                onClick={() => handleAction('ig')}
                className="w-full py-8 glass-panel rounded-[2rem] flex items-center justify-between px-10 active:scale-[0.98] transition-all hover:border-pink-500/40 group glow-red"
            >
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 group-hover:bg-pink-500 transition-all">
                        <Instagram size={28} className="text-pink-400 group-hover:text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-2">
                        <span className="text-xs font-black tracking-[0.3em] uppercase">Instagram</span>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Visual Portfolio</span>
                    </div>
                </div>
                <Globe size={20} className="opacity-10 group-hover:opacity-100 transition-opacity" />
            </button>
        </div>

        <div className="pt-20 pb-10 flex flex-col items-center gap-6 opacity-10 grayscale">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <p className="text-[8px] font-black uppercase tracking-[1em]">Confidential Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
