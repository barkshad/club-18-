
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, limit } from 'firebase/firestore';
import { MapPin, Settings, ShieldCheck, Zap, MoreVertical, Globe } from 'lucide-react';
import { UserProfile } from '../types';

const FeedScreen: React.FC<{onMemberTap: (uid: string) => void}> = ({ onMemberTap }) => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'online'>('nearest');

  useEffect(() => {
    const q = query(collection(db, "users"), limit(40));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      // Mock some data if empty
      if (data.length < 3) {
        data = [
           { id: 'guest-1', name: 'Sasha', age: 22, distance: 1.2, area: 'Indiranagar', image: 'https://picsum.photos/seed/sasha/600/900', isOnline: true, verified: true, availableFor: '30 mins', intent: 'Coffee', status: 'verified_member', username: 'sashax', bio: 'Living life one sunset at a time.', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
           { id: 'guest-2', name: 'Jade', age: 24, distance: 3.5, area: 'Koramangala', image: 'https://picsum.photos/seed/jade/600/900', isOnline: true, verified: true, availableFor: '1 hour', intent: 'Hangout', status: 'verified_member', username: 'jade_v', bio: 'Architecture student & food explorer.' },
           { id: 'guest-3', name: 'Chloe', age: 21, distance: 0.8, area: 'HSR', image: 'https://picsum.photos/seed/chloe/600/900', isOnline: false, verified: true, status: 'verified_member', username: 'chl_o', bio: 'Yoga and deep talks.' }
        ];
      }
      setMembers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const sortedMembers = [...members].sort((a, b) => {
    if (sortBy === 'nearest') return (a.distance || 99) - (b.distance || 99);
    if (sortBy === 'online') return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
    return 0;
  });

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-zinc-900 border-t-[#8B0000] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* Top Bar */}
      <header className="fixed top-0 max-w-md w-full z-50 glass-panel px-6 py-4 flex items-center justify-between border-b border-white/5">
        <h1 className="text-2xl font-black italic tracking-tighter text-gradient-red">CLUB 18+</h1>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <MapPin size={10} className="text-[#8B0000]" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Nearby</span>
            </div>
            <button onClick={() => setShowFilters(true)} className="p-2 bg-white/5 rounded-full border border-white/5 active:scale-90 transition-all">
                <Settings size={18} className="opacity-60" />
            </button>
        </div>
      </header>

      {/* Online Now Strip */}
      <div className="mt-20 px-6 py-4 border-b border-white/5">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Online Now
        </h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {members.filter(m => m.isOnline).map(m => (
            <div key={m.id} onClick={() => onMemberTap(m.id)} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full p-[2px] border-2 border-[#8B0000] overflow-hidden relative active:scale-95 transition-all">
                <img src={m.image} className="w-full h-full object-cover rounded-full" alt={m.name} />
              </div>
              <span className="text-[9px] font-bold tracking-tight opacity-40">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Instagram-Style Feed */}
      <div className="flex flex-col gap-6 py-6 px-3">
        {sortedMembers.map((user) => (
          <div 
            key={user.id} 
            className="relative h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/5"
            onClick={() => onMemberTap(user.id)}
          >
            {user.videoUrl ? (
                <video 
                    src={user.videoUrl} 
                    autoPlay loop muted playsInline 
                    className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                />
            ) : (
                <img src={user.image} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" alt={user.name} />
            )}

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 p-8 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10">
                  <h2 className="text-3xl font-black italic tracking-tighter text-white">{user.name}, {user.age}</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                    {user.distance} km · {user.area}
                  </p>
                </div>
                {user.verified && (
                  <div className="bg-[#8B0000]/30 backdrop-blur-xl px-4 py-2 rounded-full border border-[#8B0000]/40 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#FF0000]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#FF0000]">Verified</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-3">
                  {user.availableFor && (
                    <div className="bg-green-500/20 backdrop-blur-xl text-green-400 px-4 py-2 rounded-full border border-green-500/30 text-[9px] font-black uppercase tracking-widest inline-block animate-pulse">
                      🟢 Available for {user.availableFor}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {user.intent || 'Coffee'}
                    </div>
                  </div>
                </div>
                
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-all bg-black/40 p-3 rounded-full backdrop-blur-lg">
                  View Identity <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bottom Sheet */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-end animate-in fade-in duration-300">
          <div className="w-full max-w-md mx-auto bg-zinc-950 rounded-t-[3rem] p-10 border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,1)]">
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-10"></div>
            <h3 className="text-xl font-black italic uppercase tracking-[0.3em] text-gradient-red mb-10">Protocol Sorting</h3>
            
            <div className="space-y-4 mb-10">
              <button 
                onClick={() => { setSortBy('nearest'); setShowFilters(false); }}
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-xs transition-all border ${sortBy === 'nearest' ? 'bg-[#8B0000] border-[#8B0000] text-white glow-red' : 'bg-white/5 border-white/5 text-zinc-500'}`}
              >
                Nearest First
              </button>
              <button 
                onClick={() => { setSortBy('online'); setShowFilters(false); }}
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-xs transition-all border ${sortBy === 'online' ? 'bg-[#8B0000] border-[#8B0000] text-white glow-red' : 'bg-white/5 border-white/5 text-zinc-500'}`}
              >
                Online Now
              </button>
            </div>

            <button 
                onClick={() => setShowFilters(false)}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:text-white transition-colors"
            >
                Abort Protocol
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ChevronRight = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

export default FeedScreen;
