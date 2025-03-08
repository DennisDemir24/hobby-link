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
import { createCommunity } from "@/lib/actions/community.action";

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
});

interface CreateCommunityModalProps {
  children: React.ReactNode;
  hobbyId?: string;
}

export function CreateCommunityModal({ children, hobbyId = "" }: CreateCommunityModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpen(false);
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
        hobbyId: hobbyId,
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div 
            ref={modalRef}
            className="bg-white dark:bg-gray-900 w-full max-w-[500px] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mx-4 text-white"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-white">
                <Users className="h-5 w-5 text-primary" />
                Create a Community
              </h2>
              <button 
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Create a new community to connect with people who share your interests.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">Community Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter community name" 
                          {...field} 
                          autoComplete="off"
                          className="bg-white dark:bg-gray-800"
                        />
                      </FormControl>
                      <FormDescription className="dark:text-gray-400">
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
                      <FormLabel className="dark:text-gray-200">Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this community is about" 
                          className="min-h-[100px] resize-none bg-white dark:bg-gray-800"
                          {...field} 
                        />
                      </FormControl>
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
                    className="bg-white dark:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
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
      )}
    </>
  );
}