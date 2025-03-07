'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ArrowRight, Heart, Users, Clock, Sparkles } from 'lucide-react'
import Image from 'next/image'

// Sample hobby data - in a real app, this would come from an API or database
const hobbies = [
  {
    id: 1,
    title: 'Watercolor Painting',
    description: 'Express yourself through vibrant watercolors and create stunning artwork.',
    image: '/images/hobbies/watercolor.jpg',
    category: 'Art & Crafts',
    followers: '12.5K',
    timeCommitment: 'Medium',
    difficulty: 'Beginner-Friendly',
    tags: ['creative', 'relaxing', 'artistic']
  },
  {
    id: 2,
    title: 'Urban Photography',
    description: 'Capture the essence of city life through your lens and discover hidden beauty.',
    image: '/images/hobbies/photography.jpg',
    category: 'Photography',
    followers: '28.7K',
    timeCommitment: 'Flexible',
    difficulty: 'All Levels',
    tags: ['outdoor', 'creative', 'technical']
  },
  {
    id: 3,
    title: 'Indoor Gardening',
    description: 'Bring nature inside with beautiful houseplants and create your own urban jungle.',
    image: '/images/hobbies/gardening.jpg',
    category: 'Home & Garden',
    followers: '19.3K',
    timeCommitment: 'Low',
    difficulty: 'Beginner-Friendly',
    tags: ['relaxing', 'sustainable', 'home']
  },
  {
    id: 4,
    title: 'Sourdough Baking',
    description: 'Master the art of sourdough bread making and create delicious homemade loaves.',
    image: '/images/hobbies/baking.jpg',
    category: 'Cooking',
    followers: '32.1K',
    timeCommitment: 'Medium',
    difficulty: 'Intermediate',
    tags: ['food', 'creative', 'patience']
  },
  {
    id: 5,
    title: 'Strategic Board Gaming',
    description: 'Dive into the world of modern board games, from cooperative adventures to competitive strategy.',
    image: '/images/hobbies/boardgames.jpg',
    category: 'Games',
    followers: '45.2K',
    timeCommitment: 'Medium',
    difficulty: 'All Levels',
    tags: ['social', 'strategy', 'competitive']
  },
  {
    id: 6,
    title: 'Home Fitness & Calisthenics',
    description: 'Build strength and flexibility using bodyweight exercises you can do anywhere.',
    image: '/images/hobbies/fitness.jpg',
    category: 'Sports',
    followers: '67.8K',
    timeCommitment: 'High',
    difficulty: 'Progressive',
    tags: ['health', 'strength', 'discipline']
  }
]

// Categories for the filter
const categories = [
  'All',
  'Art & Crafts',
  'Photography',
  'Home & Garden',
  'Cooking',
  'Music',
  'Sports',
  'Games',
  'Technology'
]

const HobbySection = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [visibleHobbies, setVisibleHobbies] = useState(hobbies)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Filter hobbies based on selected category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setVisibleHobbies(hobbies)
    } else {
      setVisibleHobbies(hobbies.filter(hobby => hobby.category === selectedCategory))
    }
  }, [selectedCategory])

  useEffect(() => {
    // Check if we're on mobile for disabling certain effects
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current || isMobile) return
      
      const { clientX, clientY } = e
      const rect = sectionRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      const moveX = (x - centerX) / 30
      const moveY = (y - centerY) / 30
      
      setMousePosition({ x: moveX, y: moveY })
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', checkMobile)
    }
  }, [isMobile])
  
  // Helper function to calculate transform style based on device
  const getTransformStyle = (factor: number) => {
    if (isMobile) return {}
    
    return {
      transform: `translate(${mousePosition.x * factor}px, ${mousePosition.y * factor}px)`,
      transition: 'transform 0.1s ease-out'
    }
  }

  return (
    <div 
      ref={sectionRef}
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100 opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-100 opacity-20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-amber-100 opacity-10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTU5IDFIMXY1OGg1OFYxeiIgZmlsbD0iI0YxRjFGMSIvPjwvZz48L3N2Zz4=')]" style={{ opacity: 0.4 }} />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div 
            className="inline-block px-4 py-1.5 mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 text-sm font-medium text-indigo-600 border border-indigo-100"
            style={getTransformStyle(-0.5)}
          >
            🌱 Discover Hobbies
          </div>
          
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 sm:mb-6 leading-tight"
            style={getTransformStyle(-0.8)}
          >
            Find your <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">perfect hobby</span> and connect with others
          </h2>
          
          <p 
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
            style={getTransformStyle(-0.4)}
          >
            Explore a wide range of hobbies, discover new passions, and connect with like-minded enthusiasts from around the world.
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex space-x-2 min-w-max justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full px-4 py-2 ${
                  selectedCategory === category 
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                    : "text-gray-700 hover:text-indigo-700 hover:border-indigo-200"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Hobbies grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {visibleHobbies.map((hobby, index) => (
            <Card 
              key={hobby.id} 
              className="border border-gray-100 hover:border-indigo-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full"
              style={{
                ...getTransformStyle(index % 2 === 0 ? 0.2 : -0.2),
                transitionProperty: 'transform, box-shadow, border-color',
              }}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <Image 
                  src={hobby.image} 
                  alt={hobby.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <Badge className="absolute top-3 left-3 z-20 bg-white/80 text-indigo-700 backdrop-blur-sm hover:bg-white/90">
                  {hobby.category}
                </Badge>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white/90 text-rose-500 rounded-full h-8 w-8 p-1.5"
                >
                  <Heart className="h-full w-full" />
                </Button>
              </div>
              
              <CardHeader className="pb-0 pt-5">
                <CardTitle className="text-xl font-semibold group-hover:text-indigo-600 transition-colors">
                  {hobby.title}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {hobby.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-1 mb-4">
                  {hobby.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{hobby.followers}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{hobby.timeCommitment}</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    <span>{hobby.difficulty}</span>
                  </div>
                </div>
                
                <div className="h-[1px] w-full bg-gray-100 mb-4"></div>
                <Button variant="ghost" className="text-indigo-600 p-0 h-auto font-medium hover:bg-transparent hover:text-indigo-700 group/btn">
                  Explore
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* CTA section */}
        <div className="mt-20 text-center">
          <div 
            className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-indigo-100 shadow-xl relative overflow-hidden"
            style={getTransformStyle(0.1)}
          >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to explore new hobbies?</h3>
              <p className="text-gray-600 mb-6 md:mb-8">Join our community of passionate hobbyists and discover your next favorite activity.</p>
              <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-md px-6 py-5 h-auto text-base font-medium shadow-lg shadow-indigo-200 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200">
                Browse All Hobbies
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add a subtle animation to the entire section */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default HobbySection
