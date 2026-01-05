
export interface UserSocials {
  instagram?: string;
  whatsapp?: string;
  phone?: string;
  tiktok?: string;
  x?: string;
  onlyfans?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  age: number;
  bio: string;
  image: string; // Mandatory Photo
  videoUrl?: string; // Mandatory Video
  location: string;
  area?: string;
  distance?: number; // Distance in km
  availableFor?: string;
  intent?: string;
  verified: boolean;
  socials?: UserSocials;
  status: 'verified_member' | 'pending_onboarding' | 'guest';
  isOnline: boolean;
  // Fix: Added missing interests property required by MOCK_USERS in data.ts
  interests?: string[];
}

// Fix: Added missing Message interface exported for screens and data.ts
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  matchId: string;
  isRead?: boolean;
  type?: 'text' | 'image';
  image?: string;
}

// Fix: Added missing Conversation interface exported for ChatListScreen.tsx
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

// Fix: Added missing ChatThread interface exported for data.ts
export interface ChatThread {
  id: string;
  partner: UserProfile;
  lastMessage: Message;
  unreadCount: number;
}

// Fix: Added missing Post interface exported for ExploreScreen.tsx and CreatePostScreen.tsx
export interface Post {
  id: string;
  uid: string;
  userName: string;
  userImage: string;
  url: string;
  caption: string;
  type: 'image' | 'video';
  timestamp: number;
}

export type AppScreen = 'age-gate' | 'feed' | 'explore' | 'create' | 'profile';
