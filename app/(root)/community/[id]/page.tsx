import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { JoinCommunityButton } from "@/components/community/JoinCommunityButton";
import { ArrowLeft, Users, Calendar, MessageSquare, Info, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommunityPageProps {
  params: {
    id: string;
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
    const session = await auth();
    const userId = session?.userId;
    const isAuthenticated = !!userId;

  // No longer redirecting unauthenticated users
  // if (!userId) {
  //   redirect("/sign-in");
  // }

  const community = await db.community.findUnique({
    where: {
      id: params.id,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      hobby: true,
    },
  });

  if (!community) {
    notFound();
  }

  // Check if the current user is a member (only if authenticated)
  const isMember = isAuthenticated ? community.members.some(member => member.userId === userId) : false;

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/discover" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discover
        </Link>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8 mb-8 border border-indigo-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                {community.members.length} {community.members.length === 1 ? "member" : "members"}
              </Badge>
            </div>
            <p className="text-gray-700 max-w-2xl">{community.description}</p>
          </div>
          
          {/* Show join button or sign-in prompt based on authentication status */}
          <div className="mt-2 md:mt-0">
            {isAuthenticated ? (
              !isMember && <JoinCommunityButton communityId={community.id} isMember={isMember} />
            ) : (
              <Link href="/sign-in">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Sign in to join
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Community content will go here */}
          <Card className="border border-gray-100 shadow-sm hover:border-indigo-100 transition-all duration-300">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                Community Discussions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  Be the first to start a conversation in this community!
                </p>
                {isAuthenticated ? (
                  isMember && (
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                      Start a Discussion
                    </button>
                  )
                ) : (
                  <Link href="/sign-in">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                      Sign in to participate
                    </button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm hover:border-indigo-100 transition-all duration-300 mt-6">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  Stay tuned for future events in this community!
                </p>
                {isAuthenticated ? (
                  isMember && (
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                      Propose an Event
                    </button>
                  )
                ) : (
                  <Link href="/sign-in">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                      Sign in to propose events
                    </button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm hover:border-indigo-100 transition-all duration-300">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Users className="h-5 w-5 text-indigo-600" />
                Members ({community.members.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-3">
                {community.members.map((member) => (
                  <li key={member.userId} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                    <Avatar className="h-8 w-8 border border-indigo-100">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {member.user.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium text-gray-900">{member.user.name}</span>
                      {member.role === "ADMIN" && (
                        <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 shadow-sm hover:border-indigo-100 transition-all duration-300">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Tag className="h-5 w-5 text-indigo-600" />
                Related Hobby
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Link 
                href={`/hobby/${community.hobby.id}`} 
                className="block p-3 rounded-md hover:bg-indigo-50 transition-colors"
              >
                <div className="font-medium text-indigo-600 hover:text-indigo-800 mb-1">
                  {community.hobby.name}
                </div>
                {community.hobby.description && (
                  <p className="text-sm text-gray-600">
                    {community.hobby.description}
                  </p>
                )}
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm hover:border-indigo-100 transition-all duration-300">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Info className="h-5 w-5 text-indigo-600" />
                Community Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{new Date(community.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Members</span>
                  <span className="font-medium">{community.members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin</span>
                  <span className="font-medium">
                    {community.members.find(member => member.role === "ADMIN")?.user.name || "Unknown"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}