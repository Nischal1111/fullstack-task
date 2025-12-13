# API Documentation

This document provides detailed information about the API endpoints available in the Movie Application.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Endpoints

### Movies

#### GET /api/movies

Retrieves a paginated list of movies from both external API and local storage.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number to retrieve |
| limit | number | No | 10 | Number of items per page |

**Request Example:**

```bash
curl http://localhost:3000/api/movies?page=1&limit=10
```

**Response:**

```json
{
  "movies": [
    {
      "id": 1,
      "title": "The Shawshank Redemption",
      "genre": "Drama",
      "director": "Frank Darabont",
      "year": 1994,
      "rating": 9.3,
      "description": "Two imprisoned men bond over years...",
      "poster": "https://example.com/poster.jpg"
    }
  ],
  "page": 1,
  "totalPages": 5,
  "totalMovies": 50
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

#### POST /api/movies

Adds a new movie to local storage.

**Request Body:**

```json
{
  "title": "Inception",
  "genre": "Sci-Fi",
  "director": "Christopher Nolan",
  "year": 2010,
  "rating": 8.8,
  "description": "A thief who steals corporate secrets...",
  "poster": "https://example.com/inception.jpg"
}
```

**Required Fields:**
- `title` (string)
- `genre` (string)
- `director` (string)
- `year` (number)

**Optional Fields:**
- `rating` (number, 0-10)
- `description` (string)
- `poster` (string, URL)

**Request Example:**

```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "genre": "Sci-Fi",
    "director": "Christopher Nolan",
    "year": 2010,
    "rating": 8.8,
    "description": "A thief who steals corporate secrets..."
  }'
```

**Response:**

```json
{
  "id": 101,
  "title": "Inception",
  "genre": "Sci-Fi",
  "director": "Christopher Nolan",
  "year": 2010,
  "rating": 8.8,
  "description": "A thief who steals corporate secrets..."
}
```

**Status Codes:**

- `201 Created` - Movie successfully added
- `400 Bad Request` - Invalid request body
- `500 Internal Server Error` - Server error

---

### Recommendations

#### GET /api/recommendations

Fetches 3 random movie recommendations from the external API.

**Request Example:**

```bash
curl http://localhost:3000/api/recommendations
```

**Response:**

```json
[
  {
    "id": 42,
    "title": "The Dark Knight",
    "genre": "Action",
    "director": "Christopher Nolan",
    "year": 2008,
    "rating": 9.0
  },
  {
    "id": 87,
    "title": "Pulp Fiction",
    "genre": "Crime",
    "director": "Quentin Tarantino",
    "year": 1994,
    "rating": 8.9
  },
  {
    "id": 23,
    "title": "Forrest Gump",
    "genre": "Drama",
    "director": "Robert Zemeckis",
    "year": 1994,
    "rating": 8.8
  }
]
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

## Data Models

### Movie Object

```typescript
interface Movie {
  id: number;              // Unique identifier
  title: string;           // Movie title
  genre: string;           // Movie genre
  director: string;        // Director name
  year: number;            // Release year
  rating?: number;         // Rating out of 10 (optional)
  description?: string;    // Movie description (optional)
  poster?: string;         // Poster URL (optional)
}
```

### Movies Response Object

```typescript
interface MoviesResponse {
  movies: Movie[];         // Array of movie objects
  page: number;           // Current page number
  totalPages: number;     // Total number of pages
  totalMovies: number;    // Total number of movies
}
```

---

## External APIs

The application integrates with JSONFakery API:

### List Movies
- **URL**: `https://jsonfakery.com/movies/paginated`
- **Method**: GET
- **Description**: Returns a paginated list of movies

### Random Movies
- **URL**: `https://jsonfakery.com/movies/random/{COUNT}`
- **Method**: GET
- **Description**: Returns random movies (replace {COUNT} with desired number)

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

### Common Errors

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch movies"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to add movie"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch recommendations"
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production deployment, consider:

- Implementing rate limiting per IP address
- Using Redis for distributed rate limiting
- Setting reasonable limits (e.g., 100 requests per minute)

---

## Authentication

The current implementation does not include authentication. For production:

1. Add JWT or session-based authentication
2. Protect POST endpoints with authentication
3. Implement user-specific movie collections
4. Add role-based access control

Example with JWT:

```typescript
// Protected endpoint example
export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify token and proceed...
}
```

---

## CORS

For production deployments with separate frontend:

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-frontend.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};
```

---

## Caching

Consider implementing caching for better performance:

```typescript
// Example with Next.js cache
export async function GET(request: NextRequest) {
  const response = await fetch(JSONFAKERY_API, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  // ...
}
```

---

## Testing API Endpoints

### Using curl

```bash
# Get movies
curl http://localhost:3000/api/movies

# Get page 2
curl http://localhost:3000/api/movies?page=2

# Add movie
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","genre":"Action","director":"John Doe","year":2024}'

# Get recommendations
curl http://localhost:3000/api/recommendations
```

### Using JavaScript/fetch

```javascript
// Get movies
const response = await fetch('/api/movies?page=1&limit=10');
const data = await response.json();

// Add movie
const newMovie = await fetch('/api/movies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Movie',
    genre: 'Drama',
    director: 'Jane Smith',
    year: 2024
  })
});

// Get recommendations
const recommendations = await fetch('/api/recommendations');
const movies = await recommendations.json();
```

---

## Future Enhancements

1. **Search Endpoint**
   - `GET /api/movies/search?q=query`
   - Search by title, director, or genre

2. **Filter Endpoint**
   - `GET /api/movies?genre=Action&year=2020`
   - Filter by various criteria

3. **Individual Movie Endpoint**
   - `GET /api/movies/[id]`
   - Get single movie by ID

4. **Update Movie**
   - `PUT /api/movies/[id]`
   - Update existing movie

5. **Delete Movie**
   - `DELETE /api/movies/[id]`
   - Remove movie from collection

6. **User Ratings**
   - `POST /api/movies/[id]/rate`
   - Allow users to rate movies

7. **Comments**
   - `GET/POST /api/movies/[id]/comments`
   - Add commenting functionality
