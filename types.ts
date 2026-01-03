
export interface UserProfile {
  id: string;
  username?: string;
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
  type: 'image' | 'video' | 'audio';
  timestamp: number;
  caption?: string;
  userName?: string;
  userImage?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  image?: string;
  type?: 'text' | 'image';
  timestamp: number;
  isRead: boolean;
  matchId: string;
}

export interface ChatThread {
  id: string;
  partner: UserProfile;
  lastMessage: Message;
  unreadCount: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  timestamp: number;
  participantData: Record<string, {
    name: string;
    image: string;
    username: string;
  }>;
}

export type AppScreen = 'age-gate' | 'feed' | 'explore' | 'create' | 'inbox' | 'chat-detail' | 'profile';
