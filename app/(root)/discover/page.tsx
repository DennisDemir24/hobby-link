'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Plus, ArrowRight, Flame, TrendingUp, Users, Sparkles } from 'lucide-react'
import { getHobbies } from '@/lib/actions/hobby.action'
import { CreateHobbyModal } from '@/components/modals/CreateHobbyModal'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@clerk/nextjs'

// Define types for our data
interface Hobby {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  emoji: string | null;
  difficulty: string | null;
  timeCommitment: string | null;
  costRange: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const DiscoverPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn } = useAuth();
  
  useEffect(() => {
    async function fetchHobbies() {
      try {
        const fetchedHobbies = await getHobbies();
        setHobbies(fetchedHobbies);
      } catch (error) {
        console.error("Error fetching hobbies:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHobbies();
  }, []);
  
  // Get all unique categories (from tags for now)
  const allCategories = Array.from(
    new Set(hobbies.flatMap(hobby => hobby.tags))
  );
  
  const filteredHobbies = hobbies.filter(hobby => 
    (searchQuery === '' || 
      hobby.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hobby.description && hobby.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      hobby.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) &&
    (selectedCategory === null || hobby.tags.includes(selectedCategory))
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div>
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discover New Hobbies</h1>
          <p className="text-gray-600">Explore trending hobbies and find your next passion</p>
        </div>
        {isSignedIn ? (
          <CreateHobbyModal>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Hobby
            </Button>
          </CreateHobbyModal>
        ) : (
          <Link href="/sign-in">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Users className="h-4 w-4 mr-2" />
              Sign in to create
            </Button>
          </Link>
        )}
      </div>
      
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search hobbies..."
          className="pl-10 pr-10 border border-gray-200 focus-visible:border-indigo-300 focus-visible:ring-indigo-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Category filters */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            className={`rounded-full whitespace-nowrap ${
              selectedCategory === null 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </Button>
          
          {allCategories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className={`rounded-full whitespace-nowrap ${
                selectedCategory === category 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Results count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          {filteredHobbies.length} {filteredHobbies.length === 1 ? 'hobby' : 'hobbies'} found
        </p>
        
        {(searchQuery || selectedCategory) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-indigo-600 hover:text-indigo-800"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading hobbies...</p>
        </div>
      ) : (
        <>
          {/* Hobby cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHobbies.map((hobby) => (
              <div key={hobby.id} className="block h-full">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full overflow-hidden">
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                    <div className="text-7xl">
                      {hobby.emoji || (
                        hobby.name.toLowerCase().includes("paint") ? "🎨" : 
                        hobby.name.toLowerCase().includes("garden") ? "🌱" : 
                        hobby.name.toLowerCase().includes("cook") ? "🍳" : "🔍"
                      )}
                    </div>
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 text-indigo-600 font-medium shadow-sm border border-indigo-100 backdrop-blur-sm">
                        {hobby.tags[0] ? hobby.tags[0].charAt(0).toUpperCase() + hobby.tags[0].slice(1) : "Hobby"}
                      </Badge>
                    </div>
                    {/* Trending percentage badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-indigo-600 font-medium shadow-sm border border-indigo-100 backdrop-blur-sm">
                        <TrendingUp className="h-3 w-3 mr-1 text-indigo-600" />
                        +{Math.floor(Math.random() * 50) + 10}%
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl mb-2 text-gray-900">{hobby.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hobby.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {hobby.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag} 
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {hobby.tags.length > 3 && (
                        <span className="inline-block text-gray-500 text-xs px-1">
                          +{hobby.tags.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {/* Hobby stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Flame className="w-4 h-4 mr-1 text-amber-500" />
                        <span>Rising Fast</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>Growing</span>
                      </div>
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        <span>Trending</span>
                      </div>
                    </div>
                    
                    <div className="h-[1px] w-full bg-gray-100 mb-4"></div>
                    
                    <Link href={`/hobby/${hobby.id}`} passHref legacyBehavior>
                      <Button 
                        variant="ghost" 
                        className="text-indigo-600 p-0 h-auto font-medium hover:bg-transparent hover:text-indigo-700 group/btn"
                        asChild
                      >
                        <a>
                          Explore this hobby
                          <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredHobbies.length === 0 && !loading && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-500 mb-2">No hobbies found matching your search.</p>
              <Button 
                variant="outline" 
                className="mt-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DiscoverPage
