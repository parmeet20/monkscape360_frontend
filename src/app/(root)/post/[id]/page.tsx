"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPostById, increaseViewOfPost } from "@/service/post/postService";
import { Post } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const PostDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            toast.error("Invalid post ID");
            router.push("/post");
            return;
        }

        const fetchPostAndIncrementView = async () => {
            try {
                const postData = await getPostById(id);
                setPost(postData);

                await increaseViewOfPost(id);
            } catch (error) {
                console.error("Error fetching post or incrementing view:", error);
                toast.error("Failed to load post details");
                router.push("/post");
            } finally {
                setLoading(false);
            }
        };

        fetchPostAndIncrementView();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <p className="text-gray-500">Post not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pt-24 px-4 py-10">
            <div className="mb-6">
                <Button variant="outline" asChild>
                    <Link href="/post">Back to Posts</Link>
                </Button>
            </div>

            <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                {post.imageUrl && (
                    <img
                        src={post.imageUrl}
                        alt={`Image for ${post.title}`}
                        className="w-full h-64 object-cover rounded-t-2xl"
                        onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                    />
                )}
                <CardHeader>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Posted on{" "}
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}{" "}
                        by User: {post.userId}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {post.description}
                    </p>
                </CardContent>
                <CardFooter>
                    <Button variant={"secondary"}>
                        <Eye />{post.views} views
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PostDetailPage;