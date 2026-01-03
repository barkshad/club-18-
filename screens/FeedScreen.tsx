
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { MessageCircle, MoreHorizontal, Heart, Share2, ShieldCheck, Zap, Bookmark } from 'lucide-react';
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
      <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#8B0000] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col bg-black min-h-screen fade-in text-white pb-20">
      <header className="sticky top-0 z-40 glass-panel px-5 py-4 flex justify-between items-center border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter italic">
          CLUB 18<span className="text-[#8B0000] not-italic text-glow">+</span>
        </h1>
        <div className="flex items-center gap-5">
            <Zap size={20} className="text-white opacity-40" />
            <div className="relative">
              <MessageCircle size={22} className="text-white" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#8B0000] rounded-full border-2 border-black"></div>
            </div>
        </div>
      </header>

      <div className="flex flex-col">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
             <div className="w-20 h-20 rounded-full border border-dashed border-white/20 mb-6 flex items-center justify-center">
                <ShieldCheck size={32} className="text-zinc-600" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Directory establishing...</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex flex-col bg-black border-b border-white/5 last:border-0">
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-900 border border-white/10 p-[1.5px] overflow-hidden">
                    {post.userImage ? (
                      <img src={post.userImage} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center bg-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-500">{(post.userName || 'M').charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-white">
                        {post.userName?.toLowerCase().replace(/\s/g, '') || 'anonymous'}
                      </span>
                      <ShieldCheck size={11} className="text-[#8B0000]" />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-tighter pt-0.5">Verified Member</span>
                  </div>
                </div>
                <button className="text-zinc-500 p-1"><MoreHorizontal size={18} /></button>
              </div>
              
              {/* Media */}
              <div className="media-container">
                {post.type === 'video' ? (
                  <video src={post.url} className="media-content" loop muted autoPlay playsInline />
                ) : (
                  <img src={post.url} className="media-content" alt="Post content" />
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Heart size={24} className="text-white hover:text-[#8B0000] transition-colors cursor-pointer" />
                  <MessageCircle 
                    size={24} 
                    className="text-white hover:opacity-70 transition-opacity cursor-pointer" 
                    onClick={() => onMessage(post.uid)}
                  />
                  <Share2 size={24} className="text-white hover:opacity-70 transition-opacity cursor-pointer" />
                </div>
                <Bookmark size={24} className="text-white hover:opacity-70 transition-opacity cursor-pointer" />
              </div>

              {/* Caption */}
              <div className="px-4 pt-2 pb-6 space-y-1">
                {post.caption && (
                  <p className="text-[14px] leading-snug">
                    <span className="font-bold mr-2 text-white">{post.userName?.toLowerCase() || 'member'}</span>
                    <span className="text-zinc-300 font-medium">{post.caption}</span>
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
                    {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                  <span className="text-[9px] text-zinc-700 font-black uppercase tracking-widest italic">Encrypted Metadata</span>
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
