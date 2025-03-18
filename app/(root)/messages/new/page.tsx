import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { NewConversationForm } from "@/components/message/NewConversationForm";

export default async function NewConversationPage() {
  const session = await auth();
  const userId = session?.userId;
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Get all users
  const users = await db.user.findMany({
    where: {
      clerkUserId: {
        not: userId
      }
    },
    select: {
      id: true,
      clerkUserId: true,
      name: true,
      imageUrl: true
    }
  });
  
  // Get all communities the user is a member of
  const userCommunities = await db.community.findMany({
    where: {
      members: {
        some: {
          userId: userId
        }
      }
    },
    select: {
      id: true,
      name: true
    }
  });
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/messages" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Link>
      </div>
      
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">New Conversation</h1>
        
        <NewConversationForm 
          users={users} 
          communities={userCommunities}
          currentUserId={userId}
        />
      </div>
    </div>
  );
} 