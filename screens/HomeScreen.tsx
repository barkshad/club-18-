
import React from 'react';
import { MOCK_USERS } from '../data';
import { Heart, X, MoreHorizontal, ShieldCheck, MessageCircle, Send, Bookmark } from 'lucide-react';

interface HomeScreenProps {
  onLike: (id: string) => void;
  onNavigateToMatches: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLike, onNavigateToMatches }) => {
  return (
    <div className="flex flex-col bg-black min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-zinc-900">
        <h1 className="text-2xl font-black tracking-tighter italic">CLUB 18<span className="text-[#8B0000] not-italic">+</span></h1>
        <div className="flex gap-5 items-center">
           <Heart size={24} className="text-white" />
           <div className="relative">
             <MessageCircle size={24} className="text-white" />
             <span className="absolute -top-1 -right-1 bg-[#8B0000] w-2 h-2 rounded-full"></span>
           </div>
        </div>
      </header>

      {/* Stories Bar (Featured Members) */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-4 border-b border-zinc-900 bg-black">
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-[#8B0000] to-zinc-800">
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative">
              <img src="https://picsum.photos/seed/myprofile/200" className="w-full h-full object-cover grayscale brightness-75" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-zinc-400">Your Story</span>
        </div>
        {MOCK_USERS.map((user) => (
          <div key={user.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-[#8B0000] to-white/20">
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
          <div key={user.id} className="relative w-full mb-4 group">
            {/* User Info Header */}
            <div className="flex items-center px-3 py-2.5 gap-3">
              <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#8B0000] to-zinc-700">
                <div className="w-full h-full rounded-full border border-black overflow-hidden">
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                   <span className="text-sm font-bold tracking-tight">{user.name}, {user.age}</span>
                   <ShieldCheck size={12} className="text-[#8B0000]" />
                </div>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">{user.location}</span>
              </div>
              <button className="ml-auto text-zinc-400">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
              <img 
                src={user.image} 
                alt={user.name} 
                className="w-full h-full object-cover" 
              />
              
              {/* Quick Actions Overlay (Appears on Tap/Hover) */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            {/* Interaction Row */}
            <div className="px-3 py-3 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => onLike(user.id)}
                  className="transition-transform active:scale-125"
                >
                  <Heart size={26} className="text-white hover:text-[#8B0000] transition-colors" />
                </button>
                <button className="transition-transform active:scale-110">
                  <MessageCircle size={26} className="text-white" />
                </button>
                <button className="transition-transform active:scale-110">
                  <Send size={24} className="text-white" />
                </button>
              </div>
              <button className="transition-transform active:scale-110">
                <Bookmark size={26} className="text-white" />
              </button>
            </div>

            {/* Social Proof & Caption */}
            <div className="px-4 pb-4 space-y-1.5">
              <p className="text-xs font-bold">
                Liked by <span className="hover:underline cursor-pointer">Private Members</span> and <span className="hover:underline cursor-pointer">others</span>
              </p>
              <div className="text-sm leading-snug">
                <span className="font-bold mr-2">{user.name}</span>
                <span className="text-zinc-300 font-light">{user.bio}</span>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 pt-1">
                {user.interests.map(interest => (
                  <span key={interest} className="text-[11px] text-[#8B0000] font-semibold">
                    #{interest.toLowerCase().replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
              <button className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest pt-1">
                View all 48 comments
              </button>
              <p className="text-[9px] text-zinc-700 uppercase tracking-widest pt-0.5">
                2 hours ago
              </p>
            </div>
          </div>
        ))}
        
        {/* End of Feed */}
        <div className="py-24 text-center px-10 border-t border-zinc-900 mt-4 bg-zinc-950/50">
          <div className="w-16 h-16 rounded-full border-2 border-zinc-800 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-zinc-800" />
          </div>
          <h3 className="text-lg font-bold mb-2">You're all caught up</h3>
          <p className="text-zinc-600 text-sm mb-8 leading-relaxed">The Club algorithm has curated these exclusive profiles just for you based on your preferences.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-white font-black text-xs tracking-[0.2em] border-2 border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all"
          >
            RETURN TO TOP
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
