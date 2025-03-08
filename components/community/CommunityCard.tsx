import Link from "next/link";
import { Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    members?: { userId: string }[];
  };
  memberCount: number;
  currentUserId?: string;
}

export function CommunityCard({ community, memberCount, currentUserId }: CommunityCardProps) {
  // Check if the current user is a member
  const isMember = currentUserId && community.members 
    ? community.members.some(member => member.userId === currentUserId) 
    : false;

  return (
    <Link href={`/community/${community.id}`}>
      <Card className="h-full hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-indigo-100">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="line-clamp-1 text-lg group-hover:text-indigo-600 transition-colors">
              {community.name}
            </CardTitle>
            {isMember && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 ml-2">
                Member
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 line-clamp-3 text-sm mb-4">
            {community.description || "No description provided."}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Users size={14} className="text-indigo-600" />
              <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
            </div>
            <Badge variant="outline" className="text-xs bg-gray-50">
              {new Date(community.createdAt).toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}