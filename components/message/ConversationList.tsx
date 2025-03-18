"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "./types";
import { getInitials } from "@/lib/utils";

interface ConversationListProps {
  initialConversations: Conversation[];
  currentUserId: string;
}

export function ConversationList({ initialConversations, currentUserId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const pathname = usePathname();
  
  // Set up SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource('/api/messages/sse');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message' || data.type === 'conversation') {
        // Refresh conversations
        // In a real app, you'd update the specific conversation instead of refetching all
        // For simplicity, we're just setting a flag to refresh
        setConversations(prev => {
          // Find the conversation that was updated
          const updatedConversations = [...prev];
          const conversationIndex = updatedConversations.findIndex(
            c => c.id === data.data.message.conversationId
          );
          
          if (conversationIndex !== -1) {
            // Update the conversation with the new message
            const updatedConversation = {
              ...updatedConversations[conversationIndex],
              messages: [
                data.data.message,
                ...updatedConversations[conversationIndex].messages
              ]
            };
            
            // Update hasSeenLatest for all participants except the sender
            updatedConversation.participants = updatedConversation.participants.map(p => ({
              ...p,
              hasSeenLatest: p.userId === data.data.message.senderId
            }));
            
            updatedConversations[conversationIndex] = updatedConversation;
            
            // Move this conversation to the top
            const [conversation] = updatedConversations.splice(conversationIndex, 1);
            updatedConversations.unshift(conversation);
          }
          
          return updatedConversations;
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
  }, []);
  
  // Helper function to get the other participant in a direct message
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.userId !== currentUserId)?.user;
  };
  
  // Helper function to get the conversation name
  const getConversationName = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.name || "Group Chat";
    }
    
    const otherParticipant = getOtherParticipant(conversation);
    return otherParticipant?.name || "Unknown User";
  };
  
  // Helper function to get the conversation avatar
  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return null; // Group chats don't have avatars
    }
    
    const otherParticipant = getOtherParticipant(conversation);
    return otherParticipant?.imageUrl || null;
  };
  
  // Helper function to get the last message preview
  const getLastMessagePreview = (conversation: Conversation) => {
    if (conversation.messages.length === 0) {
      return "No messages yet";
    }
    
    const lastMessage = conversation.messages[0];
    const isOwnMessage = lastMessage.senderId === currentUserId;
    const prefix = isOwnMessage ? "You: " : "";
    
    return `${prefix}${lastMessage.content}`;
  };
  
  // Helper function to check if the conversation has unread messages
  const hasUnreadMessages = (conversation: Conversation) => {
    const currentUserParticipant = conversation.participants.find(p => p.userId === currentUserId);
    return currentUserParticipant ? !currentUserParticipant.hasSeenLatest : false;
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Link href="/messages/new">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </Link>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm">Start a new conversation to chat with others</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const isActive = pathname === `/messages/${conversation.id}`;
              const unread = hasUnreadMessages(conversation);
              
              return (
                <Link 
                  key={conversation.id} 
                  href={`/messages/${conversation.id}`}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg transition-colors
                    ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-100'}
                    ${unread ? 'font-medium' : ''}
                  `}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getConversationAvatar(conversation) || ""} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                      {getInitials(getConversationName(conversation))}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className={`truncate ${unread ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {getConversationName(conversation)}
                      </p>
                      {conversation.messages.length > 0 && (
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(conversation.messages[0].createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${unread ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {getLastMessagePreview(conversation)}
                    </p>
                  </div>
                  
                  {unread && (
                    <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2"></div>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 