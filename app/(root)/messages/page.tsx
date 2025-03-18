import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getConversations } from "@/lib/actions/conversation.action";
import { ConversationList } from "@/components/message/ConversationList";
import { Conversation } from "@/components/message/types";

export default async function MessagesPage() {
  const session = await auth();
  const userId = session?.userId;
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Get all conversations for the current user
  const conversations = await getConversations();
  
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-gray-500">Chat with other users and communities</p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ConversationList 
          initialConversations={conversations as unknown as Conversation[]} 
          currentUserId={userId}
        />
      </div>
    </div>
  );
}