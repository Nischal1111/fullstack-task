export interface Movie {
  id: number;
  title: string;
  genre: string;
  director: string;
  year: number;
  rating?: number;
  description?: string;
  poster?: string;
}

export interface MoviesResponse {
  movies: Movie[];
  page: number;
  totalPages: number;
  totalMovies: number;
}
