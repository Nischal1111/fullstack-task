"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface AddMovieFormProps {
  onMovieAdded: () => void;
}

export default function AddMovieForm({ onMovieAdded }: AddMovieFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    director: "",
    year: "",
    rating: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          rating: formData.rating ? parseFloat(formData.rating) : undefined,
        }),
      });

      if (response.ok) {
        setFormData({
          title: "",
          genre: "",
          director: "",
          year: "",
          rating: "",
          description: "",
        });
        onMovieAdded();
      }
    } catch (error) {
      console.error("Error adding movie:", error);
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="text-2xl md:text-3xl">Add New Movie</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter movie title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              placeholder="Enter genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="director">Director</Label>
            <Input
              id="director"
              placeholder="Enter director name"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              placeholder="Enter release year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating (optional)</Label>
            <Input
              id="rating"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="Enter rating (0-10)"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Adding..." : "Add Movie"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
