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
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  onDelete?: () => void; // <- Add this
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user, token } = useAuthStore();

  const deletePostHandler = async () => {
    try {
      const cleanToken = token!.replace(/^"(.*)"$/, "$1");
      await deletePost(post.id, cleanToken!);
      toast.success("Post deleted successfully");

      // Notify parent to remove this post
      onDelete?.(); // Safe call if provided
    } catch (error) {
      console.log(error);
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
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {post.description}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">By User: {post.userId}</span>
        {(user?.role === "admin" || user?.id === post.userId) && (
          <div className="flex items-center">
            <Button onClick={deletePostHandler} variant={"destructive"}>
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
