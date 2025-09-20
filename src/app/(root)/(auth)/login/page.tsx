"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Lock } from "lucide-react";
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
import Link from "next/link";
import { loginUser } from "@/service/user/registerUser";
import { UserLoginRequest } from "@/types";

// Zod schema aligned with UserLoginRequest
const loginSchema = z.object({
  usernameOrEmail: z.string().min(3, "Enter a valid username or email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<UserLoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  async function onSubmit(values: UserLoginRequest) {
    try {
      setLoading(true);
      await loginUser(values);
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-24">
      <div className="w-full max-w-md mx-auto space-y-6 backdrop-blur-md bg-white/10 dark:bg-black/20 p-8 rounded-2xl shadow-lg border border-white/20">
        <h1 className="text-3xl font-bold text-center">Sign In</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username or Email */}
            <FormField
              control={form.control}
              name="usernameOrEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        className="pl-10"
                        placeholder="yourname or you@example.com"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input type="password" className="pl-10" {...field} placeholder="********" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
            </Button>
          </form>
        </Form>

        {/* Redirect link */}
        <p className="text-center text-sm text-gray-500">
          New user?{" "}
          <Link href="/register" className="text-pink-500 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
