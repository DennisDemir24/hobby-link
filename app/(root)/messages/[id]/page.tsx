import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getConversationById } from "@/lib/actions/conversation.action";
import { MessageList } from "@/components/message/MessageList";
import { MessageInput } from "@/components/message/MessageInput";
import { getInitials } from "@/lib/utils";
import { Message } from "@/components/message/types";
import { MarkMessagesAsRead } from "@/components/message/MarkMessagesAsRead";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ConversationPage({ params }: PageProps) {
  // Await params to comply with Next.js 15 requirements
  const { id } = await Promise.resolve(params);
  
  const session = await auth();
  const userId = session?.userId;
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  try {
    // Get the conversation with messages
    const conversation = await getConversationById(id);
    
    // Helper function to get the other participant in a direct message
    const getOtherParticipant = () => {
      if (conversation.isGroup) return null;
      return conversation.participants.find(p => p.userId !== userId)?.user;
    };
    
    // Helper function to get the conversation name
    const getConversationName = () => {
      if (conversation.isGroup) {
        return conversation.name || "Group Chat";
      }
      
      const otherParticipant = getOtherParticipant();
      return otherParticipant?.name || "Unknown User";
    };
    
    // Helper function to get the conversation avatar
    const getConversationAvatar = () => {
      if (conversation.isGroup) {
        return null; // Group chats don't have avatars
      }
      
      const otherParticipant = getOtherParticipant();
      return otherParticipant?.imageUrl || null;
    };
    
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Client component to mark messages as read after page loads */}
        <MarkMessagesAsRead conversationId={id} />
        
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/messages" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to messages</span>
            </Link>
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={getConversationAvatar() || ""} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {getInitials(getConversationName())}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="font-semibold">{getConversationName()}</h2>
              {conversation.isGroup && (
                <p className="text-xs text-gray-500">
                  {conversation.participants.length} participants
                </p>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">Conversation options</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <MessageList 
            messages={conversation.messages as unknown as Message[]} 
            currentUserId={userId}
          />
        </div>
        
        <MessageInput conversationId={id} />
      </div>
    );
  } catch (error) {
    console.error("Error loading conversation:", error);
    notFound();
  }
} 