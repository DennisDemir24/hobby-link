'use client'

import { ArrowRight, Heart, Puzzle, Users } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";

const HeroSection = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
      // Check if we're on mobile for disabling certain effects
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!heroRef.current || isMobile) return;
        
        const { clientX, clientY } = e;
        const rect = heroRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 25; // Increased sensitivity
        const moveY = (y - centerY) / 25;
        
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
    
    return (
      <div 
        ref={heroRef}
        className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
      >
        {/* Animated background elements - responsive sizing */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-[#E5DEFF] opacity-20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/4 left-1/4 w-[200px] sm:w-[250px] md:w-[300px] h-[200px] sm:h-[250px] md:h-[300px] bg-[#FFE5E5] opacity-10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute -bottom-32 -left-32 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-[#D3E4FD] opacity-20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-1/4 right-1/4 w-[150px] sm:w-[200px] md:w-[250px] h-[150px] sm:h-[200px] md:h-[250px] bg-[#E5FFED] opacity-10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTU5IDFIMXY1OGg1OFYxeiIgZmlsbD0iI0YxRjFGMSIvPjwvZz48L3N2Zz4=')]" style={{ opacity: 0.4 }} />
        </div>
        
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 relative z-10">
          {/* Text content - centered on mobile, left-aligned on desktop */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div 
              className="inline-block px-4 py-1.5 mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-sm font-medium text-indigo-600 border border-blue-100"
              style={getTransformStyle(-0.5)}
            >
              ✨ Connect through shared passions
            </div>
            
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight mb-4 sm:mb-6 leading-tight"
              style={getTransformStyle(-0.8)}
            >
              Discover people who share your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">passions</span>
            </h1>
            
            <p 
              className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0"
              style={getTransformStyle(-0.4)}
            >
              Join a vibrant community of hobby enthusiasts, connect with like-minded individuals, and explore new interests together.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8"
              style={getTransformStyle(-0.2)}
            >
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 rounded-md px-6 py-5 sm:py-6 h-auto text-base font-medium group shadow-lg shadow-indigo-200 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-gray-700 border-gray-300 hover:bg-gray-50 rounded-md px-6 py-5 sm:py-6 h-auto text-base font-medium">
                Learn more
              </Button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                    {i}
                  </div>
                ))}
              </div>
              <span>Join <span className="font-medium text-indigo-600">2,000+</span> hobby enthusiasts</span>
            </div>
          </div>
          
          {/* Illustration - responsive sizing and positioning */}
          <div 
            className="w-full lg:w-1/2 relative mt-12 lg:mt-0"
            style={getTransformStyle(0.5)}
          >
            <div className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[380px] md:max-w-md aspect-square mx-auto">
              {/* Main feature illustration */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="h-3 sm:h-4 w-16 sm:w-24 bg-gray-100 rounded"></div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2 sm:gap-3">
                      <div className="h-3 sm:h-4 w-full bg-gray-100 rounded"></div>
                      <div className="h-3 sm:h-4 w-3/4 bg-gray-100 rounded"></div>
                      <div className="h-12 sm:h-20 w-full bg-indigo-50 rounded-lg mt-2"></div>
                      <div className="h-3 sm:h-4 w-1/2 bg-gray-100 rounded"></div>
                      <div className="h-3 sm:h-4 w-2/3 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements - responsive sizing and positioning */}
              <div className="absolute top-4 sm:top-6 -right-4 sm:-right-6 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-yellow-100 rounded-lg shadow-md flex items-center justify-center transform rotate-6 animate-float" style={{ animationDelay: "0.5s" }}>
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-500" />
              </div>
              
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-blue-100 rounded-lg shadow-md flex items-center justify-center transform -rotate-6 animate-float" style={{ animationDelay: "1s" }}>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-500" />
              </div>
              
              <div className="absolute top-1/2 -right-8 sm:-right-10 md:-right-12 w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 bg-green-100 rounded-lg shadow-md flex items-center justify-center transform rotate-12 animate-float" style={{ animationDelay: "1.5s" }}>
                <Puzzle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Feature cards - responsive grid */}
        <div className="w-full max-w-6xl mx-auto mt-16 sm:mt-20 md:mt-24 relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white rounded-xl p-6 sm:p-8 flex flex-col items-start text-left shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 hover:border-indigo-100">
              <div className="mb-4 flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-blue-50 rounded-lg">
                <Users className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2">Community</h3>
              <p className="text-sm sm:text-base text-gray-600">Join groups of enthusiasts who share your interests and passions.</p>
            </div>
            <div className="bg-white rounded-xl p-6 sm:p-8 flex flex-col items-start text-left shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 hover:border-indigo-100">
              <div className="mb-4 flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-pink-50 rounded-lg">
                <Heart className="w-5 sm:w-6 h-5 sm:h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2">Connections</h3>
              <p className="text-sm sm:text-base text-gray-600">Meet and connect with like-minded people from around the world.</p>
            </div>
            <div className="bg-white rounded-xl p-6 sm:p-8 flex flex-col items-start text-left shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 hover:border-indigo-100 sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-green-50 rounded-lg">
                <Puzzle className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2">Discovery</h3>
              <p className="text-sm sm:text-base text-gray-600">Explore new hobbies and interests through curated recommendations.</p>
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
          
          /* Add xs breakpoint for very small screens */
          @media (min-width: 400px) {
            .xs\\:max-w-\\[320px\\] {
              max-width: 320px;
            }
          }
        `}</style>
      </div>
    );
  };
  
  export default HeroSection;