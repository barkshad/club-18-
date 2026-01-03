
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { MessageCircle, MoreVertical, Heart, Share2 } from 'lucide-react';
import { Post } from '../types';

const FeedScreen: React.FC<{onMessage: (uid: string) => void}> = ({ onMessage }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col bg-black min-h-screen fade-in">
      <header className="sticky top-0 z-40 glass-panel px-6 py-4 flex justify-between items-center border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter italic">
          CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span>
        </h1>
        <div className="w-10 h-10 bg-zinc-900/50 rounded-full flex items-center justify-center border border-white/5">
            <Heart size={16} className="text-[#8B0000]" fill="currentColor" />
        </div>
      </header>

      <div className="flex flex-col gap-6 py-4">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 uppercase tracking-widest text-[10px] font-bold">
            No active moments found
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex flex-col border-b border-zinc-900/50 pb-6">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-white/5">
                    {post.userImage && <img src={post.userImage} className="w-full h-full object-cover" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest italic">{post.userName || 'Exclusive Member'}</span>
                </div>
                <MoreVertical size={16} className="text-zinc-600" />
              </div>
              
              <div className="relative aspect-square bg-zinc-950">
                {post.type === 'video' ? (
                  <video src={post.url} className="w-full h-full object-cover" controls loop muted autoPlay />
                ) : (
                  <img src={post.url} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="px-4 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Heart size={22} className="text-white hover:text-[#8B0000] transition-colors" />
                  <MessageCircle 
                    size={22} 
                    className="text-white hover:text-[#8B0000] transition-colors cursor-pointer" 
                    onClick={() => onMessage(post.uid)} 
                  />
                  <Share2 size={22} className="text-white" />
                </div>
              </div>

              {post.caption && (
                <div className="px-4 pt-3">
                  <p className="text-sm text-zinc-300">
                    <span className="font-black italic mr-2">{post.userName || 'Member'}</span>
                    {post.caption}
                  </p>
                </div>
              )}
              
              <div className="px-4 pt-1">
                <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">
                  {new Date(post.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedScreen;
