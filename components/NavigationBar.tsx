
import React from 'react';
import { Home, Heart, MessageCircle, User } from 'lucide-react';
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black border-t border-zinc-900 px-6 py-3 flex justify-between items-center z-50 safe-bottom">
      <button 
        onClick={() => onNavigate('home')}
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <Home className={getIconColor('home')} size={24} strokeWidth={activeScreen === 'home' ? 2.5 : 2} />
      </button>

      <button 
        onClick={() => onNavigate('matches')}
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <Heart className={getIconColor('matches')} size={24} strokeWidth={activeScreen === 'matches' ? 2.5 : 2} />
      </button>

      <button 
        onClick={() => onNavigate('chat-list')}
        className="flex flex-col items-center gap-1 relative transition-transform active:scale-90"
      >
        <MessageCircle className={getIconColor('chat-list')} size={24} strokeWidth={activeScreen === 'chat-list' ? 2.5 : 2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#C41E3A] text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] flex justify-center items-center h-4">
            {unreadCount}
          </span>
        )}
      </button>

      <button 
        onClick={() => onNavigate('profile')}
        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
      >
        <User className={getIconColor('profile')} size={24} strokeWidth={activeScreen === 'profile' ? 2.5 : 2} />
      </button>
    </nav>
  );
};

export default NavigationBar;
