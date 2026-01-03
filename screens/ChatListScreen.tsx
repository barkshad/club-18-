
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, limit, startAt, endAt } from 'firebase/firestore';
import { Search, PenSquare, MessageCircle, User } from 'lucide-react';
import { UserProfile, Conversation } from '../types';

interface ChatListScreenProps {
  onChatSelect: (id: string) => void;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ onChatSelect }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to generate consistent Chat ID
  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('--');
  };

  // Listen for active conversations
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", auth.currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const term = searchQuery.toLowerCase();
        // Search by username
        const q = query(
          collection(db, "users"),
          orderBy("username"),
          startAt(term),
          endAt(term + '\uf8ff'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const users = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
          .filter(u => u.id !== auth.currentUser?.uid);
          
        setSearchResults(users);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeout = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleStartChat = (partnerUid: string) => {
    if (!auth.currentUser) return;
    const chatId = getChatId(auth.currentUser.uid, partnerUid);
    onChatSelect(chatId);
  };

  const getPartnerData = (conv: Conversation) => {
    if (!auth.currentUser) return null;
    const partnerId = conv.participants.find(id => id !== auth.currentUser?.uid);
    return partnerId ? conv.participantData?.[partnerId] : null;
  };

  return (
    <div className="flex flex-col h-full bg-black fade-in">
      <header className="px-6 pt-6 pb-2 sticky top-0 bg-black/90 backdrop-blur-md z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black italic tracking-tighter">
            DIRECT<span className="text-[#8B0000]">.</span>
          </h1>
          <button onClick={() => setSearchQuery('')} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center active:scale-95 transition-transform">
            <PenSquare size={18} className="text-zinc-400" />
          </button>
        </div>
        
        <div className="relative mb-2">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-[#8B0000]/50 transition-colors text-white placeholder:text-zinc-600"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-2">
        {searchQuery ? (
          // Search Results
          <div className="space-y-1 mt-2">
            <h3 className="px-4 text-[10px] text-zinc-600 uppercase tracking-widest font-black mb-2">Search Results</h3>
            {searchResults.length === 0 && !isSearching ? (
              <div className="p-8 text-center opacity-40">
                <p className="text-[10px] uppercase tracking-widest">No members found</p>
              </div>
            ) : (
              searchResults.map(user => (
                <button 
                  key={user.id}
                  onClick={() => handleStartChat(user.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-zinc-900/50 active:bg-zinc-900 transition-colors rounded-2xl group"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                    {user.image ? (
                      <img src={user.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500"><User size={20} /></div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">@{user.username || 'member'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          // Conversation List
          <div className="space-y-1 mt-2">
             {conversations.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
                   <MessageCircle size={48} className="text-zinc-700" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">No Active Chats</p>
                   <p className="text-[9px] text-zinc-600 max-w-[200px] text-center leading-relaxed">Search for members to start an exclusive conversation.</p>
                </div>
             ) : (
               conversations.map(chat => {
                 const partnerData = getPartnerData(chat);
                 if (!partnerData) return null;
                 
                 return (
                  <button 
                      key={chat.id}
                      onClick={() => onChatSelect(chat.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-zinc-900/40 active:bg-zinc-900 transition-colors rounded-2xl group relative"
                  >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-800 group-hover:border-[#8B0000]/30 transition-colors">
                            {partnerData.image ? (
                              <img src={partnerData.image} alt={partnerData.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-900"><User size={20} className="text-zinc-600" /></div>
                            )}
                        </div>
                        {/* Status indicator could be added here if online presence was tracked */}
                      </div>
                      
                      <div className="flex-1 text-left overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-white group-hover:text-zinc-200 transition-colors truncate pr-2">
                             {partnerData.name}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-medium shrink-0">
                            {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                           <p className={`text-xs truncate text-zinc-500 group-hover:text-zinc-400 transition-colors max-w-[90%]`}>
                              {chat.participants[0] === auth.currentUser?.uid && chat.lastMessage === chat.lastMessage ? (
                                <span className="opacity-70">You: </span>
                              ) : null}
                              {chat.lastMessage}
                           </p>
                        </div>
                      </div>
                  </button>
                 );
               })
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListScreen;
