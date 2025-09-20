"use client";

import { useAuthStore } from "@/store/userStore"; // adjust import path
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Calendar, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">No user logged in</p>
      </div>
    );
  }

  const firstLetter = user.username.charAt(0).toUpperCase();

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br px-4">
      <Card className="w-full max-w-lg backdrop-blur-md border  shadow-2xl rounded-2xl">
        <CardHeader className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <Avatar className="h-20 w-20 text-3xl font-bold shadow-lg">
            <AvatarFallback>{firstLetter}</AvatarFallback>
          </Avatar>

          {/* Username */}
          <CardTitle className="text-2xl font-bold">
            {user.username}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          {/* Full details */}
          <div className="flex items-center justify-center gap-3">
            <Mail className="h-5 w-5 text-pink-400" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Calendar className="h-5 w-5 text-pink-400" />
            <span>
              Joined on {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
