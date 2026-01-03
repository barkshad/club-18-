
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AppScreen } from './types';
import AgeGate from './screens/AgeGate';
import FeedScreen from './screens/FeedScreen';
import ExploreScreen from './screens/ExploreScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import NavigationBar from './components/NavigationBar';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('age-gate');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('--');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.status === 'pending_onboarding') {
            setCurrentScreen('age-gate'); // AgeGate will handle step='onboard' internally or we can trigger it
          } else if (currentScreen === 'age-gate') {
            setCurrentScreen('feed');
          }
        } else {
          setCurrentScreen('age-gate');
        }
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
        <div className="w-10 h-10 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(139,0,0,0.5)]"></div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'age-gate':
        return <AgeGate onVerify={() => setCurrentScreen('feed')} />;
      case 'feed':
        return <FeedScreen onMessage={navigateToChat} />;
      case 'explore':
        return <ExploreScreen onSelectPost={(uid) => navigateToChat(uid)} />;
      case 'create':
        return <CreatePostScreen onSuccess={() => setCurrentScreen('feed')} />;
      case 'inbox':
        return <ChatListScreen onChatSelect={(id) => { setSelectedChatId(id); setCurrentScreen('chat-detail'); }} />;
      case 'chat-detail':
        return <ChatDetailScreen chatId={selectedChatId || ''} onBack={() => setCurrentScreen('inbox')} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <FeedScreen onMessage={navigateToChat} />;
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
