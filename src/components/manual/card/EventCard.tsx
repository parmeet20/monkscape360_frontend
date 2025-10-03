"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Armchair, CalendarDays, Info, Trash2, Loader2 } from "lucide-react";
import { Event } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/service/event/eventService";
import { createBooking } from "@/service/booking/bookingService";
import { useAuthStore } from "@/store/userStore";
import { toast } from "sonner";
import { useState } from "react";

interface EventCardProps {
    event: Event;
    onView?: (id: string) => void;
    onDelete?: () => void;
    onBook?: () => void; // Optional: allow parent to refresh on booking
    canDelete?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
    event,
    onView,
    onDelete,
    onBook,
    canDelete,
}) => {
    const { user, token } = useAuthStore();
    const [bookingLoading, setBookingLoading] = useState(false);

    const formattedStart = event.startDate
        ? format(new Date(event.startDate), "PPP")
        : "N/A";
    const formattedEnd = event.endDate
        ? format(new Date(event.endDate), "PPP")
        : "N/A";

    const deleteEventHandler = async () => {
        if (!token) {
            toast.error("Authentication required");
            return;
        }

        try {
            const cleanToken = token.replace(/^"(.*)"$/, "$1");
            await deleteEvent(event.id, cleanToken);
            toast.success("Event deleted successfully");
            onDelete?.();
        } catch (error) {
            console.error("Error deleting event:", error);
            toast.error("Event not deleted");
        }
    };

    const handleBooking = async () => {
        if (!user || !token) {
            toast.error("You must be logged in to book");
            return;
        }

        setBookingLoading(true);

        try {
            await createBooking(user.id, event.id, token);
            toast.success("Successfully booked the event!");
            onBook?.(); // Let parent refresh event list or state
        } catch (error) {
            console.error("Booking error:", error);
            toast.error("Booking failed", {
                description: "You might already be booked or the event is full.",
            });
        } finally {
            setBookingLoading(false);
        }
    };

    const isFull = event.seats === event.reserved;

    return (
        <Card className="w-full max-w-md backdrop-blur-lg shadow-lg rounded-2xl hover:shadow-2xl transition">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">{event.name}</CardTitle>
            </CardHeader>
            {event.imageUrl && (
                <img
                    src={event.imageUrl}
                    alt={`Image for ${event.name}`}
                    className="w-full h-[200px] object-cover rounded-md"
                    onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                />
            )}
            <CardContent className="space-y-2">
                <p className="text-sm line-clamp-3">
                    {event.description ?? "No description available."}
                </p>
                <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4" />
                    <span>{formattedStart}</span>
                    {event.endDate && <span> → {formattedEnd}</span>}
                </div>
                <div className="flex justify-between">
                    <Badge
                        variant={
                            event.status === "confirmed"
                                ? "default"
                                : event.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                        }
                    >
                        {event.status}
                    </Badge>
                    <Badge>
                        <Armchair />
                        {event.seats - event.reserved} seats
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView?.(event.id)}
                    className="flex items-center gap-2"
                >
                    <Info className="w-4 h-4" /> View Details
                </Button>

                {canDelete ? (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={deleteEventHandler}
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={handleBooking}
                        disabled={isFull || !token || bookingLoading}
                        className="flex items-center gap-2"
                    >
                        {bookingLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Booking...
                            </>
                        ) : token ? (
                            isFull ? "Fully Booked" : "Book Now"
                        ) : (
                            "Login to Book"
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default EventCard;
