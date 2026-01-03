
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { MessageCircle, MoreVertical, Heart, Share2, ShieldCheck, Zap } from 'lucide-react';
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
      <div className="w-12 h-12 border-b-2 border-[#8B0000] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col bg-black min-h-screen fade-in text-white">
      <header className="sticky top-0 z-40 glass-panel px-6 py-6 flex justify-between items-center border-b border-white/5">
        <h1 className="text-2xl font-black tracking-tighter italic">
          CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span>
        </h1>
        <div className="flex items-center gap-4">
            <Zap size={18} className="text-yellow-500 fill-yellow-500/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#8B0000] shadow-[0_0_8px_#8B0000] animate-pulse"></div>
        </div>
      </header>

      <div className="flex flex-col pb-20">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
             <div className="w-24 h-24 rounded-full border border-dashed border-white/20 mb-8 flex items-center justify-center">
                <ShieldCheck size={40} className="text-zinc-800" />
             </div>
             <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">Establishing Inner Circle Feed...</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex flex-col border-b border-white/[0.03] group transition-colors duration-500 hover:bg-zinc-950/30">
              {/* Post Header */}
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B0000]/20 to-zinc-900 p-[1px]">
                    <div className="w-full h-full rounded-full bg-zinc-950 overflow-hidden border border-white/5">
                      {post.userImage ? (
                        <img src={post.userImage} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                          <span className="text-[10px] font-black text-zinc-600">{(post.userName || 'M').charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-black uppercase tracking-widest italic text-white group-hover:text-[#8B0000] transition-colors">
                      @{post.userName?.toLowerCase().replace(/\s/g, '') || 'anonymous'}
                    </span>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <ShieldCheck size={10} className="text-[#8B0000]" />
                      <span className="text-[8px] text-zinc-600 font-bold tracking-[0.2em] uppercase">Verified Identity</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-zinc-700 hover:text-white transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              {/* Media Content */}
              <div className="relative aspect-[4/5] bg-zinc-950 overflow-hidden cursor-pointer" onDoubleClick={() => {}}>
                {post.type === 'video' ? (
                  <video src={post.url} className="w-full h-full object-cover" loop muted autoPlay playsInline />
                ) : (
                  <img src={post.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              </div>

              {/* Interaction Bar */}
              <div className="px-7 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-10">
                  <button className="group/btn relative">
                    <Heart size={28} className="text-zinc-400 group-hover/btn:text-[#8B0000] transition-all group-active:scale-125" />
                  </button>
                  <button 
                    onClick={() => onMessage(post.uid)}
                    className="group/btn relative"
                  >
                    <MessageCircle size={28} className="text-zinc-400 group-hover/btn:text-white transition-all group-active:scale-125" />
                  </button>
                  <button className="group/btn relative">
                    <Share2 size={28} className="text-zinc-400 group-hover/btn:text-white transition-all group-active:scale-125" />
                  </button>
                </div>
                <div className="w-2 h-2 rounded-full bg-zinc-900 border border-white/5"></div>
              </div>

              {/* Caption & Timestamp */}
              <div className="px-7 pt-5 pb-8 space-y-3">
                {post.caption && (
                  <p className="text-[14px] text-zinc-300 leading-relaxed font-medium">
                    <span className="font-black italic mr-3 text-white">@{post.userName?.toLowerCase() || 'member'}</span>
                    {post.caption}
                  </p>
                )}
                <div className="flex items-center gap-2">
                   <div className="h-[1px] w-4 bg-zinc-900"></div>
                   <span className="text-[9px] text-zinc-700 uppercase font-black tracking-[0.3em] block">
                    {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • DISCRETE ENCRYPTED
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedScreen;
