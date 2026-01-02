
import React from 'react';
import { MOCK_USERS } from '../data';
import { Heart, Search } from 'lucide-react';

interface MatchesScreenProps {
  matchedIds: string[];
  onChat: (id: string) => void;
}

const MatchesScreen: React.FC<MatchesScreenProps> = ({ matchedIds, onChat }) => {
  // Use mock IDs if none matched yet to show UI
  const displayIds = matchedIds.length > 0 ? matchedIds : ['1', '3'];

  return (
    <div className="flex flex-col p-6 min-h-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Matches</h1>
          <p className="text-zinc-500 text-sm">Your private connections</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
          <Search size={20} className="text-zinc-400" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {MOCK_USERS.filter(u => displayIds.includes(u.id)).map(user => (
          <div 
            key={user.id} 
            className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer"
            onClick={() => onChat(user.id)}
          >
            <img 
              src={user.image} 
              alt={user.name} 
              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-sm font-bold truncate">{user.name}, {user.age}</h3>
              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Heart size={10} className="text-[#C41E3A]" fill="#C41E3A" />
                Mutual interest
              </p>
            </div>
            
            {/* Unread indicator */}
            <div className="absolute top-2 right-2 w-3 h-3 bg-[#C41E3A] rounded-full border-2 border-black" />
          </div>
        ))}

        {/* Mock Placeholder for Premium Vibe */}
        <div className="rounded-2xl border-2 border-dashed border-zinc-900 aspect-[3/4] flex flex-col items-center justify-center text-center p-4">
          <div className="w-10 h-10 rounded-full bg-zinc-900 mb-2 flex items-center justify-center">
            <Heart size={20} className="text-zinc-800" />
          </div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Waiting for next connection</p>
        </div>
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-zinc-950 border border-zinc-900 text-center">
        <h4 className="font-bold text-sm mb-2">Club 18+ Premium</h4>
        <p className="text-xs text-zinc-500 mb-4">See who already liked you and double your matches.</p>
        <button className="w-full py-3 bg-[#C41E3A] text-white rounded-full text-xs font-bold tracking-widest shadow-lg shadow-[#C41E3A]/20">
          UPGRADE MEMBERSHIP
        </button>
      </div>
    </div>
  );
};

export default MatchesScreen;
