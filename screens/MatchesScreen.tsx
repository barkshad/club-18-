
import React from 'react';
import { MOCK_USERS } from '../data';
import { Heart, Search, Grid, Layout } from 'lucide-react';

interface MatchesScreenProps {
  matchedIds: string[];
  onChat: (id: string) => void;
}

const MatchesScreen: React.FC<MatchesScreenProps> = ({ matchedIds, onChat }) => {
  // Demo logic to ensure something is always shown
  const displayIds = matchedIds.length > 0 ? matchedIds : ['1', '3', '4'];

  return (
    <div className="flex flex-col min-h-full bg-black">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black tracking-tighter italic">CONNECTIONS</h1>
          <div className="flex gap-4">
            <Layout size={20} className="text-zinc-500" />
            <Grid size={20} className="text-white" />
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Search connections..." 
            className="w-full bg-zinc-900 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none"
          />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-[1px] bg-zinc-900">
        {MOCK_USERS.filter(u => displayIds.includes(u.id)).map(user => (
          <div 
            key={user.id} 
            className="relative aspect-square cursor-pointer group bg-black"
            onClick={() => onChat(user.id)}
          >
            <img 
              src={user.image} 
              alt={user.name} 
              className="w-full h-full object-cover transition-opacity group-hover:opacity-80" 
            />
            {/* Red accent for active match */}
            <div className="absolute top-2 right-2 flex gap-1">
               <div className="w-2.5 h-2.5 bg-[#8B0000] rounded-full ring-2 ring-black shadow-lg"></div>
            </div>
            
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] font-black truncate text-white drop-shadow-md uppercase tracking-tighter">
                {user.name}
              </p>
            </div>
          </div>
        ))}

        {/* Empty placeholder squares for grid aesthetic */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square bg-zinc-950 flex items-center justify-center">
             <Heart size={16} className="text-zinc-900" />
          </div>
        ))}
      </div>

      <div className="p-8 text-center bg-black">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-zinc-900 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse"></span>
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Live Connections Only</span>
        </div>
        <h4 className="text-sm font-bold mb-1 uppercase tracking-tight">The Inner Circle</h4>
        <p className="text-[10px] text-zinc-600 leading-relaxed mb-6">Premium members see 4x more engagement through direct messaging priority.</p>
        <button className="w-full py-4 bg-white text-black text-xs font-black tracking-[0.2em] rounded-md transition-all active:scale-95">
          ACTIVATE PREMIUM ACCESS
        </button>
      </div>
    </div>
  );
};

export default MatchesScreen;
