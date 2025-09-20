"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMonastery } from "@/service/monastery/monasteryService";
import { useAuthStore } from "@/store/userStore";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ✅ Zod Schema with transforms for numbers
const monasterySchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    establishedYear: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Invalid year")
        .refine((val) => Number(val) <= new Date().getFullYear(), "Year must be in the past"),
    address: z.string().min(5, "Address is required"),
    geoLatitude: z
        .string()
        .refine((val) => !isNaN(Number(val)), "Invalid latitude"),
    geoLongitude: z
        .string()
        .refine((val) => !isNaN(Number(val)), "Invalid longitude"),
    mainImageUrl: z.string().url("Must be a valid image URL"),
});

type MonasteryFormValues = z.infer<typeof monasterySchema>;

export default function CreateMonasteryPage() {
    const { token, user } = useAuthStore();
    const router = useRouter();

    const form = useForm<MonasteryFormValues>({
        resolver: zodResolver(monasterySchema),
        defaultValues: {
            name: "",
            description: "",
            establishedYear: "",
            address: "",
            geoLatitude: "",
            geoLongitude: "",
            mainImageUrl: "",
        },
    });

    const onSubmit = async (data: MonasteryFormValues) => {
        try {
            if (!token) {
                toast.error("Authentication required", {
                    description: "Please login before creating a monastery.",
                });
                return;
            }
            const cleanToken = token.replace(/^"(.*)"$/, "$1");

            // ✅ Convert string inputs to correct types
            const safeData = {
                ...data,
                establishedYear: Number(data.establishedYear),
                geoLatitude: Number(data.geoLatitude),
                geoLongitude: Number(data.geoLongitude),
            };

            console.log("Sending with token:", cleanToken);
            console.log("Payload:", safeData);

            const res = await createMonastery(safeData, cleanToken);

            toast.success("Success", {
                description: "Monastery created successfully!",
            });

            router.push(`/monastery/${res!.id}`);
            form.reset();
        } catch (error) {
            toast.error("Error", {
                description: "Failed to create monastery",
            });
        }
    };

    if (user?.role !== "admin") {
        return <div>ONLY ADMINS ARE ALLOWED TO PERFORM THIS TASK</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <h1 className="text-2xl font-semibold mb-6">Create a New Monastery</h1>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 rounded-xl border p-6 shadow-md"
                >
                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Rumtek Monastery" {...field} />
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
                                        placeholder="A large and historically significant monastery..."
                                        rows={4}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Established Year */}
                    <FormField
                        control={form.control}
                        name="establishedYear"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Established Year</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="1966" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Address */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Sikkim National Highway, Rumtek, East Sikkim..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Latitude + Longitude */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="geoLatitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Latitude</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.0001" placeholder="27.3285" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="geoLongitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Longitude</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.0001" placeholder="88.6095" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Image URL */}
                    <FormField
                        control={form.control}
                        name="mainImageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Main Image URL</FormLabel>
                                <FormControl>
                                    <Input
                                        type="url"
                                        placeholder="https://example.com/images/monastery.jpg"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full">
                        Create Monastery
                    </Button>
                </form>
            </Form>
        </div>
    );
}
