"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/lib/actions/post.action";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      return toast.error("Comment cannot be empty");
    }
    
    try {
      setIsSubmitting(true);
      await createComment(postId, comment);
      
      toast.success("Comment added");
      setComment("");
      router.refresh();
      
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <Textarea
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none min-h-24"
        />
      </div>
      <Button 
        type="submit" 
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
        disabled={isSubmitting || !comment.trim()}
      >
        {isSubmitting ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
} 