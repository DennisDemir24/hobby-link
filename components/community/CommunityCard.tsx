import Link from "next/link";
import { Users } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    members: { userId: string }[];
  };
  memberCount: number;
  currentUserId?: string;
}

export function CommunityCard({ community, memberCount, currentUserId }: CommunityCardProps) {
  // Check if the current user is a member
  const isMember = currentUserId ? community.members.some(member => member.userId === currentUserId) : false;

  return (
    <Link href={`/community/${community.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="line-clamp-1">{community.name}</CardTitle>
            {isMember && (
              <Badge variant="secondary" className="ml-2">Member</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">
            {community.description || "No description provided."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
          </div>
          <Badge variant="outline">
            {new Date(community.createdAt).toLocaleDateString()}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}