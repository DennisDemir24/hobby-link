'use client'

import { useState } from 'react'
import Link from 'next/link'
import DiscoveryCard from '@/components/discovery/DiscoveryCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

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
  longDescription?: string;
  difficulty?: string;
  timeCommitment?: string;
  costRange?: string;
  communities?: number;
  resources?: Resource[];
  relatedHobbies?: number[];
}

// Mock data for trending hobbies
const trendingHobbies: Hobby[] = [
  {
    id: 1,
    title: 'Urban Gardening',
    description: 'Transform your urban space into a green oasis with container gardening, vertical gardens, and more.',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Outdoors',
    trendingFactor: 'High demand',
    trendingPercentage: '+32%',
    tags: ['sustainable', 'plants', 'urban']
  },
  {
    id: 2,
    title: 'Drone Photography',
    description: 'Capture stunning aerial perspectives with the latest drone technology and photography techniques.',
    image: 'https://images.unsplash.com/photo-1506947411487-a56738267384?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Technology',
    trendingFactor: 'Growing fast',
    trendingPercentage: '+45%',
    tags: ['photography', 'tech', 'aerial']
  },
  {
    id: 3,
    title: 'Pottery',
    description: 'Learn the art of creating beautiful ceramic pieces with your hands and a pottery wheel.',
    image: 'https://images.unsplash.com/photo-1565122256212-41788ba908b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Crafts',
    trendingFactor: 'Steady growth',
    trendingPercentage: '+18%',
    tags: ['handmade', 'ceramics', 'art']
  },
  {
    id: 4,
    title: 'Bouldering',
    description: 'Challenge yourself with this form of rock climbing performed without the use of ropes or harnesses.',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    trendingFactor: 'Very popular',
    trendingPercentage: '+62%',
    tags: ['climbing', 'fitness', 'outdoor']
  },
  {
    id: 5,
    title: 'Fermentation',
    description: 'Discover the science and art of fermentation to create your own kombucha, kimchi, and more.',
    image: 'https://images.unsplash.com/photo-1590592029783-bbc950d20e63?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Culinary',
    trendingFactor: 'Rising trend',
    trendingPercentage: '+27%',
    tags: ['food', 'health', 'diy']
  },
  {
    id: 6,
    title: 'Digital Illustration',
    description: 'Create stunning digital artwork using the latest software and techniques.',
    image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'Art',
    trendingFactor: 'High demand',
    trendingPercentage: '+38%',
    tags: ['digital', 'art', 'design']
  }
];

const DiscoverPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get all unique categories
  const allCategories = Array.from(
    new Set(trendingHobbies.map(hobby => hobby.category))
  );
  
  const filteredHobbies = trendingHobbies.filter(hobby => 
    (searchQuery === '' || 
      hobby.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hobby.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hobby.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) &&
    (selectedCategory === null || hobby.category === selectedCategory)
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div>
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Discover New Hobbies</h1>
        <p className="text-gray-600">Explore trending hobbies and find your next passion</p>
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
      
      {/* Hobby cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHobbies.map((hobby, index) => (
          <Link href={`/hobby/${hobby.id}`} key={hobby.id} className="block h-full">
            <DiscoveryCard hobby={hobby} index={index} />
          </Link>
        ))}
      </div>
      
      {filteredHobbies.length === 0 && (
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
    </div>
  )
}

export default DiscoverPage
