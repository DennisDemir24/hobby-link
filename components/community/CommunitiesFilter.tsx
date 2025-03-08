'use client';

import { useState, useMemo } from 'react';
import { Search, Users, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { CommunityCard } from '@/components/community/CommunityCard';
import { Badge } from '@/components/ui/badge';

type Community = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  members: { userId: string }[];
  _count: { members: number };
  hobby: { name: string };
};

interface CommunitiesFilterProps {
  communities: Community[];
  userId: string;
}

export function CommunitiesFilter({ communities, userId }: CommunitiesFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    onlyMyMemberships: false,
    sortBy: 'newest' as 'newest' | 'oldest' | 'mostMembers',
  });

  // Extract unique hobby names for filtering
  const hobbyNames = useMemo(() => {
    const names = communities.map(community => community.hobby.name);
    return [...new Set(names)];
  }, [communities]);

  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  // Filter and sort communities based on search query and filter options
  const filteredCommunities = useMemo(() => {
    return communities
      .filter(community => {
        // Search filter
        const matchesSearch = searchQuery === '' || 
          community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Membership filter
        const matchesMembership = !filterOptions.onlyMyMemberships || 
          community.members.some(member => member.userId === userId);
        
        // Hobby filter
        const matchesHobby = selectedHobbies.length === 0 || 
          selectedHobbies.includes(community.hobby.name);
        
        return matchesSearch && matchesMembership && matchesHobby;
      })
      .sort((a, b) => {
        if (filterOptions.sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (filterOptions.sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (filterOptions.sortBy === 'mostMembers') {
          return b._count.members - a._count.members;
        }
        return 0;
      });
  }, [communities, searchQuery, filterOptions, selectedHobbies, userId]);

  // Toggle hobby selection
  const toggleHobby = (hobby: string) => {
    setSelectedHobbies(prev => 
      prev.includes(hobby) 
        ? prev.filter(h => h !== hobby) 
        : [...prev, hobby]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterOptions({
      onlyMyMemberships: false,
      sortBy: 'newest',
    });
    setSelectedHobbies([]);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            type="search" 
            placeholder="Search communities..." 
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <div className="p-2">
                <div className="font-medium mb-2">Sort by</div>
                <DropdownMenuCheckboxItem
                  checked={filterOptions.sortBy === 'newest'}
                  onCheckedChange={() => setFilterOptions(prev => ({ ...prev, sortBy: 'newest' }))}
                >
                  Newest first
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterOptions.sortBy === 'oldest'}
                  onCheckedChange={() => setFilterOptions(prev => ({ ...prev, sortBy: 'oldest' }))}
                >
                  Oldest first
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterOptions.sortBy === 'mostMembers'}
                  onCheckedChange={() => setFilterOptions(prev => ({ ...prev, sortBy: 'mostMembers' }))}
                >
                  Most members
                </DropdownMenuCheckboxItem>
                
                <div className="h-px bg-gray-100 my-2"></div>
                
                <div className="font-medium mb-2">Membership</div>
                <DropdownMenuCheckboxItem
                  checked={filterOptions.onlyMyMemberships}
                  onCheckedChange={() => setFilterOptions(prev => ({ 
                    ...prev, 
                    onlyMyMemberships: !prev.onlyMyMemberships 
                  }))}
                >
                  Only my communities
                </DropdownMenuCheckboxItem>
                
                {hobbyNames.length > 0 && (
                  <>
                    <div className="h-px bg-gray-100 my-2"></div>
                    <div className="font-medium mb-2">Hobbies</div>
                    {hobbyNames.map(hobby => (
                      <DropdownMenuCheckboxItem
                        key={hobby}
                        checked={selectedHobbies.includes(hobby)}
                        onCheckedChange={() => toggleHobby(hobby)}
                      >
                        {hobby}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(searchQuery || filterOptions.onlyMyMemberships || selectedHobbies.length > 0) && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {/* Active filters display */}
      {(filterOptions.onlyMyMemberships || selectedHobbies.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filterOptions.onlyMyMemberships && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users size={12} />
              <span>My communities</span>
              <button 
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                onClick={() => setFilterOptions(prev => ({ ...prev, onlyMyMemberships: false }))}
              >
                ✕
              </button>
            </Badge>
          )}
          
          {selectedHobbies.map(hobby => (
            <Badge key={hobby} variant="secondary" className="flex items-center gap-1">
              <span>{hobby}</span>
              <button 
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                onClick={() => toggleHobby(hobby)}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {filteredCommunities.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-medium">No communities found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <CommunityCard 
              key={community.id} 
              community={community} 
              memberCount={community._count.members}
              currentUserId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
} 