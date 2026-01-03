
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  interests?: string[];
  location: string;
  isMatch?: boolean;
}

export interface Post {
  id: string;
  uid: string;
  url: string;
  type: 'image' | 'video';
  timestamp: number;
  caption?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
  matchId: string;
}

export interface ChatThread {
  id: string;
  // Fix: Changed partnerId: string to partner: UserProfile to match usage in data.ts and ChatListScreen.tsx
  partner: UserProfile;
  lastMessage: Message;
  unreadCount: number;
}

export type AppScreen = 'age-gate' | 'home' | 'matches' | 'chat-list' | 'chat-detail' | 'profile';