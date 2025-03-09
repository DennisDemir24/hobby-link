'use client';

import { useState, useMemo } from 'react';
import { Search, Users, Filter, X } from 'lucide-react';
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

  // Disable "My Memberships" filter if user is not authenticated
  const isAuthenticated = !!userId;

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
        
        // Membership filter - only apply if user is authenticated
        const matchesMembership = !isAuthenticated ? true : 
          !filterOptions.onlyMyMemberships || 
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
  }, [communities, searchQuery, filterOptions, selectedHobbies, userId, isAuthenticated]);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white">
                <Filter className="h-4 w-4 mr-2" />
                Filter
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
                  onCheckedChange={() => {
                    if (isAuthenticated) {
                      setFilterOptions(prev => ({ 
                        ...prev,
                        onlyMyMemberships: !prev.onlyMyMemberships 
                      }));
                    }
                  }}
                  disabled={!isAuthenticated}
                  className={!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Only my communities {!isAuthenticated && "(Sign in to use)"}
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

          {/* Clear filters button */}
          {(searchQuery || filterOptions.onlyMyMemberships || selectedHobbies.length > 0 || filterOptions.sortBy !== 'newest') && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="h-10 px-3"
            >
              <X className="h-4 w-4 mr-2" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Active filters display */}
      {(filterOptions.onlyMyMemberships || selectedHobbies.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {filterOptions.onlyMyMemberships && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-100">
              <Users size={12} />
              My communities
              <button 
                className="ml-1 hover:bg-indigo-100 rounded-full p-0.5"
                onClick={() => setFilterOptions(prev => ({ ...prev, onlyMyMemberships: false }))}
              >
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {selectedHobbies.map(hobby => (
            <Badge 
              key={hobby}
              variant="secondary" 
              className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-100"
            >
              {hobby}
              <button 
                className="ml-1 hover:bg-indigo-100 rounded-full p-0.5"
                onClick={() => toggleHobby(hobby)}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Communities grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map(community => (
            <CommunityCard 
              key={community.id} 
              community={community} 
              memberCount={community._count.members}
              currentUserId={userId}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-gray-50 rounded-xl">
            <h3 className="text-xl font-medium text-gray-900">No communities found</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Try adjusting your filters or search query.
            </p>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="bg-white"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 