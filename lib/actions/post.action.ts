"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

interface CreatePostParams {
  title: string;
  content: string;
  communityId: string;
  tags?: string[];
}

export async function createPost({
  title,
  content,
  communityId,
  tags = [],
}: CreatePostParams) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify the user exists in our database
    let user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

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

    // Check if the community exists
    const community = await db.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!community) {
      throw new Error("Community not found");
    }

    // Verify user is a member of the community
    if (community.members.length === 0) {
      throw new Error("You must be a member of the community to create posts");
    }

    // Create the post
    const post = await db.post.create({
      data: {
        title,
        content,
        tags,
        author: {
          connect: {
            clerkUserId: userId,
          },
        },
        community: {
          connect: {
            id: communityId,
          },
        },
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/community/${communityId}`);

    return post;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function getPosts(communityId: string) {
  try {
    const posts = await db.post.findMany({
      where: {
        communityId,
        published: true,
      },
      include: {
        author: {
          select: {
            name: true,
            imageUrl: true,
            clerkUserId: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        community: {
          include: {
            members: true,
          },
        },
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}

export async function likePost(postId: string) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        likes: {
          where: {
            userId,
          },
        },
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Toggle like: Remove if exists, add if doesn't
    if (post.likes.length > 0) {
      // Unlike the post
      await db.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // Like the post
      await db.like.create({
        data: {
          user: {
            connect: {
              clerkUserId: userId,
            },
          },
          post: {
            connect: {
              id: postId,
            },
          },
        },
      });
    }

    // Revalidate relevant paths
    revalidatePath(`/community/${post.communityId}`);
    revalidatePath(`/community/${post.communityId}/post/${postId}`);

    return { success: true };
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw error;
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        community: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Verify user is a member of the community
    if (post.community.members.length === 0) {
      throw new Error("You must be a member of the community to comment");
    }

    // Create the comment
    const comment = await db.comment.create({
      data: {
        content,
        author: {
          connect: {
            clerkUserId: userId,
          },
        },
        post: {
          connect: {
            id: postId,
          },
        },
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/community/${post.communityId}`);
    revalidatePath(`/community/${post.communityId}/post/${postId}`);

    return comment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

export async function deletePost(postId: string) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        community: {
          include: {
            members: {
              where: {
                userId,
                role: "ADMIN"
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if the user is the author or a community admin
    const isAuthor = post.authorId === userId;
    const isAdmin = post.community.members.length > 0;

    if (!isAuthor && !isAdmin) {
      throw new Error("You don't have permission to delete this post");
    }

    // Delete the post (this will cascade delete comments and likes due to relation settings)
    await db.post.delete({
      where: { id: postId },
    });

    // Revalidate relevant paths
    revalidatePath(`/community/${post.communityId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

export async function editPost(postId: string, updateData: { title: string; content: string; tags?: string[] }) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the post exists and if the user is the author
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        community: true,
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Only the author can edit the post
    if (post.authorId !== userId) {
      throw new Error("You can only edit your own posts");
    }

    // Update the post
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: {
        title: updateData.title,
        content: updateData.content,
        tags: updateData.tags || post.tags,
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/community/${post.communityId}`);
    revalidatePath(`/community/${post.communityId}/post/${postId}`);

    return updatedPost;
  } catch (error) {
    console.error("Error editing post:", error);
    throw error;
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the comment exists
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          include: {
            community: {
              include: {
                members: {
                  where: {
                    userId,
                    role: "ADMIN"
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if the user is the author or a community admin
    const isAuthor = comment.authorId === userId;
    const isAdmin = comment.post.community.members.length > 0;

    if (!isAuthor && !isAdmin) {
      throw new Error("You don't have permission to delete this comment");
    }

    // Delete the comment
    await db.comment.delete({
      where: { id: commentId },
    });

    // Revalidate relevant paths
    revalidatePath(`/community/${comment.post.communityId}`);
    revalidatePath(`/community/${comment.post.communityId}/post/${comment.postId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

export async function editComment(commentId: string, content: string) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the comment exists and if the user is the author
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only the author can edit the comment
    if (comment.authorId !== userId) {
      throw new Error("You can only edit your own comments");
    }

    // Update the comment
    const updatedComment = await db.comment.update({
      where: { id: commentId },
      data: {
        content,
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/community/${comment.post.communityId}`);
    revalidatePath(`/community/${comment.post.communityId}/post/${comment.postId}`);

    return updatedComment;
  } catch (error) {
    console.error("Error editing comment:", error);
    throw error;
  }
} 