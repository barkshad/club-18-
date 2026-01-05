
import React from 'react';
import { Home, Search, PlusSquare, User, Zap } from 'lucide-react';
import { AppScreen } from '../types';

interface NavigationBarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeScreen, onNavigate }) => {
  const isSelected = (screen: AppScreen) => activeScreen === screen;

  const NavItem = ({ screen, icon: Icon }: { screen: AppScreen, icon: any }) => (
    <button 
      onClick={() => onNavigate(screen)}
      className="flex flex-col items-center gap-2 transition-all active:scale-90 group relative py-3"
    >
      <div className={`transition-all duration-300 ${isSelected(screen) ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'opacity-40 group-hover:opacity-100'}`}>
        <Icon 
          className={`${isSelected(screen) ? 'text-white' : 'text-zinc-400'}`} 
          size={24} 
          strokeWidth={isSelected(screen) ? 2.5 : 1.5} 
        />
      </div>
      
      {isSelected(screen) && (
        <div className="absolute -bottom-1 w-5 h-[2px] bg-gradient-to-r from-transparent via-[#8B0000] to-transparent shadow-[0_0_10px_#8B0000] rounded-full animate-in fade-in zoom-in duration-500"></div>
      )}
    </button>
  );

  return (
    <nav className="fixed bottom-6 left-6 right-6 max-w-md mx-auto glass-panel border border-white/10 rounded-[2.5rem] px-8 py-2 flex justify-between items-center z-50 safe-bottom shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:border-white/20 transition-all duration-500">
      <NavItem screen="feed" icon={Home} />
      <NavItem screen="explore" icon={Search} />
      
      {/* Premium Create Button Centerpiece */}
      <button 
        onClick={() => onNavigate('create')}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#8B0000] to-[#400000] border border-white/20 flex items-center justify-center -translate-y-6 shadow-2xl transition-all hover:scale-110 active:scale-95 glow-red btn-reflective ${isSelected('create') ? 'scale-110' : ''}`}
      >
        <PlusSquare size={28} className="text-white" strokeWidth={2.5} />
      </button>

      <NavItem screen="explore" icon={Zap} /> {/* Reusing explore for placeholder secondary action */}
      <NavItem screen="profile" icon={User} />
    </nav>
  );
};

export default NavigationBar;
