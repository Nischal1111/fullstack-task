import { NextResponse } from "next/server";
import { Movie } from "@/types/movie";

const RANDOM_MOVIE_API = "https://jsonfakery.com/movies/random/{COUNT}";

export async function GET() {
  try {
    const url = RANDOM_MOVIE_API.replace("{COUNT}", "3");
    const response = await fetch(url);
    const recommendations: Movie[] = await response.json();

    return NextResponse.json(recommendations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
