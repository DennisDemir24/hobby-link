import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, MessageSquare, Tag } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPostById } from "@/lib/actions/post.action";
import { CommentForm } from "@/components/post/CommentForm";
import { CommentList } from "@/components/post/CommentList";
import { LikeButton } from "@/components/post/LikeButton";
import { PostActions } from "@/components/post/PostActions";

interface PostPageProps {
  params: {
    id: string;
    postId: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await auth();
  const userId = session?.userId;
  const isAuthenticated = !!userId;

  const post = await getPostById(params.postId);

  if (!post) {
    notFound();
  }

  // Check if the user is a member of the community
  const isMember = isAuthenticated && post.community.members.some(member => member.userId === userId);
  
  // Check if the user is a community admin
  const isAdmin = isAuthenticated && post.community.members.some(member => 
    member.userId === userId && member.role === "ADMIN"
  );

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/community/${params.id}`} 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Link>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
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
            communityId={params.id}
            authorId={post.author.clerkUserId}
            currentUserId={userId}
            isAdmin={isAdmin}
          />
        </div>

        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        
        <div className="prose prose-indigo max-w-none mb-6">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t">
          <LikeButton 
            postId={post.id} 
            initialLikeCount={post._count.likes} 
            initialIsLiked={post.likes.some(like => like.userId === userId)}
            isAuthenticated={isAuthenticated}
          />
          <div className="flex items-center text-gray-500">
            <MessageSquare className="h-5 w-5 mr-1" />
            <span>{post._count.comments} comments</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-6">Comments</h2>
        
        {isAuthenticated ? (
          isMember ? (
            <CommentForm postId={post.id} />
          ) : (
            <div className="text-center p-4 bg-indigo-50 rounded-md mb-6">
              <p className="text-indigo-700 mb-2">You must be a member of this community to comment</p>
              <Link href={`/community/${post.communityId}`}>
                <Button variant="outline" className="border-indigo-200 text-indigo-700">
                  Join Community
                </Button>
              </Link>
            </div>
          )
        ) : (
          <div className="text-center p-4 bg-indigo-50 rounded-md mb-6">
            <p className="text-indigo-700 mb-2">Sign in to join the conversation</p>
            <Link href="/sign-in">
              <Button variant="outline" className="border-indigo-200 text-indigo-700">
                Sign In
              </Button>
            </Link>
          </div>
        )}
        
        <CommentList 
          comments={post.comments} 
          currentUserId={userId}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
} 