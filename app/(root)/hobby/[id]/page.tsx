import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Users, BookOpen, CircleDot, TrendingUp, Plus } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCommunitiesByHobby } from "@/lib/actions/community.action";
import { CreateCommunityModal } from "@/components/modals/CreateCommunityModal";
import { Button } from "@/components/ui/button";

interface HobbyDetailPageProps {
  params: {
    id: string;
  };
}

// Extended hobby type to include optional properties that might be added in the future
interface ExtendedHobby {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  // Optional properties that might be added in the future
  difficulty?: string;
  timeCommitment?: string;
  costRange?: string;
  location?: string;
  emoji?: string;
}

export default async function HobbyDetailPage({ params }: HobbyDetailPageProps) {
  const session = await auth();
  const userId = session?.userId;
  const isAuthenticated = !!userId;

  // No longer redirecting unauthenticated users
  // if (!userId) {
  //   redirect("/sign-in");
  // }

  // Extract and validate the ID parameter
  const hobbyId = params.id;

  // Fetch the hobby details
  const hobby = await db.hobby.findUnique({
    where: {
      id: hobbyId,
    },
  }) as unknown as ExtendedHobby;

  if (!hobby) {
    notFound();
  }

  // Fetch communities related to this hobby
  const communities = await getCommunitiesByHobby(hobbyId);

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image section */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[16/9] border border-gray-100 shadow-sm">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90 text-indigo-600 font-medium shadow-sm border border-indigo-100 backdrop-blur-sm">
                <TrendingUp className="h-3 w-3 mr-1 text-indigo-600" />
                Trending Hobby
              </Badge>
            </div>
            <div className="w-full h-full flex items-center justify-center">
              {hobby.emoji ? (
                <div className="text-8xl">
                  {hobby.emoji}
                </div>
              ) : (
                <div className="text-6xl">
                  {/* Placeholder emoji based on hobby name */}
                  {hobby.name.toLowerCase().includes("paint") ? "🎨" : 
                   hobby.name.toLowerCase().includes("garden") ? "🌱" : 
                   hobby.name.toLowerCase().includes("cook") ? "🍳" : "🔍"}
                </div>
              )}
            </div>
          </div>

          {/* Hobby title and metadata */}
          <div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900">{hobby.name}</h1>
            
            <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
              <div className="flex items-center gap-1">
                <CircleDot className="h-4 w-4 text-indigo-600" />
                <span>Beginner</span>
              </div>
              {hobby.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <span>{hobby.location}</span>
                </div>
              )}
              {hobby.timeCommitment && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>{hobby.timeCommitment}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-indigo-600" />
                <span>{communities.length > 0 ? `${communities.length} communities` : 'No communities yet'}</span>
              </div>
            </div>
            
            <p className="text-gray-700 text-lg mb-6">{hobby.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {hobby.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Communities section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Communities</h2>
              {isAuthenticated ? (
                <CreateCommunityModal hobbyId={hobby.id}>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Community
                  </Button>
                </CreateCommunityModal>
              ) : (
                <Link href="/sign-in">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Users className="h-4 w-4 mr-1" />
                    Sign in to create
                  </Button>
                </Link>
              )}
            </div>
            
            {communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.map((community) => (
                  <Link 
                    href={`/community/${community.id}`} 
                    key={community.id} 
                    className="block h-full"
                  >
                    <Card className="h-full hover:shadow-md transition-shadow border border-gray-100 hover:border-indigo-100">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="line-clamp-1 text-lg">{community.name}</CardTitle>
                          {community.members.some(member => member.userId === userId) && (
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 ml-2">Member</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 line-clamp-2 text-sm mb-3">
                          {community.description || "No description provided."}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users size={14} className="text-indigo-600" />
                            <span>{community.members.length} {community.members.length === 1 ? "member" : "members"}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-gray-50">
                            {new Date(community.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border border-dashed bg-gray-50/50 text-center py-8">
                <CardContent>
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No communities yet</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    Be the first to create a community for this hobby!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar - 1/3 width on desktop */}
        <div className="space-y-6">
          {/* Next Meetup Card */}
          {/* <Card className="border border-gray-100 shadow-sm hover:border-indigo-100 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Next Meetup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Saturday, March 15th at 2 PM</p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Join Meetup
              </Button>
            </CardContent>
          </Card> */}

          {/* What you'll need Card */}
          <Card className="border border-gray-100 shadow-sm hover:border-indigo-100 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900">What you&apos;ll need</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {hobby.name.toLowerCase().includes("paint") ? (
                  <>
                    <li className="flex items-start gap-2">
                      <CircleDot className="h-4 w-4 mt-1 text-indigo-600" />
                      <span>Basic watercolor paint set</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="h-4 w-4 mt-1 text-indigo-600" />
                      <span>Watercolor paper pad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="h-4 w-4 mt-1 text-indigo-600" />
                      <span>Assorted brushes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="h-4 w-4 mt-1 text-indigo-600" />
                      <span>Water container</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="h-4 w-4 mt-1 text-indigo-600" />
                      <span>Paper towels</span>
                    </li>
                  </>
                ) : (
                  <li className="text-gray-600">
                    Information coming soon
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Learning Resources Card */}
          <Card className="border border-gray-100 shadow-sm hover:border-indigo-100 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Learning Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="hover:bg-indigo-50 p-2 rounded-md transition-colors">
                  <Link href="#" className="block text-gray-800 hover:text-indigo-700">
                    Beginner&apos;s Guide to {hobby.name}
                  </Link>
                </li>
                <li className="hover:bg-indigo-50 p-2 rounded-md transition-colors">
                  <Link href="#" className="block text-gray-800 hover:text-indigo-700">
                    Essential Techniques Workshop
                  </Link>
                </li>
                <li className="hover:bg-indigo-50 p-2 rounded-md transition-colors">
                  <Link href="#" className="block text-gray-800 hover:text-indigo-700">
                    {hobby.name} Basics
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 