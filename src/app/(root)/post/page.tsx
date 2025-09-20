"use client";

import React, { useEffect, useState } from "react";
import { getPosts } from "@/service/post/postService";
import { Post } from "@/types";
import { Loader2 } from "lucide-react";
import { PostCard } from "@/components/manual/card/PostCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/userStore";

const AllPostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-24 px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
        All Posts
      </h1>

      {token! ? <Button><Link href={'/post/create'}>Create Post</Link></Button> : null}

      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPostPage;
