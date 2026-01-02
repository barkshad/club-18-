
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  interests: string[];
  location: string;
  isMatch?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  partner: UserProfile;
  lastMessage: Message;
  unreadCount: number;
}

export type AppScreen = 'age-gate' | 'home' | 'matches' | 'chat-list' | 'chat-detail' | 'profile';
