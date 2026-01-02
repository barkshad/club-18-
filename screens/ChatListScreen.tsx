
import React from 'react';
import { MOCK_CHATS } from '../data';
import { Search, PenSquare } from 'lucide-react';

interface ChatListScreenProps {
  onChatSelect: (id: string) => void;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ onChatSelect }) => {
  return (
    <div className="flex flex-col min-h-full">
      <header className="p-6 sticky top-0 bg-black/80 backdrop-blur-md z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
            <PenSquare size={20} className="text-zinc-400" />
          </button>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full bg-zinc-950 border border-zinc-900 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-[#C41E3A]/50 transition-colors"
          />
        </div>
      </header>

      <div className="px-2">
        {/* Active Threads */}
        <div className="mb-4">
           <h2 className="px-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-2">Recent Chats</h2>
           {MOCK_CHATS.map(chat => (
             <button 
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-zinc-950 active:bg-zinc-900 transition-colors rounded-2xl group"
             >
                <div className="relative">
                   <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-800">
                      <img src={chat.partner.image} alt={chat.partner.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full" />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{chat.partner.name}</span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-1 ${chat.unreadCount > 0 ? 'text-white font-medium' : 'text-zinc-500'}`}>
                    {chat.lastMessage.senderId === 'me' ? 'You: ' : ''}{chat.lastMessage.text}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-[#C41E3A] rounded-full flex items-center justify-center text-[10px] font-bold">
                    {chat.unreadCount}
                  </div>
                )}
             </button>
           ))}
        </div>

        {/* Suggestion Section */}
        <div className="mt-8 px-4">
           <h2 className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-4">Start something new</h2>
           <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {['https://picsum.photos/seed/a/200', 'https://picsum.photos/seed/b/200', 'https://picsum.photos/seed/c/200'].map((src, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                   <div className="w-16 h-16 rounded-full p-0.5 border-2 border-[#C41E3A]">
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-black">
                        <img src={src} className="w-full h-full object-cover" />
                      </div>
                   </div>
                   <span className="text-[10px] text-zinc-500">Active</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListScreen;
