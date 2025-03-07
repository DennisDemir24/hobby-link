'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Users, Clock, TrendingUp, Bookmark, Share2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Define types for our data
interface Resource {
  title: string;
  url: string;
}

interface Hobby {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  trendingFactor: string;
  trendingPercentage: string;
  tags: string[];
  longDescription: string;
  difficulty: string;
  timeCommitment: string;
  costRange: string;
  communities: number;
  resources: Resource[];
  relatedHobbies: number[];
}

// This would typically come from an API or database
// Using the same mock data structure as in the discover page
const trendingHobbies: Hobby[] = [
  {
    id: 1,
    title: 'Urban Gardening',
    description: 'Transform your urban space into a green oasis with container gardening, vertical gardens, and more.',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Outdoors',
    trendingFactor: 'High demand',
    trendingPercentage: '+32%',
    tags: ['sustainable', 'plants', 'urban'],
    longDescription: 'Urban gardening is the practice of cultivating, processing, and distributing food in or around urban areas. Urban gardening is also the practice of cultivating, processing, and distributing food in or around a village, or town. These areas often lack access to healthy, affordable food. Urban agriculture can reflect varying levels of economic and social development.',
    difficulty: 'Beginner',
    timeCommitment: '2-3 hours per week',
    costRange: '$50-200 to start',
    communities: 12500,
    resources: [
      { title: 'Getting Started with Container Gardening', url: '#' },
      { title: 'Best Plants for Urban Spaces', url: '#' },
      { title: 'Vertical Garden DIY Guide', url: '#' }
    ],
    relatedHobbies: [2, 5]
  },
  {
    id: 2,
    title: 'Drone Photography',
    description: 'Capture stunning aerial perspectives with the latest drone technology and photography techniques.',
    image: 'https://images.unsplash.com/photo-1506947411487-a56738267384?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Technology',
    trendingFactor: 'Growing fast',
    trendingPercentage: '+45%',
    tags: ['photography', 'tech', 'aerial'],
    longDescription: 'Drone photography is the capture of still images and video by a remotely-operated or autonomous unmanned aerial vehicle (UAV), also known as an unmanned aircraft system (UAS) or, more commonly, as a drone. Drone photography allows for images and audio/video to be captured that might not be otherwise possible for human photographers and videographers.',
    difficulty: 'Intermediate',
    timeCommitment: '5-10 hours per week',
    costRange: '$500-2000 to start',
    communities: 8700,
    resources: [
      { title: 'Drone Photography Basics', url: '#' },
      { title: 'Best Drones for Beginners', url: '#' },
      { title: 'Advanced Aerial Composition', url: '#' }
    ],
    relatedHobbies: [3, 6]
  },
  {
    id: 3,
    title: 'Pottery',
    description: 'Learn the art of creating beautiful ceramic pieces with your hands and a pottery wheel.',
    image: 'https://images.unsplash.com/photo-1565122256212-41788ba908b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Crafts',
    trendingFactor: 'Steady growth',
    trendingPercentage: '+18%',
    tags: ['handmade', 'ceramics', 'art'],
    longDescription: 'Pottery is the process and the products of forming vessels and other objects with clay and other ceramic materials, which are fired at high temperatures to give them a hard, durable form. Major types include earthenware, stoneware and porcelain. The place where such wares are made by a potter is also called a pottery.',
    difficulty: 'Beginner to Intermediate',
    timeCommitment: '3-6 hours per week',
    costRange: '$200-500 to start',
    communities: 15300,
    resources: [
      { title: 'Pottery for Beginners', url: '#' },
      { title: 'Hand-Building Techniques', url: '#' },
      { title: 'Wheel Throwing Basics', url: '#' }
    ],
    relatedHobbies: [5, 6]
  },
  {
    id: 4,
    title: 'Bouldering',
    description: 'Challenge yourself with this form of rock climbing performed without the use of ropes or harnesses.',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    trendingFactor: 'Very popular',
    trendingPercentage: '+62%',
    tags: ['climbing', 'fitness', 'outdoor'],
    longDescription: 'Bouldering is a form of free climbing that is performed on small rock formations or artificial rock walls without the use of ropes or harnesses. While bouldering can be done without any equipment, most climbers use climbing shoes to help secure footholds, chalk to keep their hands dry and to provide a firmer grip, and bouldering mats to prevent injuries from falls.',
    difficulty: 'Intermediate',
    timeCommitment: '4-8 hours per week',
    costRange: '$150-300 to start',
    communities: 9800,
    resources: [
      { title: 'Bouldering Basics for Beginners', url: '#' },
      { title: 'Training for Bouldering', url: '#' },
      { title: 'Finding Bouldering Gyms Near You', url: '#' }
    ],
    relatedHobbies: [1, 5]
  },
  {
    id: 5,
    title: 'Fermentation',
    description: 'Discover the science and art of fermentation to create your own kombucha, kimchi, and more.',
    image: 'https://images.unsplash.com/photo-1590592029783-bbc950d20e63?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Culinary',
    trendingFactor: 'Rising trend',
    trendingPercentage: '+27%',
    tags: ['food', 'health', 'diy'],
    longDescription: 'Fermentation in food processing is the process of converting carbohydrates to alcohol or organic acids using microorganisms—yeasts or bacteria—under anaerobic conditions. Fermentation usually implies that the action of microorganisms is desired. The science of fermentation is known as zymology or zymurgy.',
    difficulty: 'Beginner',
    timeCommitment: '2-4 hours per week',
    costRange: '$50-150 to start',
    communities: 7200,
    resources: [
      { title: 'Fermentation 101', url: '#' },
      { title: 'Making Your First Kombucha', url: '#' },
      { title: 'Kimchi and Other Fermented Vegetables', url: '#' }
    ],
    relatedHobbies: [1, 3]
  },
  {
    id: 6,
    title: 'Digital Illustration',
    description: 'Create stunning digital artwork using the latest software and techniques.',
    image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Art',
    trendingFactor: 'High demand',
    trendingPercentage: '+38%',
    tags: ['digital', 'art', 'design'],
    longDescription: 'Digital illustration is the use of digital tools to produce images under the direct manipulation of the artist, usually through a pointing device such as a tablet or a mouse. It is distinguished from computer-generated art, which is produced by a computer using mathematical models created by the artist.',
    difficulty: 'Beginner to Advanced',
    timeCommitment: '5-15 hours per week',
    costRange: '$100-1000 to start',
    communities: 18500,
    resources: [
      { title: 'Digital Illustration for Beginners', url: '#' },
      { title: 'Best Software for Digital Art', url: '#' },
      { title: 'Advanced Digital Painting Techniques', url: '#' }
    ],
    relatedHobbies: [2, 3]
  }
];

