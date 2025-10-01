"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { deletePost } from "@/service/post/postService";
import { useAuthStore } from "@/store/userStore";
import { Post } from "@/types";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
  canDelete?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete, canDelete }) => {
  const { token } = useAuthStore();

  const deletePostHandler = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const cleanToken = token.replace(/^"(.*)"$/, "$1");

      // Delete the post from the database
      await deletePost(post.id, cleanToken);
      toast.success("Post deleted successfully");
      onDelete?.();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Post not deleted");
    }
  };

  return (
    <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="line-clamp-1 text-lg font-semibold">
          {post.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={`Image for ${post.title}`}
            className="w-full h-48 object-cover rounded-md mb-4"
            onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
          />
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {post.description}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Link href={`/post/${post.id}`}>Details</Link>
          </Button>
          <span className="text-xs text-muted-foreground">By User: {post.userId}</span>
        </div>
        {canDelete && (
          <div className="flex items-center">
            <Button onClick={deletePostHandler} variant="destructive">
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};