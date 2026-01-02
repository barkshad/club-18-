
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, addDoc, onSnapshot } from 'firebase/firestore';
import { Heart, MoreHorizontal, ShieldCheck, MessageCircle, Send, Bookmark } from 'lucide-react';
import { UserProfile } from '../types';

const HomeScreen: React.FC<{onLike: any, onNavigateToMatches: any}> = ({ onNavigateToMatches }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), where("__name__", "!=", auth.currentUser?.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLike = async (targetUid: string) => {
    if (!auth.currentUser) return;
    const me = auth.currentUser.uid;
    
    // Check for match
    await addDoc(collection(db, "likes"), { from: me, to: targetUid, timestamp: Date.now() });
    
    // In a real app, you'd trigger a match check cloud function or query here.
    // For this simple system, we just record the like.
    alert("Liked! If they like you back, you'll find them in Connections.");
  };

  if (loading) return <div className="h-full bg-black"></div>;

  return (
    <div className="flex flex-col bg-black min-h-screen">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-zinc-900">
        <h1 className="text-2xl font-black tracking-tighter italic">CLUB 18<span className="text-[#8B0000] not-italic">+</span></h1>
        <div className="flex gap-6 items-center">
           <Heart size={24} className="text-white" onClick={onNavigateToMatches} />
           <MessageCircle size={24} className="text-white" />
        </div>
      </header>

      <div className="flex flex-col">
        {users.length === 0 ? (
          <div className="p-20 text-center text-zinc-500 text-sm">Searching for elite connections nearby...</div>
        ) : users.map((user) => (
          <div key={user.id} className="relative w-full mb-6 bg-black">
            <div className="flex items-center px-3 py-2.5 gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800">
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">{user.name}, {user.age}</span>
                <span className="text-[10px] text-zinc-500 uppercase">{user.location}</span>
              </div>
            </div>

            <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" onDoubleClick={() => handleLike(user.id)} />
            </div>

            <div className="px-3 pt-3 pb-2 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <Heart size={28} className="text-white hover:text-[#8B0000]" onClick={() => handleLike(user.id)} />
                <MessageCircle size={28} className="text-white" />
              </div>
              <Bookmark size={28} className="text-white" />
            </div>

            <div className="px-4 space-y-1">
              <p className="text-xs font-bold">Elite Verified Member</p>
              <p className="text-sm font-light text-zinc-400">{user.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
