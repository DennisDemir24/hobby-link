"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createActivity } from "./activity.action";
import { sendEventToClients } from "@/app/api/messages/sse/route";

// Types
interface CreateConversationParams {
  receiverId?: string;
  name?: string;
  isGroup: boolean;
  memberIds?: string[];
  communityId?: string;
}

interface SendMessageParams {
  conversationId: string;
  content: string;
  imageUrl?: string;
}

// Create a new conversation
export async function createConversation({
  receiverId,
  name,
  isGroup,
  memberIds = [],
  communityId,
}: CreateConversationParams) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the user exists in our database
    let user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    // If user doesn't exist, we need to create them first
    if (!user) {
      // Get user details from Clerk
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        throw new Error("User not found");
      }

      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || `user-${userId}@example.com`,
          name: clerkUser.firstName || "User",
          imageUrl: clerkUser.imageUrl,
        }
      });
    }

    // For direct messages (not group chats)
    if (!isGroup && receiverId) {
      // Check if a conversation already exists between these two users
      const existingConversation = await db.conversation.findFirst({
        where: {
          isGroup: false,
          AND: [
            {
              participants: {
                some: {
                  userId: userId
                }
              }
            },
            {
              participants: {
                some: {
                  userId: receiverId
                }
              }
            }
          ]
        },
        include: {
          participants: true
        }
      });

      // If a conversation exists, return it
      if (existingConversation) {
        return existingConversation;
      }

      // Create a new conversation between the two users
      const newConversation = await db.conversation.create({
        data: {
          isGroup: false,
          creatorId: userId,
          participants: {
            createMany: {
              data: [
                { userId: userId },
                { userId: receiverId }
              ]
            }
          }
        },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      return newConversation;
    }

    // For group chats
    if (isGroup && memberIds.length > 0) {
      // Create a new group conversation
      const newGroupConversation = await db.conversation.create({
        data: {
          name,
          isGroup: true,
          creatorId: userId,
          communityId,
          participants: {
            createMany: {
              data: [
                { userId: userId },
                ...memberIds.map(memberId => ({ userId: memberId }))
              ]
            }
          }
        },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      // Create activity for group chat creation
      if (communityId) {
        await createActivity({
          type: "group_chat_created",
          userId: userId,
          communityId: communityId,
          content: `created a new group chat: ${name || "Unnamed Group"}`,
        });
      }

      return newGroupConversation;
    }

    throw new Error("Invalid conversation parameters");
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Failed to create conversation");
  }
}

// Get all conversations for the current user
export async function getConversations() {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const conversations = await db.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: true
          }
        }
      },
      orderBy: {
        messages: {
          _count: 'desc'
        }
      }
    });

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw new Error("Failed to fetch conversations");
  }
}

// Get a specific conversation with messages
export async function getConversationById(conversationId: string) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the user is a participant in this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    if (!conversation) {
      throw new Error("Conversation not found or you don't have access");
    }

    // Get messages for this conversation
    const messages = await db.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        sender: true,
        readBy: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Don't mark messages as read during render
    // This will be handled by a separate client-side action

    return {
      ...conversation,
      messages
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw new Error("Failed to fetch conversation");
  }
}

// Send a message in a conversation
export async function sendMessage({
  conversationId,
  content,
  imageUrl,
}: SendMessageParams) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the user is a participant in this conversation
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: true
      }
    });

    if (!conversation) {
      throw new Error("Conversation not found or you don't have access");
    }

    // Create the message
    const message = await db.message.create({
      data: {
        content,
        imageUrl,
        conversationId,
        senderId: userId,
      },
      include: {
        sender: true,
        readBy: true
      }
    });

    // Update the conversation's hasSeenLatest status
    await db.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: {
          not: userId
        }
      },
      data: {
        hasSeenLatest: false
      }
    });

    // Mark as seen for the sender
    await db.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId
      },
      data: {
        hasSeenLatest: true
      }
    });

    // Create activity for group chat message
    if (conversation.isGroup && conversation.communityId) {
      await createActivity({
        type: "group_message_sent",
        userId: userId,
        communityId: conversation.communityId,
        content: `sent a message in ${conversation.name || "a group chat"}`,
      });
    }

    // Send real-time update via SSE
    await sendEventToClients(
      'message',
      { message },
      conversationId,
      userId
    );

    revalidatePath(`/messages/${conversationId}`);
    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
}

// Mark messages as read - now a separate action that can be called from client
export async function markMessagesAsReadAction(conversationId: string) {
  try {
    const result = await markMessagesAsRead(conversationId);
    revalidatePath(`/messages/${conversationId}`);
    return result;
  } catch (error) {
    console.error("Error in mark messages action:", error);
    throw new Error("Failed to mark messages as read");
  }
}

// Mark messages as read - internal function without revalidation
export async function markMessagesAsRead(conversationId: string) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Find all unread messages in this conversation
    const messages = await db.message.findMany({
      where: {
        conversationId,
        senderId: {
          not: userId
        },
        readBy: {
          none: {
            userId
          }
        }
      }
    });

    // Mark each message as read
    for (const message of messages) {
      await db.messageRead.create({
        data: {
          userId,
          messageId: message.id
        }
      });
    }

    // Update the conversation's hasSeenLatest status
    await db.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId
      },
      data: {
        hasSeenLatest: true
      }
    });

    // Send real-time update via SSE
    if (messages.length > 0) {
      await sendEventToClients(
        'read',
        { 
          conversationId,
          userId,
          count: messages.length
        },
        conversationId
      );
    }

    return messages.length;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw new Error("Failed to mark messages as read");
  }
} 