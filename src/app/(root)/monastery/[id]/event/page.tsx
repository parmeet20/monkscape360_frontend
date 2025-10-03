"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { config } from '@/lib/config';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { CalendarCheckIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createEvent } from "@/service/event/eventService";
import { useAuthStore } from "@/store/userStore";
import { Event } from "@/types";

// Validation schema
const formSchema = z
    .object({
        monasteryId: z.string().min(5),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        startDate: z.date().refine((date) => date > new Date(), {
            message: "Start date must be in the future.",
        }),
        endDate: z.date(),
        recurring: z.boolean(),
        status: z.enum(["pending", "confirmed", "cancelled"]),
        imageUrl: z.any().optional(), // For file input
        seats: z.number().min(1, "At least one seat is required").int(),
        ticketPrice: z.number().min(0, "Ticket price cannot be negative"),
    })
    .superRefine((data, ctx) => {
        if (data.endDate <= data.startDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End date must be after start date.",
                path: ["endDate"],
            });
        }
    });

type FormData = z.infer<typeof formSchema>;

export default function MyForm() {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuthStore();
    const router = useRouter();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            monasteryId: id,
            name: "",
            description: "",
            startDate: new Date(),
            endDate: new Date(),
            recurring: false,
            status: "confirmed",
            imageUrl: undefined,
            seats: 1,
            ticketPrice: 0,
        },
    });

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
        } catch (error) {
            throw new Error("Failed to upload image to Cloudinary");
        } finally {
            setUploading(false);
        }
    }

    async function onSubmit(values: FormData) {
        try {
            const eventData: Partial<Event> = {
                ...values,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
                monasteryId: id!,
            };

            const imageFile = values.imageUrl as unknown as File;
            if (imageFile instanceof File) {
                const imageUrl = await uploadToCloudinary(imageFile);
                eventData.imageUrl = imageUrl;
            }

            const res = await createEvent(eventData, cleanToken);
            toast.success("Event created successfully!");
            router.push(`/event/${res.id}`);
        } catch (error) {
            toast.error("Failed to create event");
            console.error(error);
        }
    }

    const handleDateSelect = (fieldName: "startDate" | "endDate", date: Date | undefined) => {
        if (date) {
            form.setValue(fieldName, date);
        }
    };

    const handleTimeChange = (
        fieldName: "startDate" | "endDate",
        type: "hour" | "minute" | "ampm",
        value: string
    ) => {
        const currentDate = form.getValues(fieldName) || new Date();
        const newDate = new Date(currentDate);

        if (type === "hour") {
            const hour = parseInt(value, 10);
            const isPM = currentDate.getHours() >= 12;
            newDate.setHours(isPM ? (hour === 12 ? 12 : hour + 12) : hour % 12);
        } else if (type === "minute") {
            newDate.setMinutes(parseInt(value, 10));
        } else if (type === "ampm") {
            const hours = newDate.getHours();
            if (value === "AM" && hours >= 12) {
                newDate.setHours(hours - 12);
            } else if (value === "PM" && hours < 12) {
                newDate.setHours(hours + 12);
            }
        }

        form.setValue(fieldName, newDate);
    };

    // Custom date-time picker (reusable)
    const DateTimePicker = ({
        fieldName,
        label,
        description,
    }: {
        fieldName: "startDate" | "endDate";
        label: string;
        description: string;
    }) => (
        <FormField
            control={form.control}
            name={fieldName}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>{label}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value
                                        ? format(field.value, "MM/dd/yyyy hh:mm aa")
                                        : "MM/DD/YYYY hh:mm aa"}
                                    <CalendarCheckIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <div className="sm:flex">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => handleDateSelect(fieldName, date)}
                                    initialFocus
                                />
                                <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                                    {/* Hours */}
                                    <ScrollArea className="w-64 sm:w-auto">
                                        <div className="flex sm:flex-col p-2">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                                <Button
                                                    key={hour}
                                                    size="icon"
                                                    variant={
                                                        field.value &&
                                                            (field.value.getHours() % 12 === hour % 12 ||
                                                                (field.value.getHours() % 12 === 0 && hour === 12))
                                                            ? "default"
                                                            : "ghost"
                                                    }
                                                    className="sm:w-full shrink-0 aspect-square"
                                                    onClick={() => handleTimeChange(fieldName, "hour", hour.toString())}
                                                >
                                                    {hour}
                                                </Button>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                                    </ScrollArea>

                                    {/* Minutes */}
                                    <ScrollArea className="w-64 sm:w-auto">
                                        <div className="flex sm:flex-col p-2">
                                            {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                                <Button
                                                    key={minute}
                                                    size="icon"
                                                    variant={field.value?.getMinutes() === minute ? "default" : "ghost"}
                                                    className="sm:w-full shrink-0 aspect-square"
                                                    onClick={() => handleTimeChange(fieldName, "minute", minute.toString())}
                                                >
                                                    {minute.toString().padStart(2, "0")}
                                                </Button>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                                    </ScrollArea>

                                    {/* AM/PM */}
                                    <ScrollArea>
                                        <div className="flex sm:flex-col p-2">
                                            {["AM", "PM"].map((ampm) => (
                                                <Button
                                                    key={ampm}
                                                    size="icon"
                                                    variant={
                                                        field.value &&
                                                            ((ampm === "AM" && field.value.getHours() < 12) ||
                                                                (ampm === "PM" && field.value.getHours() >= 12))
                                                            ? "default"
                                                            : "ghost"
                                                    }
                                                    className="sm:w-full shrink-0 aspect-square"
                                                    onClick={() => handleTimeChange(fieldName, "ampm", ampm)}
                                                >
                                                    {ampm}
                                                </Button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    if (!token) return <div className="text-center text-red-500">Unauthorized</div>;

    const cleanToken = token.replace(/^"(.*)"$/, "$1");

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Create New Event
            </h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Losar Festival Celebration" {...field} />
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
                                        placeholder="Annual Tibetan New Year festival with traditional rituals and cultural performances."
                                        className="resize-none"
                                        {...field}
                                        rows={6}
                                    />
                                </FormControl>
                                <FormDescription>Enter event description</FormDescription>
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
                                                setPreviewImage(URL.createObjectURL(file));
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
                                            alt="Event image preview"
                                            className="w-full h-48 object-cover rounded-md"
                                            onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                                        />
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Start Date Picker */}
                    <DateTimePicker
                        fieldName="startDate"
                        label="Start Date"
                        description="Start date must be in the future."
                    />

                    {/* End Date Picker */}
                    <DateTimePicker
                        fieldName="endDate"
                        label="End Date"
                        description="End date must be after the start date."
                    />

                    {/* Seats */}
                    <FormField
                        control={form.control}
                        name="seats"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number of Seats</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="50"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>Enter the total number of available seats</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Ticket Price */}
                    <FormField
                        control={form.control}
                        name="ticketPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ticket Price ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="25.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>Enter the ticket price in dollars (0 for free events)</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Recurring */}
                    <FormField
                        control={form.control}
                        name="recurring"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Recurring</FormLabel>
                                    <FormDescription>Enable if this is a recurring event</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
                    <Button type="submit" className="w-full" disabled={uploading}>
                        {uploading ? "Uploading..." : "Create Event"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}