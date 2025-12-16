"use client";

import { useState, useEffect } from "react";
import { MoviesResponse, Movie } from "@/types/movie";
import MovieCard from "@/components/MovieCard";
import AddMovieForm from "@/components/AddMovieForm";
import Recommendations from "@/components/Recommendations";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X } from "lucide-react";

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Movie Collection
            </h1>
            <Button
              size="lg"
              onClick={() => setShowAddForm(!showAddForm)}
              className="shadow-lg"
            >
              {showAddForm ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Movie
                </>
              )}
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-10">
            <AddMovieForm onMovieAdded={handleMovieAdded} />
          </div>
        )}

        <Recommendations />

        <div className="mt-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            All Movies
          </h2>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {moviesData?.movies && moviesData.movies.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {moviesData.movies.map((movie: Movie) => (
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
              ) : (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground">No movies found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
