import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getConversations, getConversationMessages } from "@/lib/actions/conversation.action";
import { ConversationList } from "@/components/message/ConversationList";
import { ConversationView } from "@/components/message/ConversationView";
import { Conversation } from "@/components/message/types";

interface MessagesPageProps {
  searchParams: { [key: string]: string | undefined };
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const session = await auth();
  const userId = session?.userId;
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Get all conversations for the current user
  const conversations = await getConversations();
  
  // Get the full conversation data if one is selected
  const selectedConversation = searchParams.conversationId
    ? await getConversationMessages(searchParams.conversationId)
    : undefined;
  
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Connect and chat with your network</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-[380px] lg:w-[420px] border-r flex flex-col bg-gray-50">
          <ConversationList 
            initialConversations={conversations as unknown as Conversation[]} 
            currentUserId={userId}
          />
        </div>
        
        {/* Conversation View */}
        <div className="hidden md:flex flex-1">
          <ConversationView conversation={selectedConversation as unknown as Conversation} />
        </div>
      </div>
    </div>
  );
}