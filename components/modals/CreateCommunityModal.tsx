"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCommunity } from "@/lib/actions/community.action";
import { getHobbies } from "@/lib/actions/hobby.action";

// Hobby interface
interface Hobby {
  id: string;
  name: string;
  description?: string | null;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Community name must be at least 3 characters.",
  }).max(50, {
    message: "Community name must be less than 50 characters."
  }),
  description: z.string().max(500, {
    message: "Description must be less than 500 characters."
  }).optional(),
  hobbyId: z.string().min(1, {
    message: "Please select a hobby for this community."
  }),
});

interface CreateCommunityModalProps {
  children: React.ReactNode;
  hobbyId?: string;
}

export function CreateCommunityModal({ children, hobbyId = "" }: CreateCommunityModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [isLoadingHobbies, setIsLoadingHobbies] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      hobbyId: hobbyId || "",
    },
  });

  // Fetch hobbies when modal opens
  useEffect(() => {
    async function fetchHobbies() {
      if (open) {
        setIsLoadingHobbies(true);
        try {
          const fetchedHobbies = await getHobbies();
          setHobbies(fetchedHobbies);
          
          // If a hobbyId was provided and it exists in the fetched hobbies, select it
          if (hobbyId && fetchedHobbies.some(h => h.id === hobbyId)) {
            form.setValue("hobbyId", hobbyId);
          }
        } catch (error) {
          console.error("Failed to fetch hobbies:", error);
          toast.error("Failed to load hobbies");
        } finally {
          setIsLoadingHobbies(false);
        }
      }
    }
    
    fetchHobbies();
  }, [open, hobbyId, form]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click is outside the modal
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Check if the click is on a select dropdown (which might be in a portal outside the modal)
        const target = event.target as HTMLElement;
        const isSelectDropdown = target.closest('[role="listbox"]') || 
                                target.closest('[data-radix-popper-content-wrapper]');
        
        if (!isSelectDropdown) {
          setOpen(false);
        }
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Handle ESC key press
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [open]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus first input when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the modal is rendered
      const timer = setTimeout(() => {
        const firstInput = modalRef.current?.querySelector('input, textarea, button') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle tab key to trap focus within modal
  useEffect(() => {
    function handleTabKey(e: KeyboardEvent) {
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        // If shift+tab and on first element, move to last element
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } 
        // If tab and on last element, move to first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleTabKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [open]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      
      // Call the server action to create a community
      const community = await createCommunity({
        name: values.name,
        description: values.description || "",
        hobbyId: values.hobbyId,
      });

      toast.success("Community created successfully!");
      form.reset();
      setOpen(false);
      
      // Navigate to the newly created community
      if (community?.id) {
        router.push(`/community/${community.id}`);
      }
      
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create community");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Create a Community
                </h2>
                <button 
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                Create a new community to connect with people who share your interests.
              </p>
              
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(onSubmit)} 
                  className="space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter community name" 
                            {...field} 
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          This is the name that will be displayed publicly.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this community is about" 
                            className="min-h-[100px] resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hobbyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hobby</FormLabel>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isLoadingHobbies}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full border border-input bg-background text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all">
                                <SelectValue placeholder="Select a hobby" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent 
                              position="popper" 
                              sideOffset={5}
                              align="center"
                              className="bg-white border border-gray-200 shadow-lg rounded-md z-[10000]"
                              style={{ maxHeight: '250px', overflowY: 'auto' }}
                            >
                              {isLoadingHobbies ? (
                                <div className="p-2 text-center text-gray-500">
                                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2 align-middle"></span>
                                  Loading hobbies...
                                </div>
                              ) : hobbies.length === 0 ? (
                                <div className="p-2 text-center text-gray-500">
                                  No hobbies found
                                </div>
                              ) : (
                                hobbies.map((hobby) => (
                                  <SelectItem 
                                    key={hobby.id} 
                                    value={hobby.id}
                                    className="cursor-pointer hover:bg-gray-100"
                                  >
                                    {hobby.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormDescription className="text-gray-500">
                          Select the hobby this community is related to.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <span className="mr-2">Creating...</span>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </>
                      ) : (
                        "Create Community"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}