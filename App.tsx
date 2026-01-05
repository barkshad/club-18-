
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
  const [sessionBypassed, setSessionBypassed] = useState(false);

  useEffect(() => {
    const savedBypass = sessionStorage.getItem('club_18_bypass') === 'true';
    if (savedBypass) {
      setSessionBypassed(true);
      setCurrentScreen('feed');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().status === 'verified_member') {
            if (!sessionBypassed) setCurrentScreen('feed');
          }
        } catch (e) {
          console.warn("Auth check deferred.");
        }
      } else {
        setCurrentUser(null);
        if (!sessionBypassed && sessionStorage.getItem('club_18_bypass') !== 'true') {
          setCurrentScreen('age-gate');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sessionBypassed]);

  const handleVerify = () => {
    sessionStorage.setItem('club_18_bypass', 'true');
    setSessionBypassed(true);
    setCurrentScreen('feed');
  };

  const handleMemberTap = (uid: string) => {
    setViewingProfileId(uid);
    setCurrentScreen('profile');
  };

  const handleNavigate = (screen: AppScreen) => {
    if (screen === 'profile') {
      setViewingProfileId(auth.currentUser?.uid || 'guest-1');
    } else {
      setViewingProfileId(null);
    }
    setCurrentScreen(screen);
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-2 border-[#8B0000]/10 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin shadow-[0_0_25px_rgba(139,0,0,0.6)]"></div>
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 animate-pulse">Authenticating...</p>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'age-gate':
        return <AgeGate onVerify={handleVerify} />;
      case 'feed':
        return <FeedScreen onMemberTap={handleMemberTap} />;
      case 'explore':
        return <ExploreScreen onSelectPost={handleMemberTap} />;
      case 'create':
        return <CreatePostScreen onSuccess={() => setCurrentScreen('feed')} />;
      case 'profile':
        return <ProfileScreen 
          userId={viewingProfileId || 'guest-1'} 
          onBack={() => setCurrentScreen('feed')} 
        />;
      default:
        return <FeedScreen onMemberTap={handleMemberTap} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent overflow-hidden relative max-w-md mx-auto shadow-[0_0_100px_rgba(0,0,0,1)] border-x border-white/5">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-16 relative z-10">
        {renderScreen()}
      </main>
      {currentScreen !== 'age-gate' && (
        <NavigationBar activeScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export default App;
