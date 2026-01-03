import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, addDoc, onSnapshot, limit } from 'firebase/firestore';
import { Heart, X, Star, MapPin, Info, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';

const HomeScreen: React.FC<{onLike: any, onNavigateToMatches: any}> = ({ onNavigateToMatches }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Safety check: ensure user is logged in
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // Attempt to fetch other users. 
    // Sometimes "__name__ != uid" queries are restricted by rules if they lead to collection-wide scans.
    // We fetch a limited set for discovery.
    const q = query(
      collection(db, "users"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const usersData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
          .filter(u => u.id !== user.uid); // Filter out self locally to be safe
        setUsers(usersData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Discovery error:", err);
        if (err.code === 'permission-denied') {
          setError("Exclusive directory access restricted. Please verify your profile.");
        } else {
          setError("Connection to club server interrupted.");
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAction = async (targetUid: string, type: 'like' | 'pass') => {
    const user = auth.currentUser;
    if (!user) return;
    
    if (type === 'like') {
      try {
        await addDoc(collection(db, "likes"), { 
          from: user.uid, 
          to: targetUid, 
          timestamp: Date.now() 
        });
      } catch (err: any) {
        console.error("Action error:", err);
        if (err.code === 'permission-denied') {
          alert("Interaction restricted. Membership check failed.");
        }
      }
    }
    
    if (currentIndex < users.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setUsers([]);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-zinc-800 rounded-full"></div>
        <div className="absolute inset-0 w-12 h-12 border-2 border-t-[#8B0000] rounded-full animate-spin"></div>
      </div>
    </div>
  );

  const activeUser = users[currentIndex];

  return (
    <div className="flex flex-col bg-black min-h-screen fade-in relative overflow-hidden">
      <header className="sticky top-0 z-40 glass-panel px-6 py-4 flex justify-between items-center border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter italic">
          CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span>
        </h1>
        <button className="w-10 h-10 bg-zinc-900/50 rounded-full flex items-center justify-center border border-white/5">
            <Star size={16} className="text-[#8B0000]" fill="currentColor" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-28">
        {error ? (
          <div className="text-center space-y-4 max-w-xs animate-pulse">
            <ShieldAlert size={32} className="text-[#8B0000] mx-auto mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest italic text-white">Access Restricted</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-widest font-bold">
              {error}
            </p>
            <button onClick={() => window.location.reload()} className="text-[10px] text-[#8B0000] font-black uppercase tracking-widest underline pt-4">Retry Access</button>
          </div>
        ) : !activeUser ? (
             <div className="text-center space-y-4 max-w-xs">
                 <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star size={24} className="text-zinc-700" />
                 </div>
                 <h3 className="text-sm font-black uppercase tracking-widest italic">All caught up</h3>
                 <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-widest font-bold">
                    New exclusive members arrive daily. <br/>Check back soon for more connections.
                 </p>
                 <button onClick={() => window.location.reload()} className="text-[10px] text-[#8B0000] font-black uppercase tracking-widest underline pt-4">Refresh Feed</button>
             </div>
        ) : (
            <div className="w-full max-w-sm relative group">
                <div className="relative aspect-[4/5] bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
                    {activeUser.image && (
                         <img src={activeUser.image} alt={activeUser.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 pt-20">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-4xl font-black text-white italic tracking-tight">{activeUser.name}, {activeUser.age}</h2>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1 text-zinc-400">
                                <MapPin size={12} className="text-[#8B0000]" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{activeUser.location}</span>
                            </div>
                        </div>
                        
                        {activeUser.bio && (
                            <p className="text-xs text-zinc-300 line-clamp-2 mb-8 font-medium leading-relaxed italic opacity-90">
                                "{activeUser.bio}"
                            </p>
                        )}

                        <div className="flex gap-4">
                             <button 
                                onClick={() => handleAction(activeUser.id, 'pass')}
                                className="w-14 h-14 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all hover:bg-zinc-900"
                             >
                                <X size={24} />
                             </button>
                             <button 
                                onClick={() => handleAction(activeUser.id, 'like')}
                                className="flex-1 py-4 bg-[#8B0000] rounded-full text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all premium-glow"
                             >
                                <Heart size={18} fill="currentColor" /> Match
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;