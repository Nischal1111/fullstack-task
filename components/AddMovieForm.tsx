"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Input, Button } from "@heroui/react";

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
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Add New Movie</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            placeholder="Enter movie title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Genre"
            placeholder="Enter genre"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            required
          />
          <Input
            label="Director"
            placeholder="Enter director name"
            value={formData.director}
            onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            required
          />
          <Input
            label="Year"
            type="number"
            placeholder="Enter release year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            required
          />
          <Input
            label="Rating (optional)"
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="Enter rating (0-10)"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          />
          <Input
            label="Description (optional)"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
            className="w-full"
          >
            Add Movie
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
