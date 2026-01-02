
import React from 'react';
import { MOCK_USERS } from '../data';
import { Heart, MoreHorizontal, ShieldCheck, MessageCircle, Send, Bookmark } from 'lucide-react';

interface HomeScreenProps {
  onLike: (id: string) => void;
  onNavigateToMatches: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLike, onNavigateToMatches }) => {
  return (
    <div className="flex flex-col bg-black min-h-screen">
      {/* Top Header - IG Style */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-zinc-900">
        <h1 className="text-2xl font-black tracking-tighter italic">CLUB 18<span className="text-[#8B0000] not-italic">+</span></h1>
        <div className="flex gap-6 items-center">
           <Heart size={24} className="text-white" strokeWidth={2} />
           <div className="relative">
             <MessageCircle size={24} className="text-white" strokeWidth={2} />
             <span className="absolute -top-1 -right-1 bg-[#8B0000] w-2 h-2 rounded-full"></span>
           </div>
        </div>
      </header>

      {/* Stories Bar (Featured Members) */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-4 border-b border-zinc-900 bg-black">
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="w-[74px] h-[74px] rounded-full p-[2px] bg-zinc-800">
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative">
              <img src="https://picsum.photos/seed/myprofile/200" className="w-full h-full object-cover grayscale opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-[#8B0000] rounded-full flex items-center justify-center border-2 border-black">
                   <span className="text-white text-lg font-bold mt-[-2px]">+</span>
                </div>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500">Your Story</span>
        </div>
        {MOCK_USERS.map((user) => (
          <div key={user.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-[74px] h-[74px] rounded-full p-[2px] bg-gradient-to-tr from-[#8B0000] to-white/20">
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[11px] text-zinc-300 max-w-[72px] truncate">{user.name}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="flex flex-col">
        {MOCK_USERS.map((user) => (
          <div key={user.id} className="relative w-full mb-6 bg-black">
            {/* User Info Header */}
            <div className="flex items-center px-3 py-2.5 gap-3">
              <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-[#8B0000] to-zinc-700">
                <div className="w-full h-full rounded-full border border-black overflow-hidden">
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                   <span className="text-sm font-bold tracking-tight">{user.name}</span>
                   <ShieldCheck size={12} className="text-[#8B0000]" fill="currentColor" />
                </div>
                <span className="text-[10px] text-zinc-500 font-medium tracking-tight uppercase">{user.location}</span>
              </div>
              <button className="ml-auto text-zinc-400">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Main Content Area - IG Square Post */}
            <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
              <img 
                src={user.image} 
                alt={user.name} 
                className="w-full h-full object-cover" 
                onDoubleClick={() => onLike(user.id)}
              />
            </div>

            {/* Interaction Row */}
            <div className="px-3 pt-3 pb-2 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => onLike(user.id)}
                  className="transition-transform active:scale-125 hover:text-[#8B0000]"
                >
                  <Heart size={28} className="text-white" strokeWidth={1.5} />
                </button>
                <button className="transition-transform active:scale-110">
                  <MessageCircle size={28} className="text-white" strokeWidth={1.5} />
                </button>
                <button className="transition-transform active:scale-110">
                  <Send size={26} className="text-white" strokeWidth={1.5} />
                </button>
              </div>
              <button className="transition-transform active:scale-110">
                <Bookmark size={28} className="text-white" strokeWidth={1.5} />
              </button>
            </div>

            {/* Social Proof & Caption */}
            <div className="px-4 space-y-1.5">
              <p className="text-xs font-bold text-white">
                Liked by <span className="font-black text-[#8B0000]">Elite Members</span> and <span className="hover:underline cursor-pointer font-black text-[#8B0000]">others</span>
              </p>
              <div className="text-sm leading-snug">
                <span className="font-black mr-2 text-white uppercase tracking-tighter text-[13px]">{user.name}</span>
                <span className="text-zinc-400 font-light">{user.bio}</span>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 pt-1">
                {user.interests.map(interest => (
                  <span key={interest} className="text-[11px] text-[#8B0000] font-black tracking-widest uppercase italic">
                    #{interest.replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-zinc-700 uppercase tracking-[0.2em] font-black pt-1">
                2 hours ago
              </p>
            </div>
          </div>
        ))}
        
        {/* End of Feed Footer */}
        <div className="py-24 text-center px-10 border-t border-zinc-900 mt-4 bg-zinc-950">
          <div className="w-12 h-12 rounded-full bg-black border border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <ShieldCheck size={24} className="text-[#8B0000]" />
          </div>
          <h3 className="text-lg font-black tracking-tighter mb-2 italic">CLUB 18+ PRIVACY</h3>
          <p className="text-zinc-600 text-[11px] mb-8 leading-relaxed uppercase tracking-widest font-bold">You are browsing the premium members feed. All connections are end-to-end encrypted.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-white font-black text-[10px] tracking-[0.3em] border border-white/20 px-10 py-4 rounded-md hover:bg-white hover:text-black transition-all bg-black active:scale-95"
          >
            REFRESH DISCOVERY
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
