"use client";

import { useEffect } from "react";
import { markMessagesAsReadAction } from "@/lib/actions/conversation.action";

interface MarkMessagesAsReadProps {
  conversationId: string;
}

export function MarkMessagesAsRead({ conversationId }: MarkMessagesAsReadProps) {
  useEffect(() => {
    // Mark messages as read when the component mounts
    const markAsRead = async () => {
      try {
        await markMessagesAsReadAction(conversationId);
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    };

    markAsRead();
  }, [conversationId]);

  // This component doesn't render anything
  return null;
} 