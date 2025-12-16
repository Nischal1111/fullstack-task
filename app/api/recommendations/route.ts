import { NextResponse } from "next/server";
import { Movie } from "@/types/movie";

const RANDOM_MOVIE_API = "https://jsonfakery.com/movies/random/{COUNT}";

function mapExternalToMovie(external: any): Movie {
  const yearString =
    typeof external.release_date === "string"
      ? external.release_date.slice(-4)
      : undefined;

  return {
    id: external.movie_id ?? external.id ?? 0,
    title: external.original_title ?? external.title ?? "Untitled",
    genre: "Unknown",
    director: external.casts?.[0]?.name ?? "Unknown",
    year: Number.isFinite(parseInt(yearString || "0", 10))
      ? parseInt(yearString as string, 10)
      : 0,
    rating:
      typeof external.vote_average === "number"
        ? external.vote_average
        : undefined,
    description:
      typeof external.overview === "string" ? external.overview : undefined,
    poster:
      typeof external.poster_path === "string"
        ? external.poster_path
        : undefined,
  };
}

export async function GET() {
  try {
    const url = RANDOM_MOVIE_API.replace("{COUNT}", "3");
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const raw = await response.json();
    const array: any[] = Array.isArray(raw) ? raw : [];
    const recommendations: Movie[] = array.map(mapExternalToMovie);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error in /api/recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
