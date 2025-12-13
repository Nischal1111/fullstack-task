import { Movie } from "@/types/movie";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "movies.json");

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function getLocalMovies(): Promise<Movie[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function addLocalMovie(movie: Movie): Promise<Movie> {
  await ensureDataDir();
  const movies = await getLocalMovies();
  const newMovie = {
    ...movie,
    id: movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1,
  };
  movies.push(newMovie);
  await fs.writeFile(DATA_FILE, JSON.stringify(movies, null, 2));
  return newMovie;
}
