'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/service/event/eventService";
import { Event } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const EventDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const data = await getEventById(id as string);
        setEvent(data);
      } catch (error) {
        toast.error("Failed to load event details", {
          description: "Something went wrong",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  if (!event) {
    return <div className="text-center text-gray-600 py-10">Event not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card className="shadow-md rounded-xl border">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{event.name}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {event.description && (
            <p>{event.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><span className="font-medium">Status:</span> {event.status}</p>
            <p><span className="font-medium">Recurring:</span> {event.recurring ? "Yes" : "No"}</p>
            {event.startDate && (
              <p><span className="font-medium">Start Date:</span> {new Date(event.startDate).toLocaleDateString()}</p>
            )}
            {event.endDate && (
              <p><span className="font-medium">End Date:</span> {new Date(event.endDate).toLocaleDateString()}</p>
            )}
            <p><span className="font-medium">Created At:</span> {new Date(event.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={() => router.push(`/monastery/${event.monasteryId}`)}>
            View Monastery
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EventDetailPage;
