
import React from 'react';
import { Home, Search, PlusSquare, MessageCircle, User } from 'lucide-react';
import { AppScreen } from '../types';

interface NavigationBarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  unreadCount?: number;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeScreen, onNavigate, unreadCount = 0 }) => {
  const getIconColor = (screen: AppScreen) => {
    return activeScreen === screen ? 'text-white' : 'text-zinc-600';
  };

  const NavItem = ({ screen, icon: Icon }: { screen: AppScreen, icon: any }) => (
    <button 
      onClick={() => onNavigate(screen)}
      className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group relative py-2"
    >
      <Icon 
        className={`${getIconColor(screen)} transition-colors`} 
        size={24} 
        strokeWidth={activeScreen === screen ? 2.5 : 1.5} 
      />
      {activeScreen === screen && (
        <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></span>
      )}
      {screen === 'inbox' && unreadCount > 0 && (
        <span className="absolute top-1 right-0 bg-[#8B0000] text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] flex justify-center items-center h-3.5 border border-black">
          {unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-panel border-t border-zinc-900/50 px-8 flex justify-between items-center z-50 safe-bottom">
      <NavItem screen="feed" icon={Home} />
      <NavItem screen="explore" icon={Search} />
      <NavItem screen="create" icon={PlusSquare} />
      <NavItem screen="inbox" icon={MessageCircle} />
      <NavItem screen="profile" icon={User} />
    </nav>
  );
};

export default NavigationBar;
