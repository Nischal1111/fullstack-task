import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-divider overflow-hidden group">
      <CardHeader className="flex flex-col items-start gap-3 p-5">
        <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Chip 
            size="sm" 
            color="primary" 
            variant="flat"
            className="font-medium"
          >
            {movie.genre}
          </Chip>
          <Chip 
            size="sm" 
            color="secondary" 
            variant="flat"
            className="font-medium"
          >
            {movie.year}
          </Chip>
        </div>
      </CardHeader>
      
      <CardBody className="gap-4 p-5 pt-0">
        <div className="space-y-2">
          <p className="text-sm text-foreground/70">
            <span className="font-semibold text-foreground">Director:</span> {movie.director}
          </p>
          {movie.rating && (
            <p className="text-sm text-foreground/70">
              <span className="font-semibold text-foreground">Rating:</span>{" "}
              <span className="text-warning font-medium">★ {movie.rating.toFixed(1)}/10</span>
            </p>
          )}
        </div>
        <Button
          color="primary"
          variant="solid"
          className="w-full mt-2 font-semibold"
          onPress={() => router.push(`/movies/${movie.id}`)}
        >
          View Details
        </Button>
      </CardBody>
    </Card>
  );
}
