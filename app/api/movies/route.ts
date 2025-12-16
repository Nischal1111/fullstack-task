import { NextRequest, NextResponse } from "next/server";
import { getLocalMovies, addLocalMovie } from "@/lib/storage";
import { Movie, MoviesResponse } from "@/types/movie";

const JSONFAKERY_API = "https://jsonfakery.com/movies/paginated";

function inferGenreFromText(title: string, overview: string): string {
  const text = `${title} ${overview}`.toLowerCase();

  if (text.match(/horror|slasher|haunt|posses|demon|ghost|zombie/)) {
    return "Horror";
  }
  if (text.match(/romance|romantic|love story|relationship|wedding/)) {
    return "Romance";
  }
  if (text.match(/sci[- ]?fi|science fiction|space|alien|galaxy|future/)) {
    return "Sci-Fi";
  }
  if (text.match(/crime|gang|mafia|cartel|heist|detective|murder/)) {
    return "Crime";
  }
  if (text.match(/comedy|funny|hilarious|sitcom/)) {
    return "Comedy";
  }
  if (text.match(/animation|animated|cartoon|kids|family/)) {
    return "Family";
  }
  if (text.match(/war|soldier|battlefield|army|military/)) {
    return "War";
  }
  if (text.match(/documentary|true story|based on a true story/)) {
    return "Documentary";
  }

  return "Drama";
}

function mapExternalToMovie(external: any): Movie {
  const yearString =
    typeof external.release_date === "string"
      ? external.release_date.slice(-4)
      : undefined;

  const rawTitle = external.original_title ?? external.title ?? "Untitled";
  const rawOverview =
    typeof external.overview === "string" ? external.overview : "";

  return {
    id: external.movie_id ?? external.id ?? 0,
    title: rawTitle,
    genre: inferGenreFromText(rawTitle, rawOverview),
    director: external.casts?.[0]?.name ?? "Unknown",
    year: Number.isFinite(parseInt(yearString || "0", 10))
      ? parseInt(yearString as string, 10)
      : 0,
    rating:
      typeof external.vote_average === "number"
        ? external.vote_average
        : undefined,
    description: rawOverview || undefined,
    poster:
      typeof external.poster_path === "string"
        ? external.poster_path
        : undefined,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const response = await fetch(JSONFAKERY_API, {
      // Ensure this runs on the server only and can be cached if desired
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const externalPayload = await response.json();
    const externalMoviesRaw: any[] = Array.isArray(externalPayload?.data)
      ? externalPayload.data
      : [];
    const externalMovies: Movie[] = externalMoviesRaw.map(mapExternalToMovie);

    const localMovies = await getLocalMovies();
    const allMovies: Movie[] = [...externalMovies, ...localMovies];

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
    console.error("Error in /api/movies:", error);
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
