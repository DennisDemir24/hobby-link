"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { editPost } from "@/lib/actions/post.action";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters",
  }).max(100, {
    message: "Title cannot exceed 100 characters",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters",
  }),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditPostFormProps {
  postId: string;
  defaultValues: {
    title: string;
    content: string;
    tags: string[];
  };
  onCancel: () => void;
}

export function EditPostForm({ 
  postId, 
  defaultValues, 
  onCancel 
}: EditPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues.title,
      content: defaultValues.content,
      tags: defaultValues.tags.join(", "),
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Process tags (convert comma-separated string to array)
      const tags = values.tags 
        ? values.tags.split(",").map(tag => tag.trim()).filter(Boolean)
        : [];
      
      await editPost(postId, {
        title: values.title,
        content: values.content,
        tags,
      });
      
      toast.success("Post updated successfully!");
      router.refresh();
      onCancel(); // Close the edit form
      
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Post</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your thoughts..." 
                      className="min-h-32" 
                      {...field} 
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
                  <FormLabel>Tags (optional, comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="tag1, tag2, tag3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Post"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 