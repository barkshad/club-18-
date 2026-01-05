
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

// Added missing Message interface to fix screens/ChatDetailScreen.tsx
export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  matchId: string;
  type?: 'text' | 'image';
  image?: string;
  isRead?: boolean;
}

// Added missing ChatThread interface to fix data.ts
export interface ChatThread {
  id: string;
  partner: UserProfile;
  lastMessage: Message;
  unreadCount: number;
}

// Added missing Conversation interface to fix screens/ChatListScreen.tsx
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
    };
  };
}

export type AppScreen = 'age-gate' | 'feed' | 'explore' | 'create' | 'profile';
