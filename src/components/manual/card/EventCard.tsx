"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Info } from "lucide-react";
import { Event } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface EventCardProps {
    event: Event;
    onView?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onView }) => {
    const formattedStart = event.startDate ? format(new Date(event.startDate), "PPP") : "N/A";
    const formattedEnd = event.endDate ? format(new Date(event.endDate), "PPP") : "N/A";

    return (
        <Card className="w-full max-w-md backdrop-blur-lg  shadow-lg rounded-2xl hover:shadow-2xl transition">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">{event.name}</CardTitle>
            </CardHeader>
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
            <CardFooter>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView?.(event.id)}
                    className="flex items-center gap-2"
                >
                    <Info className="w-4 h-4" /> View Details
                </Button>
            </CardFooter>
        </Card>
    );
};

export default EventCard;
