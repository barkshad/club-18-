
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AppScreen } from './types';
import AgeGate from './screens/AgeGate';
import FeedScreen from './screens/FeedScreen';
import ExploreScreen from './screens/ExploreScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import ProfileScreen from './screens/ProfileScreen';
import NavigationBar from './components/NavigationBar';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('age-gate');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.status === 'pending_onboarding') {
            setCurrentScreen('age-gate');
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

  const handleViewProfile = (uid: string) => {
    setViewingProfileId(uid);
    setCurrentScreen('profile');
  };

  const handleNavigate = (screen: AppScreen) => {
    if (screen === 'profile') {
      setViewingProfileId(auth.currentUser?.uid || null);
    } else {
      setViewingProfileId(null);
    }
    setCurrentScreen(screen);
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
        return <FeedScreen onMemberTap={handleViewProfile} />;
      case 'explore':
        return <ExploreScreen onSelectPost={handleViewProfile} />;
      case 'create':
        return <CreatePostScreen onSuccess={() => setCurrentScreen('feed')} />;
      case 'profile':
        return <ProfileScreen userId={viewingProfileId || auth.currentUser?.uid || ''} onBack={() => setCurrentScreen('feed')} />;
      default:
        return <FeedScreen onMemberTap={handleViewProfile} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative max-w-md mx-auto shadow-2xl border-x border-zinc-900">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-16">
        {renderScreen()}
      </main>
      
      {currentUser && currentScreen !== 'age-gate' && (
        <NavigationBar 
          activeScreen={currentScreen} 
          onNavigate={handleNavigate} 
        />
      )}
    </div>
  );
};

export default App;
