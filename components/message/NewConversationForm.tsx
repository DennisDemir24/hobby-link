"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createConversation } from "@/lib/actions/conversation.action";

interface User {
  id: string;
  clerkUserId: string;
  name: string | null;
  imageUrl: string | null;
}

interface Community {
  id: string;
  name: string;
}

interface NewConversationFormProps {
  users: User[];
  communities: Community[];
  currentUserId: string;
}

export function NewConversationForm({ users, communities, currentUserId }: NewConversationFormProps) {
  const router = useRouter();
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter out the current user from the users list
  const filteredUsers = users.filter(user => user.clerkUserId !== currentUserId);
  
  const handleCreateConversation = async () => {
    if (isSubmitting) return;
    
    if (isGroup && (!groupName.trim() || selectedUsers.length === 0)) {
      return;
    }
    
    if (!isGroup && selectedUsers.length !== 1) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await createConversation({
        receiverId: !isGroup ? selectedUsers[0].clerkUserId : undefined,
        name: isGroup ? groupName.trim() : undefined,
        isGroup,
        memberIds: isGroup ? selectedUsers.map(user => user.clerkUserId) : [],
        communityId: selectedCommunity?.id,
      });
      
      if (result && result.id) {
        // Use setTimeout to ensure the navigation happens after the current execution context
        setTimeout(() => {
          router.push(`/messages/${result.id}`);
        }, 0);
      } else {
        console.error("Error: Conversation created but no ID returned");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="group-chat"
          checked={isGroup}
          onCheckedChange={setIsGroup}
          className="data-[state=checked]:bg-indigo-600 data-[state=checked]:hover:bg-indigo-700 data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:hover:bg-gray-300 [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-indigo-600"
        />
        <Label htmlFor="group-chat">Create a group chat</Label>
      </div>
      
      {isGroup && (
        <div className="space-y-2">
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label>
          {isGroup ? "Add participants" : "Select a user to message"}
        </Label>
        <Popover open={isUserOpen} onOpenChange={setIsUserOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isUserOpen}
              className="w-full justify-between"
            >
              {selectedUsers.length > 0
                ? `${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""} selected`
                : "Select users"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 bg-white">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Search users..." />
              <CommandList>
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUsers.some(
                      (selectedUser) => selectedUser.clerkUserId === user.clerkUserId
                    );
                    
                    return (
                      <CommandItem
                        key={user.clerkUserId}
                        value={user.clerkUserId}
                        onSelect={() => {
                          if (isGroup) {
                            setSelectedUsers((prev) =>
                              isSelected
                                ? prev.filter((item) => item.clerkUserId !== user.clerkUserId)
                                : [...prev, user]
                            );
                          } else {
                            setSelectedUsers([user]);
                            setIsUserOpen(false);
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {user.name || "Unknown User"}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {isGroup && (
        <div className="space-y-2">
          <Label>Community (Optional)</Label>
          <Popover open={isCommunityOpen} onOpenChange={setIsCommunityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isCommunityOpen}
                className="w-full justify-between"
              >
                {selectedCommunity?.name || "Select community"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search communities..." />
                <CommandList>
                  <CommandEmpty>No communities found.</CommandEmpty>
                  <CommandGroup>
                    {communities.map((community) => (
                      <CommandItem
                        key={community.id}
                        value={community.id}
                        onSelect={() => {
                          setSelectedCommunity(
                            selectedCommunity?.id === community.id ? null : community
                          );
                          setIsCommunityOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCommunity?.id === community.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {community.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      <Button
        onClick={handleCreateConversation}
        disabled={
          isSubmitting ||
          (isGroup && (!groupName.trim() || selectedUsers.length === 0)) ||
          (!isGroup && selectedUsers.length !== 1)
        }
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {isGroup ? "Create Group Chat" : "Start Conversation"}
      </Button>
    </div>
  );
} 