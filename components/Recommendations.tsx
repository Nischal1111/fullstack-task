"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Spinner } from "@heroui/react";
import { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/recommendations");
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recommended for You</h2>
        <Button
          color="secondary"
          variant="flat"
          onPress={fetchRecommendations}
          isLoading={loading}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
