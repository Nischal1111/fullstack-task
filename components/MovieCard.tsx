import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-col items-start gap-2">
        <h3 className="text-xl font-bold">{movie.title}</h3>
        <div className="flex gap-2">
          <Chip size="sm" color="primary">{movie.genre}</Chip>
          <Chip size="sm" color="secondary">{movie.year}</Chip>
        </div>
      </CardHeader>
      <CardBody className="gap-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Director:</span> {movie.director}
        </p>
        {movie.rating && (
          <p className="text-sm">
            <span className="font-semibold">Rating:</span> ★ {movie.rating}/10
          </p>
        )}
        <Button
          color="primary"
          variant="flat"
          onPress={() => router.push(`/movies/${movie.id}`)}
        >
          View Details
        </Button>
      </CardBody>
    </Card>
  );
}
