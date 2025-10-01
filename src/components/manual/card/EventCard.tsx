"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Info, Trash2 } from "lucide-react";
import { Event } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/service/event/eventService";
import { useAuthStore } from "@/store/userStore";
import { toast } from "sonner";

interface EventCardProps {
    event: Event;
    onView?: (id: string) => void;
    onDelete?: () => void;
    canDelete?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onView, onDelete, canDelete }) => {
    const { token } = useAuthStore();
    const formattedStart = event.startDate ? format(new Date(event.startDate), "PPP") : "N/A";
    const formattedEnd = event.endDate ? format(new Date(event.endDate), "PPP") : "N/A";

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
                <p className="text-sm line-clamp-3">{event.description ?? "No description available."}</p>
                <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4" />
                    <span>{formattedStart}</span>
                    {event.endDate && <span> → {formattedEnd}</span>}
                </div>
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
                {canDelete && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={deleteEventHandler}
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default EventCard;