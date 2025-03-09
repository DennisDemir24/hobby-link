"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Tag } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { likePost } from "@/lib/actions/post.action";
import { PostActions } from "@/components/post/PostActions";
import { EditPostForm } from "@/components/post/EditPostForm";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    tags: string[];
    communityId: string;
    author: {
      name: string | null;
      imageUrl: string | null;
      clerkUserId: string;
    };
    likes: {
      userId: string;
    }[];
    _count: {
      comments: number;
      likes: number;
    };
  };
  currentUserId?: string | null;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(
    post.likes.some((like) => like.userId === currentUserId)
  );
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleLikeClick = async () => {
    if (!currentUserId) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsLiking(true);
      await likePost(post.id);
      
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

  // Check if the user is an admin of the community
  const isAdmin = false; // This would need to be determined based on community membership data
  
  if (isEditing) {
    return (
      <EditPostForm 
        postId={post.id}
        defaultValues={{
          title: post.title,
          content: post.content,
          tags: post.tags
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  // Truncate content if it's too long
  const truncatedContent = post.content.length > 200
    ? `${post.content.substring(0, 200)}...`
    : post.content;

  return (
    <Card className="overflow-hidden hover:border-indigo-200 transition-all">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border border-indigo-100">
            <AvatarImage src={post.author.imageUrl || ""} alt={post.author.name || "User"} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700">
              {post.author.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{post.author.name}</div>
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
        
        <PostActions 
          postId={post.id}
          communityId={post.communityId}
          authorId={post.author.clerkUserId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onEdit={() => setIsEditing(true)}
        />
      </CardHeader>
      <CardContent className="pb-3">
        <Link href={`/community/${post.communityId}/post/${post.id}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-indigo-600 transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-700 mb-3">{truncatedContent}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 border-t flex justify-between">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={`${
              isLiked ? "text-rose-600" : "text-gray-500"
            } hover:text-rose-600 hover:bg-rose-50`}
            onClick={handleLikeClick}
            disabled={isLiking}
          >
            <Heart className="h-4 w-4 mr-1" fill={isLiked ? "currentColor" : "none"} />
            {likeCount}
          </Button>
          <Link href={`/community/${post.communityId}/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50">
              <MessageSquare className="h-4 w-4 mr-1" />
              {post._count.comments}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 