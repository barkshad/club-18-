
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit, where, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Send, MoreHorizontal, Shield, User as UserIcon, Lock, Fingerprint } from 'lucide-react';
import { UserProfile } from '../types';

const ChatDetailScreen: React.FC<{chatId: string, onBack: any}> = ({ chatId, onBack }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser || !chatId) return;

    const uids = chatId.split('--');
    const partnerUid = uids.find(id => id !== auth.currentUser?.uid);

    if (partnerUid) {
      getDoc(doc(db, "users", partnerUid)).then(snap => {
        if (snap.exists()) setPartner({ id: snap.id, ...snap.data() } as UserProfile);
      });
    }

    const q = query(
      collection(db, "messages"), 
      where("matchId", "==", chatId),
      orderBy("timestamp", "asc"), 
      limit(100)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        setLoading(false);
        setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
      },
      (error) => {
        console.error("Chat error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!inputText.trim() || !auth.currentUser) return;
    const text = inputText;
    setInputText('');
    try {
      await addDoc(collection(db, "messages"), {
        text: text,
        senderId: auth.currentUser.uid,
        timestamp: Date.now(),
        matchId: chatId
      });
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black fade-in text-white">
      <header className="px-6 py-6 border-b border-white/5 flex items-center justify-between glass-panel z-10 sticky top-0 shadow-2xl">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors p-2 active:scale-90">
                <ArrowLeft size={22} />
            </button>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-zinc-950 overflow-hidden border border-[#8B0000]/30 shadow-[0_0_10px_rgba(139,0,0,0.2)]">
                        {partner?.image ? <img src={partner.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-900"><UserIcon size={18} className="text-zinc-600" /></div>}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[13px] font-black uppercase tracking-[0.2em] italic text-white/90">
                          {partner?.username ? `@${partner.username}` : (partner?.name || 'MEMBER')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5 opacity-60">
                        <Lock size={10} className="text-[#8B0000]" />
                        <p className="text-[8px] text-zinc-400 font-black tracking-widest uppercase italic">Secure Protocol</p>
                    </div>
                </div>
            </div>
        </div>
        <button className="p-2 text-zinc-700 active:scale-90"><MoreHorizontal size={22} /></button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-[radial-gradient(circle_at_center,_#0a0a0a_0%,_#000_100%)]">
        <div className="flex flex-col items-center justify-center py-16 space-y-6 opacity-30">
            <div className="w-14 h-14 rounded-full border border-dashed border-zinc-800 flex items-center justify-center">
               <Fingerprint size={28} className="text-zinc-700" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#8B0000]">DISCRETE PROTOCOL ACTIVE</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-700">Messages auto-purge from local memory</p>
            </div>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.senderId === auth.currentUser?.uid;
          const showTime = i === 0 || (msg.timestamp - messages[i-1].timestamp > 600000);
          
          return (
            <div key={msg.id} className="flex flex-col">
                {showTime && (
                    <div className="flex items-center justify-center gap-3 my-6 opacity-20">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800"></div>
                        <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em]">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800"></div>
                    </div>
                )}
                <div 
                    className={`max-w-[80%] px-5 py-4 rounded-3xl text-[14px] leading-relaxed font-medium shadow-2xl transition-all duration-300 ${
                    isMe 
                        ? 'bg-[#8B0000] text-white self-end rounded-tr-none premium-glow shadow-[0_4px_20px_rgba(139,0,0,0.3)]' 
                        : 'bg-zinc-900/80 border border-white/5 text-zinc-200 self-start rounded-tl-none backdrop-blur-md'
                    }`}
                >
                    {msg.text}
                </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 pb-12 glass-panel border-t border-white/5 relative">
        <div className="flex items-center gap-4 bg-zinc-950/80 rounded-[2rem] p-3 border border-white/10 focus-within:border-[#8B0000]/40 transition-all backdrop-blur-xl">
            <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="CONVEY DISCRETE MESSAGE..."
                className="flex-1 bg-transparent px-5 py-4 text-xs font-black tracking-widest text-white focus:outline-none placeholder:text-zinc-800 uppercase"
            />
            <button 
                onClick={handleSend} 
                className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-zinc-200 disabled:opacity-20 shadow-xl"
                disabled={!inputText.trim()}
            >
                <Send size={22} fill="currentColor" strokeWidth={1} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetailScreen;
