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

        // If no hobbyId is provided, find or create a general hobby
        let finalHobbyId = hobbyId;
        if (!finalHobbyId || finalHobbyId.trim() === "") {
          // Find or create a general hobby
          const generalHobby = await db.hobby.findFirst({
            where: {
              name: "General",
            },
          });

          if (generalHobby) {
            finalHobbyId = generalHobby.id;
          } else {
            // Create a general hobby if it doesn't exist
            const newGeneralHobby = await db.hobby.create({
              data: {
                name: "General",
                description: "General hobby for communities without a specific hobby",
                tags: ["general"],
              },
            });
            finalHobbyId = newGeneralHobby.id;
          }
        }

        // Create the community
        const community = await db.community.create({
            data: {
              name,
              description,
              userId,
              hobby: {
                connect: {
                  id: finalHobbyId,
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
      revalidatePath(`/hobby/${finalHobbyId}`);
  
      return community;
    } catch (error) {
        console.error("Error creating community:", error);
        throw error;
    }
  }