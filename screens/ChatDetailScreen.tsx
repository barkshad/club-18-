
import React, { useState } from 'react';
import { ArrowLeft, Send, ShieldAlert, Phone, Video, Info } from 'lucide-react';
import { MOCK_CHATS } from '../data';

/**
 * LOGO PROMPT FOR CLUB 18+
 * "Minimalist elegant logo for 'Club 18+', luxury serif font 'C' and '18+' intertwined with a subtle deep crimson red heart outline, deep black background, matte finish, high-end fashion magazine aesthetic, vector style."
 */

interface ChatDetailScreenProps {
  chatId: string;
  onBack: () => void;
}

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ chatId, onBack }) => {
  const chat = MOCK_CHATS.find(c => c.id === chatId) || MOCK_CHATS[0];
  const [messages, setMessages] = useState([
    { id: '1', text: `Hi Alex, I saw you like ${chat.partner.interests[0]}. That's my favorite too.`, sender: 'them' },
    { id: '2', text: "It's a rare find! What's your favorite spot in the city?", sender: 'me' },
    { id: '3', text: chat.lastMessage.text, sender: chat.lastMessage.senderId === 'me' ? 'me' : 'them' },
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
      <header className="px-4 py-3 border-b border-zinc-900 flex justify-between items-center bg-black/95 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
               <img src={chat.partner.image} alt={chat.partner.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold leading-none mb-0.5">{chat.partner.name}</h2>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                Active now
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <Phone size={20} className="text-white" />
           <Video size={22} className="text-white" />
           <Info size={22} className="text-white" />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col no-scrollbar">
        <div className="flex flex-col items-center py-10">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
             <img src={chat.partner.image} alt={chat.partner.name} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-black text-lg">{chat.partner.name}</h3>
          <p className="text-zinc-500 text-xs mt-1">Matched 3 days ago</p>
          <button className="mt-4 px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold">
            View Profile
          </button>
        </div>

        {messages.map((msg, idx) => (
          <div 
            key={msg.id} 
            className={`max-w-[75%] flex flex-col ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}
          >
            <div 
              className={`px-4 py-2.5 rounded-[20px] text-sm leading-snug ${
                msg.sender === 'me' 
                  ? 'bg-[#8B0000] text-white' 
                  : 'bg-zinc-900 text-zinc-200'
              }`}
            >
              {msg.text}
            </div>
            {idx === messages.length - 1 && msg.sender === 'me' && (
              <span className="text-[9px] text-zinc-600 mt-1 self-end font-medium">Seen</span>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 safe-bottom">
        <div className="flex items-center gap-3 bg-black rounded-full pl-4 pr-1.5 py-1.5 border border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-[#8B0000] flex items-center justify-center flex-shrink-0">
             <Phone size={14} className="text-white" />
          </div>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message..." 
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-zinc-600"
          />
          {inputText.trim() ? (
            <button 
              onClick={handleSend}
              className="px-4 py-1 text-[#8B0000] font-black text-sm uppercase tracking-tighter transition-all"
            >
              Send
            </button>
          ) : (
            <div className="flex gap-3 px-2">
               <ShieldAlert size={22} className="text-zinc-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDetailScreen;
