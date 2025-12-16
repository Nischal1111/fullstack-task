"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
} from "@heroui/react";
import { Movie } from "@/types/movie";

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
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto shadow-xl">
            <CardBody className="p-8 text-center">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-xl font-semibold mb-6 text-foreground">Movie not found</p>
              <Button
                color="primary"
                size="lg"
                onPress={() => router.push("/")}
                className="w-full"
              >
                ← Back to Movies
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <div className="container mx-auto px-4 py-8">
        <Button
          color="default"
          variant="light"
          className="mb-6"
          onPress={() => router.push("/")}
          startContent={<span>←</span>}
        >
          Back to Movies
        </Button>

        <Card className="max-w-5xl mx-auto shadow-2xl overflow-hidden">
          <CardHeader className="flex flex-col items-start gap-4 p-8 bg-background/95 backdrop-blur-sm">
            <div className="w-full">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {movie.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Chip 
                  color="primary" 
                  variant="flat"
                  size="lg"
                  className="font-semibold"
                >
                  {movie.genre}
                </Chip>
                <Chip 
                  color="secondary" 
                  variant="flat"
                  size="lg"
                  className="font-semibold"
                >
                  {movie.year}
                </Chip>
                {movie.rating && (
                  <Chip 
                    color="warning" 
                    variant="flat"
                    size="lg"
                    className="font-semibold"
                  >
                    ⭐ {movie.rating.toFixed(1)}/10
                  </Chip>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardBody className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Director</h3>
                <p className="text-foreground/80 text-lg">{movie.director}</p>
              </div>
              
              {movie.year && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Release Year</h3>
                  <p className="text-foreground/80 text-lg">{movie.year}</p>
                </div>
              )}
            </div>

            {movie.description && (
              <div className="space-y-2 pt-4 border-t border-divider">
                <h3 className="text-lg font-semibold text-primary">Description</h3>
                <p className="text-foreground/80 leading-relaxed text-base">
                  {movie.description}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
