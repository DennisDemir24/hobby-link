import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

import { CommunityCard } from "@/components/community/CommunityCard";
import { CommunityModalWrapper } from "@/components/wrappers/CommunityModalWrapper";

// Import the client component from a separate file


// Server component
export default async function CommunitiesPage() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Communities</h1>
        <CommunityModalWrapper />
      </div>

      <Suspense fallback={<div>Loading communities...</div>}>
        <CommunitiesList />
      </Suspense>
    </div>
  );
}

async function CommunitiesList() {
  try {
    const communities = await db.community.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      take: 50,
    });

    if (communities.length === 0) {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No communities yet</h3>
          <p className="text-muted-foreground mt-1">
            Be the first to create a community!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <CommunityCard 
            key={community.id} 
            community={community} 
            memberCount={community._count.members} 
          />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error fetching communities:", error);
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-destructive">Error loading communities</h3>
        <p className="text-muted-foreground mt-1">
          Please try again later.
        </p>
      </div>
    );
  }
}