"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

interface CreateCommunityParams {
    name: string;
    description: string;
    hobbyId: string;
  }

  export async function createCommunity({
    name,
    description,
    hobbyId,
  }: CreateCommunityParams) {
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

        // Validate that the hobbyId exists
        if (!hobbyId || hobbyId.trim() === "") {
          throw new Error("A hobby must be selected for the community");
        }

        const hobby = await db.hobby.findUnique({
          where: { id: hobbyId }
        });

        if (!hobby) {
          throw new Error("Selected hobby not found");
        }

        // Create the community with the validated hobby
        const community = await db.community.create({
            data: {
              name,
              description,
              userId,
              hobby: {
                connect: {
                  id: hobbyId,
                },
              },
              // Connect the creator to the community
              users: {
                connect: {
                  clerkUserId: userId,
                },
              },
              // Add the creator as a member automatically
              members: {
                create: {
                  userId, // This is the clerkUserId that will be used in the Member model
                  role: "ADMIN", // The creator is the admin
                },
              },
            },
        });
  
      // Revalidate relevant paths
      revalidatePath("/community");
      revalidatePath(`/hobby/${hobbyId}`);
  
      return community;
    } catch (error) {
        console.error("Error creating community:", error);
        throw error;
    }
  }

  /**
   * Fetches communities related to a specific hobby
   */
  export async function getCommunitiesByHobby(hobbyId: string) {
    try {
      const communities = await db.community.findMany({
        where: {
          hobbyId: hobbyId,
        },
        include: {
          members: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return communities;
    } catch (error) {
      console.error("Error fetching communities by hobby:", error);
      throw error;
    }
  }

  /**
   * Allows a user to join a community
   */
  export async function joinCommunity(communityId: string) {
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

      // Check if the community exists
      const community = await db.community.findUnique({
        where: { id: communityId },
        include: {
          members: {
            where: { userId },
          },
          hobby: true,
        },
      });

      if (!community) {
        throw new Error("Community not found");
      }

      // Check if the user is already a member
      if (community.members.length > 0) {
        throw new Error("You are already a member of this community");
      }

      // Add the user as a member with MEMBER role
      await db.member.create({
        data: {
          userId,
          communityId,
          role: "MEMBER",
        },
      });

      // Connect the user to the community
      await db.community.update({
        where: { id: communityId },
        data: {
          users: {
            connect: {
              clerkUserId: userId,
            },
          },
        },
      });

      // Revalidate relevant paths
      revalidatePath(`/community/${communityId}`);
      revalidatePath(`/hobby/${community.hobby.id}`);

      return { success: true };
    } catch (error) {
      console.error("Error joining community:", error);
      throw error;
    }
  }