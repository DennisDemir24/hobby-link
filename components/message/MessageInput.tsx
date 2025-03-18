"use client";

import { useState, FormEvent } from "react";
import { Send, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/lib/actions/conversation.action";

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await sendMessage({
        conversationId,
        content: content.trim(),
      });
      setContent("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle Enter key to submit the form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="resize-none min-h-[60px] pr-10"
            disabled={isSubmitting}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2 h-6 w-6 text-gray-500 hover:text-indigo-600"
            disabled={isSubmitting}
          >
            <Image className="h-4 w-4" />
            <span className="sr-only">Add image</span>
          </Button>
        </div>
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700"
          disabled={!content.trim() || isSubmitting}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
} 