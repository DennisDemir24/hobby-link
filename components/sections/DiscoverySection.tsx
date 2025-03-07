'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { ArrowRight } from 'lucide-react'
import DiscoveryCard, { TrendingHobby } from '../discovery/DiscoveryCard'

// Sample trending hobbies data - in a real app, this would come from an API
const trendingHobbies: TrendingHobby[] = [
  {
    id: 1,
    title: 'Pottery',
    description: 'Create beautiful ceramic pieces with your hands and express your creativity.',
    image: '/images/hobbies/pottery.jpg',
    category: 'Art & Crafts',
    trendingFactor: 'Rising Fast',
    trendingPercentage: '+32%',
    tags: ['creative', 'tactile', 'artistic']
  },
  {
    id: 2,
    title: 'Drone Photography',
    description: 'Capture breathtaking aerial views and explore photography from new heights.',
    image: '/images/hobbies/drone.jpg',
    category: 'Photography',
    trendingFactor: 'Hot This Month',
    trendingPercentage: '+45%',
    tags: ['outdoor', 'technical', 'adventure']
  },
  {
    id: 3,
    title: 'Sustainable Gardening',
    description: 'Grow your own food and create eco-friendly garden spaces that benefit the planet.',
    image: '/images/hobbies/sustainable-garden.jpg',
    category: 'Home & Garden',
    trendingFactor: 'Steady Growth',
    trendingPercentage: '+18%',
    tags: ['eco-friendly', 'outdoor', 'healthy']
  },
  {
    id: 4,
    title: 'Digital Art',
    description: 'Create stunning digital illustrations and artwork using modern tools and techniques.',
    image: '/images/hobbies/digital-art.jpg',
    category: 'Art & Digital',
    trendingFactor: 'Viral',
    trendingPercentage: '+67%',
    tags: ['creative', 'digital', 'modern']
  },
  {
    id: 5,
    title: 'Bouldering',
    description: 'Challenge yourself with this dynamic form of rock climbing that builds strength and problem-solving skills.',
    image: '/images/hobbies/bouldering.jpg',
    category: 'Sports & Fitness',
    trendingFactor: 'New Trend',
    trendingPercentage: '+52%',
    tags: ['fitness', 'outdoor', 'challenge']
  }
];

const DiscoverySection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  useEffect(() => {
    // Check if we're on mobile for disabling certain effects
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current || isMobile) return;
      
      const { clientX, clientY } = e;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / 30;
      const moveY = (y - centerY) / 30;
      
      setMousePosition({ x: moveX, y: moveY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);
  
  // Helper function to calculate transform style based on device
  const getTransformStyle = (factor: number) => {
    if (isMobile) return {};
    
    return {
      transform: `translate(${mousePosition.x * factor}px, ${mousePosition.y * factor}px)`,
      transition: 'transform 0.1s ease-out'
    };
  };

  // Categories derived from trending hobbies
  const categories = ['All', ...Array.from(new Set(trendingHobbies.map(hobby => hobby.category)))];
  
  // Filter hobbies based on selected category
  const filteredHobbies = activeCategory === 'All' 
    ? trendingHobbies 
    : trendingHobbies.filter(hobby => hobby.category === activeCategory);

  return (
    <div 
      ref={sectionRef}
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-100 opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100 opacity-20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-purple-100 opacity-10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTU5IDFIMXY1OGg1OFYxeiIgZmlsbD0iI0YxRjFGMSIvPjwvZz48L3N2Zz4=')]" style={{ opacity: 0.4 }} />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div 
            className="inline-block px-4 py-1.5 mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-sm font-medium text-indigo-600 border border-blue-100"
            style={getTransformStyle(-0.5)}
          >
            🔥 Trending Now
          </div>
          
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 sm:mb-6 leading-tight"
            style={getTransformStyle(-0.8)}
          >
            Discover <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Trending Hobbies</span>
          </h2>
          
          <p 
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
            style={getTransformStyle(-0.4)}
          >
            Explore the fastest growing hobbies and activities that people are passionate about right now.
          </p>
        </div>
        
        {/* Category filters */}
        <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex space-x-2 min-w-max justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 ${
                  activeCategory === category 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Trending hobbies grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredHobbies.map((hobby, index) => (
            <DiscoveryCard key={hobby.id} hobby={hobby} index={index} />
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
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to discover trending hobbies?</h3>
              <p className="text-gray-600 mb-6 md:mb-8">Join our community of passionate hobbyists and explore the latest trending activities.</p>
              <Button 
                size="lg" 
                className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-md px-6 py-5 h-auto text-base font-medium shadow-lg shadow-indigo-200 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200 group"
              >
                <span>View all trending hobbies</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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

export default DiscoverySection
