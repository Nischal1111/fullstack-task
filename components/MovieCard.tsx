"use client";

import { useRouter } from "next/navigation";
import { Movie } from "@/types/movie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </CardTitle>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="default" className="text-xs">
            {movie.genre}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {movie.year}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Director:</span> {movie.director}
          </p>
          {movie.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold">{movie.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">/10</span>
            </div>
          )}
        </div>
        <Button
          className="w-full mt-2"
          onClick={() => router.push(`/movies/${movie.id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
