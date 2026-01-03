
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { MessageCircle, MoreVertical, Heart, Share2, ShieldCheck } from 'lucide-react';
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
      <div className="w-10 h-10 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col bg-black min-h-screen fade-in">
      <header className="sticky top-0 z-40 glass-panel px-6 py-5 flex justify-between items-center border-b border-white/5">
        <h1 className="text-2xl font-black tracking-tighter italic">
          CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span>
        </h1>
        <div className="flex items-center gap-4">
            <ShieldCheck size={20} className="text-zinc-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </header>

      <div className="flex flex-col py-2">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
             <div className="w-20 h-20 rounded-full border border-dashed border-white mb-6"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.5em]">Establishing Directory...</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex flex-col mb-10 group">
              {/* Post Header */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 overflow-hidden border border-white/10 ring-2 ring-[#8B0000]/20">
                    {post.userImage ? (
                      <img src={post.userImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#8B0000]/10">
                        <span className="text-[10px] font-black text-[#8B0000]">{post.userName?.charAt(0) || 'M'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest italic text-white/90">
                      @{post.userName?.toLowerCase().replace(/\s/g, '') || 'exclusive_member'}
                    </span>
                    <span className="text-[8px] text-zinc-600 font-bold tracking-widest uppercase">Verified Adult</span>
                  </div>
                </div>
                <MoreVertical size={18} className="text-zinc-700" />
              </div>
              
              {/* Media Content */}
              <div className="relative aspect-[4/5] bg-zinc-950 overflow-hidden" onDoubleClick={() => {}}>
                {post.type === 'video' ? (
                  <video src={post.url} className="w-full h-full object-cover" loop muted autoPlay playsInline />
                ) : (
                  <img src={post.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>

              {/* Interaction Bar */}
              <div className="px-6 pt-5 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <Heart size={26} className="text-white active:scale-125 transition-transform" />
                  <MessageCircle 
                    size={26} 
                    className="text-white active:scale-110 transition-transform cursor-pointer" 
                    onClick={() => onMessage(post.uid)} 
                  />
                  <Share2 size={26} className="text-white active:scale-110 transition-transform" />
                </div>
                <div className="h-1 w-1 rounded-full bg-zinc-800"></div>
              </div>

              {/* Caption & Timestamp */}
              <div className="px-6 pt-4 space-y-2">
                {post.caption && (
                  <p className="text-[13px] text-zinc-300 leading-relaxed font-medium">
                    <span className="font-black italic mr-2 text-white">@{post.userName?.toLowerCase() || 'member'}</span>
                    {post.caption}
                  </p>
                )}
                <span className="text-[9px] text-zinc-700 uppercase font-black tracking-[0.2em] block pt-1">
                  Posted {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
