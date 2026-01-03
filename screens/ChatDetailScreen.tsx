
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Send } from 'lucide-react';

const ChatDetailScreen: React.FC<{matchId: string, onBack: any}> = ({ matchId, onBack }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    // Simple broad query for demo; usually would filter by matchId
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
      },
      (error) => {
        console.error("Chat error:", error);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser?.uid, matchId]);

  const handleSend = async () => {
    if (!inputText.trim() || !auth.currentUser) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: inputText,
        senderId: auth.currentUser.uid,
        timestamp: Date.now()
      });
      setInputText('');
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Permission denied. Cannot send message.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="px-4 py-3 border-b border-zinc-900 flex items-center gap-4 bg-black/95">
        <button onClick={onBack} className="text-white hover:text-[#8B0000] transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-widest">Private Member Chat</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.senderId === auth.currentUser?.uid 
                ? 'bg-[#8B0000] text-white self-end ml-auto rounded-tr-none' 
                : 'bg-zinc-900 text-zinc-200 self-start rounded-tl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-zinc-600 text-[10px] uppercase tracking-widest py-10">
            No messages yet. Start the conversation.
          </div>
        )}
      </div>

      <div className="p-4 safe-bottom flex gap-2 border-t border-zinc-900 bg-black">
        <input 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-950 border border-zinc-900 rounded-full px-4 text-sm text-white focus:outline-none focus:border-[#8B0000] transition-colors"
        />
        <button 
          onClick={handleSend} 
          className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
          disabled={!inputText.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatDetailScreen;
