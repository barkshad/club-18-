
import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Send, ShieldAlert } from 'lucide-react';
import { MOCK_CHATS } from '../data';

interface ChatDetailScreenProps {
  chatId: string;
  onBack: () => void;
}

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ chatId, onBack }) => {
  const chat = MOCK_CHATS.find(c => c.id === chatId) || MOCK_CHATS[0];
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hey there! How is your day going?', sender: 'them' },
    { id: '2', text: chat.lastMessage.text, sender: chat.lastMessage.senderId === 'me' ? 'me' : 'them' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), text: inputText, sender: 'me' }]);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-900 flex items-center gap-4 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="p-1 -ml-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-800">
             <img src={chat.partner.image} alt={chat.partner.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-none mb-1">{chat.partner.name}</h2>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Online</span>
            </div>
          </div>
        </div>

        <button className="p-1 text-zinc-600">
           <ShieldAlert size={20} />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
        <div className="text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Connected on Club 18+</p>
          <div className="w-1 h-8 bg-zinc-900 mx-auto rounded-full"></div>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`max-w-[80%] flex flex-col ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <div 
              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'me' 
                  ? 'bg-zinc-100 text-black rounded-tr-none' 
                  : 'bg-zinc-900 text-zinc-300 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[9px] text-zinc-700 mt-1 px-1">Just now</span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-900 bg-black safe-bottom">
        <div className="flex items-center gap-3 bg-zinc-950 rounded-full pl-4 pr-2 py-2 border border-zinc-900 focus-within:border-[#C41E3A]/50 transition-colors">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write privately..." 
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-zinc-100 text-black flex items-center justify-center disabled:opacity-20 transition-all active:scale-90"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[9px] text-zinc-700 mt-3 uppercase tracking-tighter">
          End-to-end encrypted • Private member channel
        </p>
      </div>
    </div>
  );
};

export default ChatDetailScreen;
