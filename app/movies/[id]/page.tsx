"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Movie } from "@/types/movie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Film, Loader2, Star } from "lucide-react";

export default function MovieDetail() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Try the dedicated endpoint first
        let response = await fetch(`/api/movies/${params.id}`);

        if (response.ok) {
          const data = await response.json();
          setMovie(data);
          setLoading(false);
          return;
        }

        // If not found, try fetching from list endpoint with high limit
        // This ensures we get the same data that was shown in the list
        response = await fetch(`/api/movies?page=1&limit=1000`);

        if (response.ok) {
          const data = await response.json();
          const foundMovie = data.movies?.find(
            (m: Movie) => m.id === parseInt(params.id as string, 10)
          );

          if (foundMovie) {
            setMovie(foundMovie);
          } else {
            setMovie(null);
          }
        } else {
          setMovie(null);
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
        setMovie(null);
      }
      setLoading(false);
    };

    if (params.id) {
      fetchMovie();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto shadow-xl">
            <CardContent className="p-8 text-center">
              <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-6">Movie not found</p>
              <Button
                size="lg"
                onClick={() => router.push("/")}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Movies
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movies
        </Button>

        <Card className="max-w-5xl mx-auto shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
            <div className="w-full">
              <CardTitle className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {movie.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="text-sm px-3 py-1">
                  {movie.genre}
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {movie.year}
                </Badge>
                {movie.rating && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                    {movie.rating.toFixed(1)}/10
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Director</h3>
                <p className="text-muted-foreground text-lg">{movie.director}</p>
              </div>

              {movie.year && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Release Year</h3>
                  <p className="text-muted-foreground text-lg">{movie.year}</p>
                </div>
              )}
            </div>

            {movie.description && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-semibold text-primary">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {movie.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
