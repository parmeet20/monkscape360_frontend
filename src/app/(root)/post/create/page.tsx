"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/userStore";
import { createPost } from "@/service/post/postService";

// Validation schema
const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

const CreatePostPage = () => {
    const router = useRouter();
    const { token } = useAuthStore();
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });

    if (!token) return null;
    const cleanToken = token.replace(/^"(.*)"$/, "$1");

    async function onSubmit(data: FormData) {
        try {
            await createPost(data, cleanToken);
            toast.success("Post created successfully!");
            router.push(`/post`);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6">Create New Post</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Title */}
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

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write a detailed description of your post"
                                        className="resize-none"
                                        {...field}
                                        rows={6}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full">
                        Create Post
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default CreatePostPage;
