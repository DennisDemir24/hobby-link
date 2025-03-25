"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle, Search, MessageSquare, Users, Inbox, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Conversation } from "./types";
import { getInitials, cn } from "@/lib/utils";

interface ConversationListProps {
  initialConversations: Conversation[];
  currentUserId: string;
}

type ConversationType = 'all' | 'direct' | 'group';

export function ConversationList({ initialConversations, currentUserId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ConversationType>('all');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Set up SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource('/api/messages/sse');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message' || data.type === 'conversation') {
        setConversations(prev => {
          const updatedConversations = [...prev];
          const conversationIndex = updatedConversations.findIndex(
            c => c.id === data.data.message.conversationId
          );
          
          if (conversationIndex !== -1) {
            const updatedConversation = {
              ...updatedConversations[conversationIndex],
              messages: [data.data.message, ...updatedConversations[conversationIndex].messages]
            };
            
            updatedConversation.participants = updatedConversation.participants.map(p => ({
              ...p,
              hasSeenLatest: p.userId === data.data.message.senderId
            }));
            
            updatedConversations[conversationIndex] = updatedConversation;
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
  
  // Filter conversations based on search query and type
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = searchQuery === "" || (
      (conversation.name && conversation.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      conversation.participants.some(p => 
        p.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      conversation.messages.some(m => 
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    const matchesType = selectedType === 'all' || 
      (selectedType === 'direct' && !conversation.isGroup) ||
      (selectedType === 'group' && conversation.isGroup);

    return matchesSearch && matchesType;
  });

  // Helper functions
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.userId !== currentUserId)?.user;
  };
  
  const getConversationName = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.name || "Group Chat";
    }
    const otherParticipant = getOtherParticipant(conversation);
    return otherParticipant?.name || "Unknown User";
  };
  
  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return null;
    }
    const otherParticipant = getOtherParticipant(conversation);
    return otherParticipant?.imageUrl || null;
  };
  
  const getLastMessagePreview = (conversation: Conversation) => {
    if (conversation.messages.length === 0) {
      return "No messages yet";
    }
    const lastMessage = conversation.messages[0];
    const isOwnMessage = lastMessage.senderId === currentUserId;
    const prefix = isOwnMessage ? "You: " : "";
    return `${prefix}${lastMessage.content}`;
  };
  
  const hasUnreadMessages = (conversation: Conversation) => {
    const currentUserParticipant = conversation.participants.find(p => p.userId === currentUserId);
    return currentUserParticipant ? !currentUserParticipant.hasSeenLatest : false;
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <div className="p-4 space-y-4">
        <Link href="/messages/new">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </Link>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as ConversationType)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              <Inbox className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Direct
            </TabsTrigger>
            <TabsTrigger value="group" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No conversations found</p>
              <p className="text-sm">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Start a new conversation to begin chatting"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const isActive = searchParams.get('conversationId') === conversation.id;
              const unread = hasUnreadMessages(conversation);
              const lastMessage = conversation.messages[0];
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('conversationId', conversation.id);
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
                    isActive ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-100',
                    unread && 'bg-indigo-50/50'
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getConversationAvatar(conversation) || ""} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {getInitials(getConversationName(conversation))}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.isGroup && (
                      <div className="absolute -bottom-1 -right-1 bg-indigo-100 rounded-full p-0.5">
                        <Users className="h-3 w-3 text-indigo-600" />
                      </div>
                    )}
                    {unread && (
                      <Circle className="absolute -top-1 -right-1 h-3 w-3 fill-indigo-600 text-indigo-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {getConversationName(conversation)}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {getLastMessagePreview(conversation)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 