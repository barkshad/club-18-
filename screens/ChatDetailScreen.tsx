import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { ArrowLeft, Send, MoreHorizontal, Shield } from 'lucide-react';

const ChatDetailScreen: React.FC<{matchId: string, onBack: any}> = ({ matchId, onBack }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // In a real app we'd filter by conversation ID
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"), limit(50));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        setLoading(false);
        setTimeout(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      },
      (error) => {
        console.error("Chat error:", error);
      }
    );

    return () => unsubscribe();
  }, [matchId]);

  const handleSend = async () => {
    if (!inputText.trim() || !auth.currentUser) return;
    const text = inputText;
    setInputText('');
    try {
      await addDoc(collection(db, "messages"), {
        text: text,
        senderId: auth.currentUser.uid,
        timestamp: Date.now(),
        matchId: matchId
      });
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black fade-in">
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between glass-panel z-10 sticky top-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors p-1">
            <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <h2 className="text-[11px] font-black uppercase tracking-widest italic">Secret Member</h2>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </div>
                <p className="text-[9px] text-zinc-600 font-bold tracking-widest uppercase">End-to-End Encrypted</p>
            </div>
        </div>
        <button className="text-zinc-500"><MoreHorizontal size={20} /></button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[radial-gradient(circle_at_center,_#0a0a0a_0%,_#000_100%)]">
        <div className="flex flex-col items-center justify-center py-10 space-y-2 opacity-30">
            <Shield size={24} className="text-zinc-700" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Discrete Protocol Enabled</p>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.senderId === auth.currentUser?.uid;
          const showTime = i === 0 || (msg.timestamp - messages[i-1].timestamp > 300000);
          
          return (
            <div key={msg.id} className="flex flex-col">
                {showTime && (
                    <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest text-center my-4 block">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
                <div 
                    className={`max-w-[75%] px-5 py-3 rounded-2xl text-[13px] leading-relaxed font-medium shadow-xl ${
                    isMe 
                        ? 'bg-[#8B0000] text-white self-end rounded-tr-none premium-glow' 
                        : 'bg-zinc-900/80 border border-white/5 text-zinc-200 self-start rounded-tl-none'
                    }`}
                >
                    {msg.text}
                </div>
            </div>
          );
        })}
        
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-zinc-500">Silence is luxury.</p>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-700 mt-2">Start the conversation when ready.</p>
          </div>
        )}
      </div>

      <div className="p-4 pb-8 glass-panel border-t border-white/5 relative">
        <div className="flex items-center gap-3 bg-zinc-950 rounded-2xl p-2 border border-white/5 focus-within:border-[#8B0000]/30 transition-all">
            <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Say something private..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-white focus:outline-none placeholder:text-zinc-700"
            />
            <button 
                onClick={handleSend} 
                className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30 disabled:grayscale"
                disabled={!inputText.trim()}
            >
                <Send size={18} fill="currentColor" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetailScreen;