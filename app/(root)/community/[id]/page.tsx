import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { JoinCommunityButton } from "@/components/community/JoinCommunityButton";

interface CommunityPageProps {
  params: {
    id: string;
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
    const session = await auth();
    const userId = session?.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  const community = await db.community.findUnique({
    where: {
      id: params.id,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      hobby: true,
    },
  });

  if (!community) {
    notFound();
  }

  // Check if the current user is a member
  const isMember = community.members.some(member => member.userId === userId);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{community.name}</h1>
        <p className="text-muted-foreground mt-2">{community.description}</p>
        
        {/* Add join button if not a member */}
        {!isMember && (
          <div className="mt-4">
            <JoinCommunityButton communityId={community.id} isMember={isMember} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Community content will go here */}
          <div className="bg-muted p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium">Community Content</h3>
            <p className="text-muted-foreground mt-1">
              This is where community posts and discussions will appear.
            </p>
          </div>
        </div>
        <div>
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Members ({community.members.length})</h3>
            <ul className="space-y-2">
              {community.members.map((member) => (
                <li key={member.userId} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {member.user.name?.[0] || "U"}
                  </div>
                  <span>
                    {member.user.name}
                    {member.role === "ADMIN" && (
                      <span className="text-xs text-muted-foreground ml-1">(Admin)</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-card p-4 rounded-lg shadow-sm mt-4">
            <h3 className="text-lg font-medium mb-4">Related Hobby</h3>
            <div className="space-y-2">
              <div>
                <Link href={`/hobby/${community.hobby.id}`} className="text-primary hover:underline">
                  {community.hobby.name}
                </Link>
                {community.hobby.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {community.hobby.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}