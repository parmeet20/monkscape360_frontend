"use client";

import { useEffect, useState } from "react";
import { getMonasteries } from "@/service/monastery/monasteryService"; // adjust path
import { Monastery } from "@/types";
import MonasteryCard from "@/components/manual/card/MonasteryCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/userStore";

export default function AllMonastryPage() {
  const { user } = useAuthStore();
  const [monasteries, setMonasteries] = useState<Monastery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMonasteries();
        setMonasteries(data);
      } catch (err) {
        console.error("Error fetching monasteries", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading monasteries...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">
        {"Explore Sikkim’s Monasteries"}
      </h1>
      {user?.role === "admin" ? <Button className="my-4">
        <Link href={'/monastery/create'}>Create Monasteries</Link>
      </Button> : null}
      {monasteries.length === 0 ? (
        <p className="text-center text-gray-500">No monasteries found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {monasteries.map((monastery) => (
            <MonasteryCard key={monastery.id} monastery={monastery} />
          ))}
        </div>
      )}
    </main>
  );
}
