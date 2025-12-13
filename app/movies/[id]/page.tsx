"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Spinner, Chip } from "@heroui/react";
import { Movie } from "@/types/movie";

export default function MovieDetail() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`/api/movies?page=1&limit=1000`);
        const data = await response.json();
        const foundMovie = data.movies.find(
          (m: Movie) => m.id === parseInt(params.id as string)
        );
        setMovie(foundMovie || null);
      } catch (error) {
        console.error("Error fetching movie:", error);
      }
      setLoading(false);
    };

    fetchMovie();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-center text-xl">Movie not found</p>
            <Button
              color="primary"
              className="mt-4"
              onPress={() => router.push("/")}
            >
              Back to Home
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        color="default"
        variant="light"
        className="mb-4"
        onPress={() => router.push("/")}
      >
        ← Back to Movies
      </Button>

      <Card className="max-w-4xl">
        <CardHeader className="flex flex-col items-start gap-2 p-6">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <div className="flex gap-2">
            <Chip color="primary">{movie.genre}</Chip>
            <Chip color="secondary">{movie.year}</Chip>
            {movie.rating && <Chip color="warning">★ {movie.rating}/10</Chip>}
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Director</h3>
              <p className="text-gray-700">{movie.director}</p>
            </div>

            {movie.description && (
              <div>
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-gray-700">{movie.description}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
