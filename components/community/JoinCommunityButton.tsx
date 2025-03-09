"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { joinCommunity } from "@/lib/actions/community.action";

interface JoinCommunityButtonProps {
  communityId: string;
  isMember: boolean;
}

export function JoinCommunityButton({ communityId, isMember }: JoinCommunityButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    try {
      setIsLoading(true);
      await joinCommunity(communityId);
      toast.success("You have joined the community.");
      router.refresh();
    } catch (error) {
      console.error("Error joining community:", error);
      toast.error(error instanceof Error ? error.message : "Failed to join community");
    } finally {
      setIsLoading(false);
    }
  };

  if (isMember) {
    return (
      <Button 
        variant="outline" 
        disabled 
        className="border-indigo-200 bg-indigo-50 text-indigo-700"
      >
        <Users className="mr-2 h-4 w-4" />
        Already a Member
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleJoin} 
      disabled={isLoading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      <Users className="mr-2 h-4 w-4" />
      {isLoading ? "Joining..." : "Join Community"}
    </Button>
  );
} 