export default function HobbyDetailPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hobby, setHobby] = useState<Hobby | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  console.log(params.id);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Parse the ID as a number
      const hobbyId = parseInt(params.id);
      
      // Find the hobby with the matching ID
      const foundHobby = trendingHobbies.find(h => h.id === hobbyId);
      
      setHobby(foundHobby || null);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [params.id]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // If hobby not found after loading, return 404
  if (!hobby) {
    notFound();
    return null;
  }
  
  const relatedHobbies = hobby.relatedHobbies
    ? trendingHobbies.filter(h => hobby.relatedHobbies.includes(h.id))
    : [];
  
  return (
    <div>
      <div className="mb-6">
        <Link href="/discover" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Discover
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden mb-6">
            <Image
              src={hobby.image}
              alt={hobby.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <Badge className="mb-3 bg-white/90 text-indigo-700 backdrop-blur-sm">
                {hobby.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{hobby.title}</h1>
              <div className="flex items-center text-white/90">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Trending {hobby.trendingPercentage} this month</span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="communities">Communities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-3">About this hobby</h2>
                <p className="text-gray-700 leading-relaxed">{hobby.longDescription}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Difficulty Level</h3>
                    <p className="text-gray-600">{hobby.difficulty}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Time Commitment</h3>
                    <p className="text-gray-600">{hobby.timeCommitment}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-2">Cost to Start</h3>
                    <p className="text-gray-600">{hobby.costRange}</p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {hobby.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources">
              <h2 className="text-2xl font-semibold mb-4">Learning Resources</h2>
              <div className="space-y-4">
                {hobby.resources.map((resource: Resource, index: number) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-2">{resource.title}</h3>
                      <Link href={resource.url} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        View Resource
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="communities">
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Join {hobby.communities.toLocaleString()}+ enthusiasts</h2>
                <p className="text-gray-600 mb-6">Connect with others who share your interest in {hobby.title}</p>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Find Communities
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {relatedHobbies.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Related Hobbies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedHobbies.map((relatedHobby: Hobby) => (
                  <Link href={`/hobby/${relatedHobby.id}`} key={relatedHobby.id} className="block">
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-32 w-full">
                        <Image
                          src={relatedHobby.image}
                          alt={relatedHobby.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold mb-1">{relatedHobby.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{relatedHobby.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Get Started</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Time Commitment</p>
                      <p className="text-gray-600 text-sm">{hobby.timeCommitment}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Community Size</p>
                      <p className="text-gray-600 text-sm">{hobby.communities.toLocaleString()}+ enthusiasts</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Trending Factor</p>
                      <p className="text-gray-600 text-sm">{hobby.trendingFactor} ({hobby.trendingPercentage})</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    Join the Community
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className={`flex items-center justify-center gap-2 ${isSaved ? 'text-indigo-600 border-indigo-200' : ''}`}
                      onClick={() => setIsSaved(!isSaved)}
                    >
                      <Bookmark className="h-4 w-4" />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`flex items-center justify-center gap-2 ${isLiked ? 'text-pink-600 border-pink-200' : ''}`}
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className="h-4 w-4" />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                  </div>
                  <Button variant="ghost" className="w-full flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 h-6 w-6 text-sm mr-3 mt-0.5">1</span>
                    <span>Start with basic equipment and upgrade as you progress</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 h-6 w-6 text-sm mr-3 mt-0.5">2</span>
                    <span>Join online communities to learn from others</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 h-6 w-6 text-sm mr-3 mt-0.5">3</span>
                    <span>Set aside regular time each week to practice</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 h-6 w-6 text-sm mr-3 mt-0.5">4</span>
                    <span>Document your progress to stay motivated</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
