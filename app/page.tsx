"use client";

import { useState, useEffect } from "react";
import { Button, Spinner } from "@heroui/react";
import { MoviesResponse, Movie } from "@/types/movie";
import MovieCard from "@/components/MovieCard";
import AddMovieForm from "@/components/AddMovieForm";
import Recommendations from "@/components/Recommendations";
import Pagination from "@/components/Pagination";

export default function Home() {
  const [moviesData, setMoviesData] = useState<MoviesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchMovies = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/movies?page=${page}&limit=10`);
      const data = await response.json();
      setMoviesData(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMovieAdded = () => {
    setShowAddForm(false);
    fetchMovies(currentPage);
  };

  if (loading && !moviesData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Movie Collection</h1>
        <Button
          color="primary"
          onPress={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "Add New Movie"}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <AddMovieForm onMovieAdded={handleMovieAdded} />
        </div>
      )}

      <Recommendations />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">All Movies</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moviesData?.movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {moviesData && (
              <Pagination
                currentPage={currentPage}
                totalPages={moviesData.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
