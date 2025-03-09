"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { editComment } from "@/lib/actions/post.action";

interface EditCommentFormProps {
  commentId: string;
  initialContent: string;
  onCancel: () => void;
}

export function EditCommentForm({ 
  commentId, 
  initialContent,
  onCancel 
}: EditCommentFormProps) {
  const [comment, setComment] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      return toast.error("Comment cannot be empty");
    }
    
    try {
      setIsSubmitting(true);
      await editComment(commentId, comment);
      
      toast.success("Comment updated");
      router.refresh();
      onCancel(); // Close the edit form
      
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-3">
        <Textarea
          placeholder="Edit your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none min-h-20"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          size="sm"
          disabled={isSubmitting || !comment.trim()}
        >
          {isSubmitting ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  );
} 