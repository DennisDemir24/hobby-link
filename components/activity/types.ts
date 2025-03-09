export interface Activity {
  id: string;
  type: string;
  content: string | null;
  createdAt: string | Date;
  isRead: boolean;
  userId: string | null;
  communityId: string | null;
  postId: string | null;
  recipientId: string | null;
  user?: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  } | null;
  community?: {
    id: string;
    name: string;
  } | null;
  post?: {
    id: string;
    title: string;
  } | null;
}

export interface ActivityFeedResult {
  activities: Activity[];
  totalPages: number;
  currentPage: number;
}

export interface UnreadActivitiesResult {
  activities: Activity[];
  totalUnread: number;
} 