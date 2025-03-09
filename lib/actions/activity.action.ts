"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// Define a type for the metadata
type ActivityMetadata = Record<string, string | number | boolean | null>;

// Create activity record
export async function createActivity({
  type,
  userId,
  communityId,
  postId,
  content,
  metadata,
  recipientId,
}: {
  type: string;
  userId?: string;
  communityId?: string;
  postId?: string;
  content?: string;
  metadata?: ActivityMetadata;
  recipientId?: string;
}) {
  try {
    await db.activity.create({
      data: {
        type,
        content,
        userId,
        communityId,
        postId,
        metadata,
        recipientId,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    throw new Error("Failed to create activity");
  }
}

// Get activities for a user's feed
export async function getUserActivityFeed(limit = 20, page = 1) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get communities the user is a member of
    const userCommunities = await db.member.findMany({
      where: {
        userId,
      },
      select: {
        communityId: true,
      },
    });

    const communityIds = userCommunities.map((member) => member.communityId);

    // Get activities from communities the user is a member of
    const skip = (page - 1) * limit;
    
    const activities = await db.activity.findMany({
      where: {
        OR: [
          { communityId: { in: communityIds } }, // Community activities
          { userId }, // User's own activities
          { recipientId: userId }, // Activities directed at the user
        ],
      },
      include: {
        user: true,
        community: true,
        post: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalActivities = await db.activity.count({
      where: {
        OR: [
          { communityId: { in: communityIds } },
          { userId },
          { recipientId: userId },
        ],
      },
    });

    return {
      activities,
      totalPages: Math.ceil(totalActivities / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    throw new Error("Failed to fetch activity feed");
  }
}

// Get unread activities for the notification bell
export async function getUnreadActivities(limit = 5) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get communities the user is a member of
    const userCommunities = await db.member.findMany({
      where: {
        userId,
      },
      select: {
        communityId: true,
      },
    });

    const communityIds = userCommunities.map((member) => member.communityId);

    // Get unread activities
    const unreadActivities = await db.activity.findMany({
      where: {
        isRead: false,
        OR: [
          { communityId: { in: communityIds } }, // Community activities
          { recipientId: userId }, // Activities directed at the user
        ],
        // Don't include user's own activities in unread count
        NOT: {
          userId,
        },
      },
      include: {
        user: true,
        community: true,
        post: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const unreadCount = await db.activity.count({
      where: {
        isRead: false,
        OR: [
          { communityId: { in: communityIds } },
          { recipientId: userId },
        ],
        NOT: {
          userId,
        },
      },
    });

    return {
      activities: unreadActivities,
      totalUnread: unreadCount,
    };
  } catch (error) {
    console.error("Error fetching unread activities:", error);
    throw new Error("Failed to fetch unread activities");
  }
}

// Mark activities as read
export async function markActivitiesAsRead(activityIds: string[]) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await db.activity.updateMany({
      where: {
        id: {
          in: activityIds,
        },
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking activities as read:", error);
    throw new Error("Failed to mark activities as read");
  }
}

// Mark all activities as read
export async function markAllActivitiesAsRead() {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get communities the user is a member of
    const userCommunities = await db.member.findMany({
      where: {
        userId,
      },
      select: {
        communityId: true,
      },
    });

    const communityIds = userCommunities.map((member) => member.communityId);

    // Mark all relevant activities as read
    await db.activity.updateMany({
      where: {
        isRead: false,
        OR: [
          { communityId: { in: communityIds } },
          { recipientId: userId },
        ],
        NOT: {
          userId,
        },
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking all activities as read:", error);
    throw new Error("Failed to mark all activities as read");
  }
} 