"use client";

import React, { useEffect, useState } from "react";
import { getEvents } from "@/service/event/eventService";
import { Event } from "@/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/userStore";
import EventCard from "@/components/manual/card/EventCard";
import { toast } from "sonner";

const EventPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">No events available right now.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-12 px-6">
      <h1 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
        Monastery Events
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            canDelete={user?.role === "admin"}
            onBook={() => fetchEvents()}
            onView={(id) => router.push(`/event/${id}`)}
            onDelete={() => setEvents((prev) => prev.filter((e) => e.id !== event.id))}
          />
        ))}
      </div>
    </div>
  );
};

export default EventPage;