
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { ArrowLeft, Send } from 'lucide-react';

const ChatDetailScreen: React.FC<{matchId: string, onBack: any}> = ({ matchId, onBack }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // In this simple system, matchId is basically a placeholder. 
    // Usually you'd query messages where matchId == matchId.
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [matchId]);

  const handleSend = async () => {
    if (!inputText.trim() || !auth.currentUser) return;
    await addDoc(collection(db, "messages"), {
      text: inputText,
      senderId: auth.currentUser.uid,
      timestamp: Date.now()
    });
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="px-4 py-3 border-b border-zinc-900 flex items-center gap-4 bg-black/95">
        <button onClick={onBack} className="text-white"><ArrowLeft size={24} /></button>
        <h2 className="text-sm font-bold uppercase tracking-widest">Private Member Chat</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === auth.currentUser?.uid ? 'bg-[#8B0000] self-end ml-auto' : 'bg-zinc-900 self-start'}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 safe-bottom flex gap-2">
        <input 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-950 border border-zinc-900 rounded-full px-4 text-sm"
        />
        <button onClick={handleSend} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatDetailScreen;
