export interface User {
  id: string;
  name?: string;
  imageUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Participant {
  userId: string;
  user: User;
  hasSeenLatest: boolean;
}

export interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: Participant[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
} 