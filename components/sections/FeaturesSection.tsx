'use client'

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowRight, Code, Compass, Lightbulb, Palette, Share2, Sparkles } from "lucide-react";

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
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

  // Feature data
  const features = [
    {
      icon: <Lightbulb className="w-6 h-6 text-amber-500" />,
      color: "bg-amber-50",
      title: "Discover New Ideas",
      description: "Explore a world of creative possibilities and find inspiration for your next project."
    },
    {
      icon: <Share2 className="w-6 h-6 text-blue-500" />,
      color: "bg-blue-50",
      title: "Connect & Share",
      description: "Share your creations with the community and receive valuable feedback."
    },
    {
      icon: <Compass className="w-6 h-6 text-emerald-500" />,
      color: "bg-emerald-50",
      title: "Explore Trends",
      description: "Stay up-to-date with the latest trends and techniques in your favorite hobbies."
    },
    {
      icon: <Code className="w-6 h-6 text-purple-500" />,
      color: "bg-purple-50",
      title: "Learn Skills",
      description: "Access tutorials and resources to develop and enhance your skills."
    },
    {
      icon: <Palette className="w-6 h-6 text-rose-500" />,
      color: "bg-rose-50",
      title: "Creative Tools",
      description: "Discover tools and resources that will help bring your creative vision to life."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
      color: "bg-indigo-50",
      title: "Get Inspired",
      description: "Find motivation from other creators and their amazing projects."
    }
  ];
  
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
            ✨ Powerful Features
          </div>
          
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 sm:mb-6 leading-tight"
            style={getTransformStyle(-0.8)}
          >
            Everything you need to <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">explore your passions</span>
          </h2>
          
          <p 
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
            style={getTransformStyle(-0.4)}
          >
            Our platform provides all the tools and resources you need to discover, connect, and grow in your favorite hobbies and interests.
          </p>
        </div>
        
        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border border-gray-100 hover:border-indigo-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              style={{
                ...getTransformStyle(index % 2 === 0 ? 0.2 : -0.2),
                transitionProperty: 'transform, box-shadow, border-color',
              }}
            >
              <CardHeader className="pb-0">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[1px] w-full bg-gray-100 mb-4"></div>
                <Button variant="ghost" className="text-indigo-600 p-0 h-auto font-medium hover:bg-transparent hover:text-indigo-700 group/btn">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* CTA section */}
        {/* <div className="mt-20 text-center">
          <div 
            className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-indigo-100 shadow-xl relative overflow-hidden"
            style={getTransformStyle(0.1)}
          >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to start your journey?</h3>
              <p className="text-gray-600 mb-6 md:mb-8">Join thousands of hobby enthusiasts and start exploring today.</p>
              <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-md px-6 py-5 h-auto text-base font-medium shadow-lg shadow-indigo-200 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div> */}
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
      `}</style>
    </div>
  );
};

export default FeaturesSection;
