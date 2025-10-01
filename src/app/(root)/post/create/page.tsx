"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { config } from '@/lib/config';
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
    imageUrl: z.union([z.instanceof(File), z.string()]).optional(),
});

type FormData = z.infer<typeof formSchema>;

const CreatePostPage = () => {
    const router = useRouter();
    const { token } = useAuthStore();
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: undefined,
        },
    });

    if (!token) return null;
    const cleanToken = token.replace(/^"(.*)"$/, "$1");

    async function uploadToCloudinary(file: File): Promise<string> {
        if (!file.type.startsWith("image/")) {
            throw new Error("Please upload a valid image file");
        }
        if (file.size > 10 * 1024 * 1024) {
            throw new Error("Image size must be less than 10MB");
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "estateWebsite");
        formData.append("cloud_name", config.NEXT_PUBLIC_CLOUD_NAME);

        try {
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/dttieo9rb/image/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );
            const data = await response.json();
            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error("Image upload failed");
            }
        } catch {
            throw new Error("Failed to upload image to Cloudinary");
        } finally {
            setUploading(false);
        }
    }

    async function onSubmit(data: FormData) {
        try {
            let postData: { title: string; description: string; imageUrl?: string } = {
                title: data.title,
                description: data.description,
            };

            const imageFile = data.imageUrl;
            if (imageFile instanceof File) {
                const imageUrl = await uploadToCloudinary(imageFile);
                postData.imageUrl = imageUrl;
            } else if (typeof imageFile === "string") {
                postData.imageUrl = imageFile;
            }

            await createPost(postData, cleanToken);
            toast.success("Post created successfully!");
            router.push(`/post`);
        } catch {
            toast.error("Something went wrong");
        } finally {
            // Cleanup preview URL
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
                setPreviewImage(null);
            }
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Create New Post
            </h1>

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

                    {/* Image Upload */}
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Image (Optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                onChange(file);
                                                // Set preview
                                                const previewUrl = URL.createObjectURL(file);
                                                setPreviewImage(previewUrl);
                                            } else {
                                                setPreviewImage(null);
                                            }
                                        }}
                                        {...rest}
                                    />
                                </FormControl>
                                {previewImage && (
                                    <div className="mt-4">
                                        <img
                                            src={previewImage}
                                            alt="Post image preview"
                                            className="w-full h-48 object-cover rounded-md"
                                            onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                                        />
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={uploading}>
                        {uploading ? "Uploading..." : "Create Post"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default CreatePostPage;