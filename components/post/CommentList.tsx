"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentActions } from "@/components/post/CommentActions";
import { EditCommentForm } from "@/components/post/EditCommentForm";

interface CommentListProps {
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: {
      name: string | null;
      imageUrl: string | null;
      clerkUserId: string;
    };
  }>;
  currentUserId?: string | null;
  isAdmin?: boolean;
}

export function CommentList({ 
  comments, 
  currentUserId,
  isAdmin = false
}: CommentListProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => {
        const isEditing = editingCommentId === comment.id;
        
        if (isEditing) {
          return (
            <EditCommentForm
              key={comment.id}
              commentId={comment.id}
              initialContent={comment.content}
              onCancel={() => setEditingCommentId(null)}
            />
          );
        }
        
        return (
          <div key={comment.id} className="flex gap-4 border-b pb-5">
            <Avatar className="h-8 w-8 border border-indigo-100">
              <AvatarImage src={comment.author.imageUrl || ""} alt={comment.author.name || "User"} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {comment.author.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">{comment.author.name}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                  <CommentActions
                    commentId={comment.id}
                    authorId={comment.author.clerkUserId}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onEdit={() => setEditingCommentId(comment.id)}
                  />
                </div>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 