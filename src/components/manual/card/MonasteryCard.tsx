"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Monastery } from "@/types";

interface MonasteryCardProps {
  monastery: Monastery;
}

export default function MonasteryCard({ monastery }: MonasteryCardProps) {
  const router = useRouter();

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition rounded-xl p-0">
      {/* Image (flush with top) */}
      <div className="relative h-48 w-full">
        <img
          src={
            monastery.mainImageUrl ||
            "https://images.unsplash.com/photo-1609091838406-0489a1b3c28e?auto=format&fit=crop&w=800&q=80"
          }
          alt={monastery.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-lg font-semibold">
            {monastery.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <p className="text-sm line-clamp-3">
            {monastery.description || "No description available."}
          </p>
          {monastery.establishedYear && (
            <p className="mt-2 text-xs">
              Established in {monastery.establishedYear}
            </p>
          )}
        </CardContent>
      </div>

      {/* Footer */}
      <CardFooter className="px-4 pt-4">
        <Button
          variant="default"
          className="w-full rounded-full"
          onClick={() => router.push(`/monastery/${monastery.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
