import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

import { CreatePostForm } from "@/components/post/CreatePostForm";

interface CreatePostPageProps {
  params: {
    id: string;
  };
}

export default async function CreatePostPage({ params }: CreatePostPageProps) {
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if the community exists and if the user is a member
  const community = await db.community.findUnique({
    where: { id: params.id },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  if (!community) {
    redirect("/discover");
  }

  // If user is not a member, redirect to community page
  if (community.members.length === 0) {
    redirect(`/community/${params.id}`);
  }

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/community/${params.id}`} 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create a New Post</h1>
        <p className="text-gray-600">Share your thoughts with the {community.name} community</p>
      </div>

      <CreatePostForm communityId={params.id} />
    </div>
  );
} 