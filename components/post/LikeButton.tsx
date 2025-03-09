"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { likePost } from "@/lib/actions/post.action";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isAuthenticated: boolean;
}

export function LikeButton({ 
  postId, 
  initialLikeCount, 
  initialIsLiked, 
  isAuthenticated 
}: LikeButtonProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const router = useRouter();

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsLiking(true);
      await likePost(postId);
      
      // Toggle like state and update count
      if (isLiked) {
        setLikeCount(prev => prev - 1);
      } else {
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
      
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`${
        isLiked ? "text-rose-600" : "text-gray-500"
      } hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5`}
      onClick={handleLikeClick}
      disabled={isLiking}
    >
      <Heart className="h-5 w-5 mr-1" fill={isLiked ? "currentColor" : "none"} />
      <span>{likeCount}</span>
    </Button>
  );
} 