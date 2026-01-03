
export interface UserSocials {
  instagram?: string;
  whatsapp?: string;
  tiktok?: string;
  x?: string;
  onlyfans?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  location: string;
  socials?: UserSocials;
  status?: string;
  createdAt?: number;
  // Fix: Added interests property to match data.ts usage
  interests?: string[];
}

export interface Post {
  id: string;
  uid: string;
  url: string;
  type: 'image' | 'video';
  timestamp: number;
  caption?: string;
  userName?: string;
  userImage?: string;
}

// Fix: Added Message interface for ChatDetailScreen
export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  matchId: string;
  type?: 'text' | 'image';
  image?: string;
}

// Fix: Added Conversation interface for ChatListScreen
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  timestamp: number;
  participantData?: {
    [uid: string]: {
      name: string;
      image: string;
      username: string;
    }
  };
}

// Fix: Added ChatThread interface for mock data in data.ts
export interface ChatThread {
  id: string;
  partner: UserProfile;
  lastMessage: {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
    isRead: boolean;
    matchId: string;
  };
  unreadCount: number;
}

export type AppScreen = 'age-gate' | 'feed' | 'explore' | 'create' | 'profile';
