
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Send, MoreHorizontal, Shield, User as UserIcon, Lock, Fingerprint, Camera } from 'lucide-react';
import { UserProfile } from '../types';

const ChatDetailScreen: React.FC<{chatId: string, onBack: any}> = ({ chatId, onBack }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser || !chatId) return;

    // Fetch Current User Data (for Conversation Metadata)
    getDoc(doc(db, "users", auth.currentUser.uid)).then(snap => {
       if (snap.exists()) setCurrentUserProfile({ id: snap.id, ...snap.data() } as UserProfile);
    });

    // Fetch Partner Data
    const uids = chatId.split('--');
    const partnerUid = uids.find(id => id !== auth.currentUser?.uid);

    if (partnerUid) {
      getDoc(doc(db, "users", partnerUid)).then(snap => {
        if (snap.exists()) setPartner({ id: snap.id, ...snap.data() } as UserProfile);
      });
    }

    // Listen to Messages
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
    if (!inputText.trim() || !auth.currentUser || !partner) return;
    const text = inputText;
    setInputText('');
    
    try {
      // 1. Add Message to History
      await addDoc(collection(db, "messages"), {
        text: text,
        senderId: auth.currentUser.uid,
        timestamp: Date.now(),
        matchId: chatId
      });

      // 2. Update Conversation Metadata for Inbox List
      if (currentUserProfile) {
        await setDoc(doc(db, "conversations", chatId), {
          participants: [auth.currentUser.uid, partner.id],
          lastMessage: text,
          timestamp: Date.now(),
          participantData: {
            [auth.currentUser.uid]: {
              name: currentUserProfile.name,
              image: currentUserProfile.image || '',
              username: currentUserProfile.username || ''
            },
            [partner.id]: {
              name: partner.name,
              image: partner.image || '',
              username: partner.username || ''
            }
          }
        }, { merge: true });
      }

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
                    <div className="w-10 h-10 rounded-full bg-zinc-950 overflow-hidden border border-[#8B0000]/30">
                        {partner?.image ? <img src={partner.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-900"><UserIcon size={18} className="text-zinc-600" /></div>}
                    </div>
                    {/* Online indicator could go here */}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[13px] font-black uppercase tracking-[0.2em] italic text-white/90">
                          {partner?.username ? `@${partner.username}` : (partner?.name || 'MEMBER')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5 opacity-60">
                        <Lock size={10} className="text-[#8B0000]" />
                        <p className="text-[8px] text-zinc-400 font-black tracking-widest uppercase italic">End-to-End Encrypted</p>
                    </div>
                </div>
            </div>
        </div>
        <button className="p-2 text-zinc-700 active:scale-90"><MoreHorizontal size={22} /></button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar bg-[radial-gradient(circle_at_center,_#0a0a0a_0%,_#000_100%)]">
        <div className="flex flex-col items-center justify-center py-10 space-y-4 opacity-30">
            <div className="w-12 h-12 rounded-full border border-dashed border-zinc-800 flex items-center justify-center">
               <Fingerprint size={24} className="text-zinc-700" />
            </div>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-700">Start of encrypted history</p>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.senderId === auth.currentUser?.uid;
          const showTime = i === 0 || (msg.timestamp - messages[i-1].timestamp > 1800000); // 30 mins
          
          return (
            <div key={msg.id} className="flex flex-col">
                {showTime && (
                    <div className="text-center py-4">
                        <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}
                <div 
                    className={`max-w-[75%] px-5 py-3 rounded-3xl text-[14px] leading-relaxed font-medium shadow-sm mb-1 ${
                    isMe 
                        ? 'bg-[#8B0000] text-white self-end rounded-br-none' 
                        : 'bg-zinc-900 text-zinc-200 self-start rounded-bl-none border border-white/5'
                    }`}
                >
                    {msg.text}
                </div>
                {isMe && i === messages.length - 1 && (
                   <p className="text-[9px] text-zinc-600 self-end mr-1 mt-1 font-bold uppercase tracking-widest">Delivered</p>
                )}
            </div>
          );
        })}
      </div>

      <div className="p-4 pb-8 glass-panel border-t border-white/5 relative">
        <div className="flex items-center gap-3 bg-zinc-900 rounded-full p-2 border border-white/10 focus-within:border-[#8B0000]/40 transition-all">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
               <Camera size={20} className="text-[#8B0000]" />
            </div>
            <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..."
                className="flex-1 bg-transparent px-2 py-3 text-sm font-medium text-white focus:outline-none placeholder:text-zinc-600"
            />
            {inputText.trim() ? (
              <button 
                  onClick={handleSend} 
                  className="px-4 py-2 bg-transparent text-[#8B0000] font-black text-xs uppercase tracking-widest hover:text-white transition-colors"
              >
                  Send
              </button>
            ) : (
               <div className="px-4 text-zinc-600 text-xs font-black uppercase tracking-widest opacity-50">Send</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatDetailScreen;
