"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { X } from "lucide-react";

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
import { createHobby } from "@/lib/actions/hobby.action";

// Common emojis for hobbies
const HOBBY_EMOJIS = [
  "🎨", "🎭", "🎮", "📚", "🎬", "🎧", "🎸", "🏋️", "🚴", "🧘", 
  "🏄", "🏊", "⚽", "🏀", "🎯", "🎣", "🧩", "🎲", "🧶", "🧵", 
  "🌱", "🍳", "🥘", "🍰", "📷", "✈️", "🏕️", "🚶", "🧪", "🔭"
];

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Hobby name must be at least 3 characters.",
  }).max(50, {
    message: "Hobby name must be less than 50 characters."
  }),
  description: z.string().max(500, {
    message: "Description must be less than 500 characters."
  }).optional(),
  tags: z.string().transform((val) => {
    if (!val) return [] as string[];
    return val.split(',').map(tag => tag.trim()).filter(tag => tag !== "") as string[];
  }),
  emoji: z.string().optional(),
  difficulty: z.string().optional(),
  timeCommitment: z.string().optional(),
  costRange: z.string().optional(),
  location: z.string().optional(),
});

interface CreateHobbyModalProps {
  children: React.ReactNode;
}

export function CreateHobbyModal({ children }: CreateHobbyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🎨");
  const modalRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: [] as string[],
      emoji: "🎨",
      difficulty: "",
      timeCommitment: "",
      costRange: "",
      location: "",
    },
  });

  // Handle click outside to close modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    } else {
      document.removeEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [isOpen]);

  // Update form when emoji is selected
  useEffect(() => {
    form.setValue("emoji", selectedEmoji);
  }, [selectedEmoji, form]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      const hobby = await createHobby(
        values.name,
        values.description || null,
        values.tags,
        values.emoji,
        values.difficulty || undefined,
        values.timeCommitment || undefined,
        values.costRange || undefined,
        values.location || undefined
      );
      
      toast.success("Hobby created successfully!");
      setIsOpen(false);
      form.reset();
      
      // Redirect to the new hobby page
      router.push(`/hobby/${hobby.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating hobby:", error);
      toast.error("Failed to create hobby. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Hobby</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hobby Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Urban Gardening" 
                            {...field} 
                            ref={initialFocusRef}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this hobby is about..." 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., outdoor, creative, fitness (comma-separated)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter tags separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emoji"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Choose an Emoji</FormLabel>
                        <FormControl>
                          <div className="mt-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md text-3xl">
                                {selectedEmoji}
                              </div>
                              <div className="text-sm text-gray-500">
                                Selected emoji
                              </div>
                            </div>
                            <div className="grid grid-cols-10 gap-2">
                              {HOBBY_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    setSelectedEmoji(emoji);
                                    field.onChange(emoji);
                                  }}
                                  className={`w-8 h-8 flex items-center justify-center text-xl rounded hover:bg-gray-100 ${
                                    selectedEmoji === emoji ? 'bg-indigo-100 border border-indigo-300' : ''
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Beginner" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="timeCommitment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Commitment (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 2-3 hours/week" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="costRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Range (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., $50-100" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Indoor" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isSubmitting ? "Creating..." : "Create Hobby"}
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