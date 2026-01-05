
import { UserProfile, ChatThread } from './types';

// Fix: Added missing mandatory properties and interests to match updated UserProfile interface
export const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    username: 'seraphina_arch',
    name: 'Seraphina',
    age: 24,
    bio: 'Architect by day, dreamer by night. Looking for someone who appreciates jazz and fine wine.',
    image: 'https://picsum.photos/seed/sera/600/900',
    interests: ['Jazz', 'Design', 'Wine'],
    location: 'Paris, FR',
    verified: true,
    status: 'verified_member',
    isOnline: true
  },
  {
    id: '2',
    username: 'julian_tech',
    name: 'Julian',
    age: 28,
    bio: 'Tech entrepreneur. I love high-speed driving and deep conversations under the stars.',
    image: 'https://picsum.photos/seed/jul/600/900',
    interests: ['Cars', 'Tech', 'Astrology'],
    location: 'New York, US',
    verified: true,
    status: 'verified_member',
    isOnline: false
  },
  {
    id: '3',
    username: 'elena_piano',
    name: 'Elena',
    age: 26,
    bio: 'Classical pianist. If you can handle Rachmaninoff, you can handle me.',
    image: 'https://picsum.photos/seed/ele/600/900',
    interests: ['Music', 'Concerts', 'Fine Dining'],
    location: 'Vienna, AT',
    verified: true,
    status: 'verified_member',
    isOnline: true
  },
  {
    id: '4',
    username: 'marcus_fit',
    name: 'Marcus',
    age: 31,
    bio: 'Fitness enthusiast and chef. I believe the way to the heart is through a perfectly seared steak.',
    image: 'https://picsum.photos/seed/marc/600/900',
    interests: ['Cooking', 'Gym', 'Travel'],
    location: 'London, UK',
    verified: false,
    status: 'verified_member',
    isOnline: false
  },
  {
    id: '5',
    username: 'clara_arts',
    name: 'Clara',
    age: 22,
    bio: 'Art history student. I spend most of my time in museums or sketching in the park.',
    image: 'https://picsum.photos/seed/cla/600/900',
    interests: ['Art', 'History', 'Sketching'],
    location: 'Berlin, DE',
    verified: true,
    status: 'verified_member',
    isOnline: true
  }
];

export const MOCK_CHATS: ChatThread[] = [
  {
    id: 'c1',
    partner: MOCK_USERS[0],
    lastMessage: {
      id: 'm1',
      senderId: '1',
      text: 'I loved the restaurant suggestion!',
      timestamp: Date.now() - 3600000,
      isRead: false,
      matchId: 'c1'
    },
    unreadCount: 1
  },
  {
    id: 'c2',
    partner: MOCK_USERS[2],
    lastMessage: {
      id: 'm2',
      senderId: 'me',
      text: 'Are you free this weekend?',
      timestamp: Date.now() - 86400000,
      isRead: true,
      matchId: 'c2'
    },
    unreadCount: 0
  }
];
