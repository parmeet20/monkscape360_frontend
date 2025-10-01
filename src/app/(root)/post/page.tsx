"use client";

import React, { useEffect, useState } from "react";
import { getPosts } from "@/service/post/postService";
import { Post } from "@/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useAuthStore } from "@/store/userStore";
import { PostCard } from "@/components/manual/card/PostCard";

const AllPostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuthStore();

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

  const myPosts = posts.filter((post) => post.userId === user?.id);

  return (
    <div className="max-w-6xl mx-auto pt-24 px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
        All Posts
      </h1>

      {token && (
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/post/create">Create Post</Link>
          </Button>
        </div>
      )}

      {user ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-1">
            <TabsTrigger
              value="all"
              className="rounded-lg dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-md transition-all duration-300"
            >
              All Posts
            </TabsTrigger>
            <TabsTrigger
              value="my-posts"
              className="rounded-lg dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-md transition-all duration-300"
            >
              My Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {posts.length === 0 ? (
              <p className="text-center text-gray-500">No posts available.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    canDelete={user?.role === "admin"}
                    onDelete={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-posts">
            {myPosts.length === 0 ? (
              <p className="text-center text-gray-500">You haven&lsquo;t created any posts yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    canDelete={user.id === post.userId}
                    onDelete={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div>
          {posts.length === 0 ? (
            <p className="text-center text-gray-500">No posts available.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  canDelete={false} // Non-logged-in users can't delete
                  onDelete={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllPostPage;