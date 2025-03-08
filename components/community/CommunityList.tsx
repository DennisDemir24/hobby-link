import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CommunityCard } from "@/components/community/CommunityCard";
import { CreateCommunityModal } from "@/components/modals/CreateCommunityModal";

interface Community {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  members: { userId: string }[];
}

interface CommunityListProps {
  communities: Community[];
  hobbyId: string;
  currentUserId?: string;
}

export function CommunityList({ communities, hobbyId, currentUserId }: CommunityListProps) {
  return (
    <div className="space-y-4">
      {communities.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community) => (
              <CommunityCard 
                key={community.id} 
                community={community} 
                memberCount={community.members.length}
                currentUserId={currentUserId}
              />
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <CreateCommunityModal hobbyId={hobbyId}>
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Create New Community
              </Button>
            </CreateCommunityModal>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">No communities yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to create a community for this hobby!
          </p>
          <CreateCommunityModal hobbyId={hobbyId}>
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Create Community
            </Button>
          </CreateCommunityModal>
        </div>
      )}
    </div>
  );
} 