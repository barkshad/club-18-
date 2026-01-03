
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
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('age-gate');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to generate a consistent chat ID between two users
  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('--');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        const tryFetchProfile = async (uid: string, retries = 2): Promise<void> => {
          try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
              // If user exists, but we are in onboarding, we might want to stay in profile
              // But generally, go to home after auth
              if (currentScreen === 'age-gate') setCurrentScreen('home');
            } else {
              setCurrentScreen('profile');
            }
          } catch (err: any) {
            console.warn(`Profile check: ${err.message}`);
            if (retries > 0 && (err.code === 'permission-denied' || err.code === 'unauthenticated')) {
              await new Promise(resolve => setTimeout(resolve, 800));
              return tryFetchProfile(uid, retries - 1);
            }
            setCurrentScreen('profile');
          }
        };

        await tryFetchProfile(user.uid);
      } else {
        setCurrentUser(null);
        setCurrentScreen('age-gate');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentScreen]);

  const navigateToChat = (partnerUid: string) => {
    if (!auth.currentUser) return;
    const chatId = getChatId(auth.currentUser.uid, partnerUid);
    setSelectedChatId(chatId);
    setCurrentScreen('chat-detail');
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(139,0,0,0.5)]"></div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'age-gate':
        return <AgeGate onVerify={() => {}} />;
      case 'home':
        return <HomeScreen onMessage={navigateToChat} onNavigateToMatches={() => setCurrentScreen('matches')} />;
      case 'matches':
        return <MatchesScreen matchedIds={[]} onChat={navigateToChat} />;
      case 'chat-list':
        return <ChatListScreen onChatSelect={(id) => { setSelectedChatId(id); setCurrentScreen('chat-detail'); }} />;
      case 'chat-detail':
        return <ChatDetailScreen chatId={selectedChatId || ''} onBack={() => setCurrentScreen('chat-list')} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onMessage={navigateToChat} onNavigateToMatches={() => setCurrentScreen('matches')} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative max-w-md mx-auto shadow-2xl border-x border-zinc-900">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-16">
        {renderScreen()}
      </main>
      
      {currentUser && currentScreen !== 'chat-detail' && currentScreen !== 'age-gate' && (
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
