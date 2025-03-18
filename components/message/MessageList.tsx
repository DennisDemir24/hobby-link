"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./types";
import { getInitials } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages: initialMessages, currentUserId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Update messages when initialMessages changes (e.g., when navigating between conversations)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  
  // Set up SSE connection for real-time updates
  useEffect(() => {
    const conversationId = messages.length > 0 ? messages[0].conversationId : null;
    
    if (!conversationId) return;
    
    const eventSource = new EventSource(`/api/messages/sse?conversationId=${conversationId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        const newMessage = data.data.message;
        
        // Only add the message if it's not already in the list
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [messages.length > 0 ? messages[0].conversationId : null]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);
  
  // Get dates in chronological order
  const dates = Object.keys(groupedMessages).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  
  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-6">
        {dates.map((date) => (
          <div key={date} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-gray-500">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            
            {groupedMessages[date].map((message, i) => {
              const isCurrentUser = message.senderId === currentUserId;
              const showAvatar = i === 0 || groupedMessages[date][i - 1].senderId !== message.senderId;
              
              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  {!isCurrentUser && showAvatar && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender.imageUrl || ""} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {getInitials(message.sender.name || "User")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {!isCurrentUser && !showAvatar && <div className="w-8" />}
                  
                  <div className="flex flex-col gap-1 max-w-[75%]">
                    {showAvatar && !isCurrentUser && (
                      <span className="text-xs text-gray-500 ml-1">
                        {message.sender.name}
                      </span>
                    )}
                    
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        isCurrentUser
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {message.content}
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          alt="Attachment"
                          className="mt-2 rounded-md max-w-full"
                        />
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-500 self-end">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
} 