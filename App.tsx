
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AppScreen } from './types';
import AgeGate from './screens/AgeGate';
import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import NavigationBar from './components/NavigationBar';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('age-gate');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setHasProfile(true);
          setCurrentScreen('home');
        } else {
          setHasProfile(false);
          setCurrentScreen('profile');
        }
      } else {
        setCurrentScreen('age-gate');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const navigateToChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setCurrentScreen('chat-detail');
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-[#8B0000] border-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'age-gate':
        return <AgeGate onVerify={() => {}} />; // Verification handled inside AgeGate
      case 'home':
        return <HomeScreen onLike={() => {}} onNavigateToMatches={() => setCurrentScreen('matches')} />;
      case 'matches':
        return <MatchesScreen onChat={navigateToChat} />;
      case 'chat-list':
        return <ChatListScreen onChatSelect={navigateToChat} />;
      case 'chat-detail':
        return <ChatDetailScreen matchId={selectedChatId || ''} onBack={() => setCurrentScreen('chat-list')} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onLike={() => {}} onNavigateToMatches={() => setCurrentScreen('matches')} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative max-w-md mx-auto shadow-2xl border-x border-zinc-900">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-16">
        {renderScreen()}
      </main>
      
      {currentUser && currentScreen !== 'chat-detail' && (
        <NavigationBar 
          activeScreen={currentScreen} 
          onNavigate={(screen) => setCurrentScreen(screen)} 
          unreadCount={0}
        />
      )}
    </div>
  );
};

export default App;
