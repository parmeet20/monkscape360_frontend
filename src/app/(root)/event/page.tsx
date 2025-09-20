"use client";

import React, { useEffect, useState } from "react";
import EventCard from "@/components/manual/card/EventCard";
import { Event } from "@/types";
import { getEvents } from "@/service/event/eventService"; // adjust import path
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const EventPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
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
      <h1 className="text-3xl font-bold text-center mb-10">Monastery Events</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onView={(id) => router.push(`/event/${id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default EventPage;
