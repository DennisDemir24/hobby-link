export interface User {
  id: string;
  clerkUserId: string;
  name: string | null;
  imageUrl: string | null;
  email: string;
}

export interface MessageRead {
  id: string;
  userId: string;
  messageId: string;
  readAt: Date;
  user: User;
}

export interface Message {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  conversationId: string;
  sender: User;
  readBy: MessageRead[];
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  hasSeenLatest: boolean;
  createdAt: Date;
  user: User;
}

export interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string | null;
  communityId: string | null;
  participants: ConversationParticipant[];
  messages: Message[];
} 