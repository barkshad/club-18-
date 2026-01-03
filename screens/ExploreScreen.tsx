
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Search, Grid, Play } from 'lucide-react';
import { Post } from '../types';

const ExploreScreen: React.FC<{onSelectPost: (uid: string) => void}> = ({ onSelectPost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black fade-in">
      <header className="p-4 sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-white/5">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Search the Inner Circle..." 
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-2.5 pl-11 pr-4 text-xs focus:outline-none focus:border-[#8B0000]/40 transition-all text-white"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 bg-zinc-900/20">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="relative aspect-square cursor-pointer group"
              onClick={() => onSelectPost(post.uid)}
            >
              {post.type === 'video' ? (
                <div className="w-full h-full relative">
                  <video src={post.url} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 right-1.5 opacity-60">
                    <Play size={10} className="text-white fill-white" />
                  </div>
                </div>
              ) : (
                <img src={post.url} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Grid size={16} className="text-white/50" />
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="col-span-3 py-20 text-center opacity-30">
               <Grid size={48} className="mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Directory Empty</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;
