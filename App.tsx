
import React, { useState, useEffect } from 'react';
import { AppScreen, UserProfile } from './types';
import AgeGate from './screens/AgeGate';
import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import NavigationBar from './components/NavigationBar';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('age-gate');
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [likedUserIds, setLikedUserIds] = useState<string[]>([]);
  const [matches, setMatches] = useState<string[]>([]);

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (verified === 'true') {
      setIsAgeVerified(true);
      setCurrentScreen('home');
    }
  }, []);

  const handleAgeVerify = () => {
    localStorage.setItem('age-verified', 'true');
    setIsAgeVerified(true);
    setCurrentScreen('home');
  };

  const navigateToChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setCurrentScreen('chat-detail');
  };

  const handleLike = (userId: string) => {
    if (!likedUserIds.includes(userId)) {
      setLikedUserIds(prev => [...prev, userId]);
      // Simulation: 50% chance of a match for demo
      if (Math.random() > 0.5) {
        setMatches(prev => [...prev, userId]);
        alert("It's a Match! Club 18+ exclusive access granted.");
      }
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'age-gate':
        return <AgeGate onVerify={handleAgeVerify} />;
      case 'home':
        return <HomeScreen onLike={handleLike} onNavigateToMatches={() => setCurrentScreen('matches')} />;
      case 'matches':
        return <MatchesScreen matchedIds={matches} onChat={navigateToChat} />;
      case 'chat-list':
        return <ChatListScreen onChatSelect={navigateToChat} />;
      case 'chat-detail':
        return <ChatDetailScreen chatId={selectedChatId || ''} onBack={() => setCurrentScreen('chat-list')} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onLike={handleLike} onNavigateToMatches={() => setCurrentScreen('matches')} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative max-w-md mx-auto shadow-2xl">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-16">
        {renderScreen()}
      </main>
      
      {isAgeVerified && currentScreen !== 'age-gate' && currentScreen !== 'chat-detail' && (
        <NavigationBar 
          activeScreen={currentScreen} 
          onNavigate={(screen) => setCurrentScreen(screen)} 
          unreadCount={2}
        />
      )}
    </div>
  );
};

export default App;
