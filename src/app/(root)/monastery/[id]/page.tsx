"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMonasteryById } from "@/service/monastery/monasteryService";
import { Monastery } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/userStore";
import Link from "next/link";
import { Lens } from "@/components/ui/lens";

// Dynamically import LeafletMap (to avoid SSR issues)
const LeafletMap = dynamic(() => import("@/components/ui/LeafletMap"), {
  ssr: false,
});

const MonasteryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [monastery, setMonastery] = useState<Monastery | null>(null);
  const [loading, setLoading] = useState(true);
  const [hovering, setHovering] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const data = await getMonasteryById(id);
        setMonastery(data);
      } catch (err) {
        console.error("Failed to fetch monastery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  if (!monastery) {
    return <div className="text-center text-red-600">Monastery not found</div>;
  }

  return (
    <div className="pt-2 border rounded-full">
      <div className="max-w-4xl p-6 mx-auto py-10 space-y-6">
        <Card className="rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              {monastery.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Image */}
            <div className="w-full relative rounded-2xl overflow-hidden mx-auto bg-gradient-to-r from-[#1D2235] to-[#121318] p-4">
              <Lens hovering={hovering} setHovering={setHovering}>
                <img
                  src={monastery.mainImageUrl}
                  alt={monastery.name}
                  className="rounded-2xl object-cover w-full h-80"
                />
              </Lens>
            </div>


            {/* Info */}
            <p className="text-lg text-muted-foreground">
              {monastery.description}
            </p>
            <p>
              <strong>Established Year:</strong> {monastery.establishedYear}
            </p>
            <p>
              <strong>Address:</strong> {monastery.address}
            </p>
            {user?.role === "admin" ? <Button><Link href={`/monastery/${monastery.id}/event`}>Create Event</Link></Button> : null}
            {/* Map */}
            <div className="h-96">
              <LeafletMap
                latitude={monastery.geoLatitude}
                longitude={monastery.geoLongitude}
                name={monastery.name}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonasteryDetailPage;
