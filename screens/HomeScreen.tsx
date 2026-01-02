
import React from 'react';
import { MOCK_USERS } from '../data';
import { Heart, X, MoreHorizontal, ShieldCheck } from 'lucide-react';

interface HomeScreenProps {
  onLike: (id: string) => void;
  onNavigateToMatches: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLike, onNavigateToMatches }) => {
  return (
    <div className="flex flex-col bg-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-zinc-900">
        <h1 className="text-xl font-bold tracking-tight">CLUB 18<span className="text-[#C41E3A]">+</span></h1>
        <div className="flex gap-4">
           <ShieldCheck size={20} className="text-[#C41E3A]" />
           <MoreHorizontal size={20} className="text-zinc-600" />
        </div>
      </header>

      {/* Feed */}
      <div className="flex flex-col">
        {MOCK_USERS.map((user) => (
          <div key={user.id} className="relative w-full border-b border-zinc-900 group">
            {/* User Info Header (IG Style) */}
            <div className="flex items-center px-4 py-3 gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800">
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                   <span className="text-sm font-semibold">{user.name}, {user.age}</span>
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <span className="text-[10px] text-zinc-500">{user.location}</span>
              </div>
              <button className="ml-auto text-zinc-500">
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Profile Image (IG Style Post) */}
            <div className="relative aspect-[4/5] w-full bg-zinc-900 overflow-hidden">
              <img 
                src={user.image} 
                alt={user.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              
              {/* Overlaid Actions */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 drop-shadow-2xl">
                <button 
                  onClick={() => alert(`Skipped ${user.name}`)}
                  className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all active:scale-90 hover:bg-white/10"
                >
                  <X size={28} />
                </button>
                <button 
                  onClick={() => onLike(user.id)}
                  className="w-14 h-14 rounded-full bg-[#C41E3A]/80 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all active:scale-90 hover:bg-[#C41E3A]"
                >
                  <Heart size={28} fill="white" />
                </button>
              </div>
            </div>

            {/* Bio Section (IG Style Caption) */}
            <div className="px-4 py-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                {user.interests.map(interest => (
                  <span key={interest} className="text-[10px] px-2 py-1 bg-zinc-900 text-zinc-400 rounded-full font-medium">
                    #{interest.toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                <span className="font-bold mr-2">{user.name}</span>
                {user.bio}
              </p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-2">
                Recently Active
              </p>
            </div>
          </div>
        ))}
        
        {/* End of Feed */}
        <div className="py-20 text-center px-8">
          <p className="text-zinc-600 text-sm mb-4">You've seen all the latest members in your area.</p>
          <button 
            onClick={onNavigateToMatches}
            className="text-[#C41E3A] font-bold text-sm tracking-widest border border-[#C41E3A]/20 px-6 py-2 rounded-full"
          >
            VIEW MATCHES
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
