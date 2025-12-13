import { NextRequest, NextResponse } from "next/server";
import { getLocalMovies, addLocalMovie } from "@/lib/storage";
import { Movie, MoviesResponse } from "@/types/movie";

const JSONFAKERY_API = "https://jsonfakery.com/movies/paginated";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const response = await fetch(JSONFAKERY_API);
    const externalMovies = await response.json();

    const localMovies = await getLocalMovies();
    const allMovies = [...externalMovies, ...localMovies];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMovies = allMovies.slice(startIndex, endIndex);

    const result: MoviesResponse = {
      movies: paginatedMovies,
      page,
      totalPages: Math.ceil(allMovies.length / limit),
      totalMovies: allMovies.length,
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newMovie: Movie = {
      id: 0,
      title: body.title,
      genre: body.genre,
      director: body.director,
      year: body.year,
      rating: body.rating,
      description: body.description,
      poster: body.poster,
    };

    const savedMovie = await addLocalMovie(newMovie);
    return NextResponse.json(savedMovie, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add movie" },
      { status: 500 }
    );
  }
}
