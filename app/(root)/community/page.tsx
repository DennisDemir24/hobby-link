import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";

import { CommunityModalWrapper } from "@/components/wrappers/CommunityModalWrapper";
import { CommunitiesFilter } from "@/components/community/CommunitiesFilter";


// Server component
export default async function CommunitiesPage() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 pb-6 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
            <p className="text-muted-foreground mt-1">
              Connect with others who share your interests
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <CommunityModalWrapper 
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              buttonText={
                <>
                  <Plus className="h-4 w-4" />
                  Add New Community
                </>
              }
            />
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      }>
        <CommunitiesList userId={userId} />
      </Suspense>
    </div>
  );
}

async function CommunitiesList({ userId }: { userId: string }) {
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
        members: {
          where: {
            userId: userId
          },
          select: {
            userId: true
          }
        },
        hobby: {
          select: {
            name: true
          }
        }
      },
      take: 50,
    });

    if (communities.length === 0) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <h3 className="text-xl font-medium text-gray-900">No communities yet</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            Communities are a great way to connect with others who share your interests.
            Be the first to create a community!
          </p>
          <CommunityModalWrapper 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            buttonText={
              <>
                <Plus className="h-4 w-4" />
                Create Community
              </>
            }
          />
        </div>
      );
    }

    return (
      <>
        <CommunitiesFilter communities={communities} userId={userId} />
      </>
    );
  } catch (error) {
    console.error("Error fetching communities:", error);
    return (
      <div className="text-center py-10 bg-red-50 rounded-xl">
        <h3 className="text-lg font-medium text-destructive">Error loading communities</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          We encountered an issue while loading communities.
        </p>
        <button 
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
}