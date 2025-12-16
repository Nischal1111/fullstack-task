import { NextRequest, NextResponse } from "next/server";
import { getLocalMovies } from "@/lib/storage";
import { Movie } from "@/types/movie";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = parseInt(id, 10);
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    // Check local movies first (faster)
    const localMovies = await getLocalMovies();
    const localMovie = localMovies.find((m) => m.id === movieId);
    
    if (localMovie) {
      return NextResponse.json(localMovie);
    }

    // Use the same logic as the list endpoint - fetch and map all movies
    // then search through them. This ensures consistency.
    try {
      const response = await fetch(JSONFAKERY_API, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }

      const externalPayload = await response.json();
      const externalMoviesRaw: any[] = Array.isArray(externalPayload?.data)
        ? externalPayload.data
        : [];
      
      // Map all movies from first page (same as list endpoint)
      const externalMovies: Movie[] = externalMoviesRaw.map(mapExternalToMovie);
      
      // Search in mapped movies
      let foundMovie = externalMovies.find((m) => m.id === movieId);
      
      if (foundMovie) {
        return NextResponse.json(foundMovie);
      }

      // If not found, search through additional pages
      const maxPages = Math.min(50, externalPayload.last_page || 50);
      
      for (let page = 2; page <= maxPages; page++) {
        try {
          const pageResponse = await fetch(`${JSONFAKERY_API}?page=${page}`, {
            cache: "no-store",
          });

          if (!pageResponse.ok) {
            break;
          }

          const pageData = await pageResponse.json();
          const pageMoviesRaw: any[] = Array.isArray(pageData?.data)
            ? pageData.data
            : [];

          if (pageMoviesRaw.length === 0) {
            break;
          }

          // Map and search
          const pageMovies: Movie[] = pageMoviesRaw.map(mapExternalToMovie);
          foundMovie = pageMovies.find((m) => m.id === movieId);

          if (foundMovie) {
            return NextResponse.json(foundMovie);
          }
        } catch (pageErr) {
          console.error(`Error fetching page ${page}:`, pageErr);
          continue;
        }
      }
    } catch (err) {
      console.error("Error searching external API:", err);
    }

    return NextResponse.json(
      { error: "Movie not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in /api/movies/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie" },
      { status: 500 }
    );
  }
}

