# Full Stack Movie Application

A modern full-stack movie application built with Next.js, TypeScript, Tailwind CSS, and HeroUI. This application demonstrates a complete implementation of movie browsing, detail viewing, recommendations, and adding new movies with local persistence.

## Features

### Frontend
- **Movie List View**: Browse movies with pagination support
- **Add Movie Form**: Add new movies to your collection
- **Movie Detail View**: View detailed information about each movie
- **Recommendations**: Get 3 random movie recommendations that refresh on demand

### Backend
- **Movies API**: Fetch paginated movie lists from JSONFakery
- **Recommendations API**: Fetch random movie recommendations
- **Local Persistence**: Store newly added movies locally in JSON format
- **Unified Data Source**: Merge external API data with locally stored movies

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: HeroUI (formerly NextUI)
- **API**: Next.js API Routes
- **Data Persistence**: File-based JSON storage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fullstack-task
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
fullstack-task/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── movies/              # Movies endpoint (GET, POST)
│   │   └── recommendations/     # Recommendations endpoint
│   ├── movies/                  # Movie pages
│   │   └── [id]/               # Dynamic movie detail page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── MovieCard.tsx           # Movie card component
│   ├── AddMovieForm.tsx        # Form to add new movies
│   ├── Recommendations.tsx     # Recommendations section
│   └── Pagination.tsx          # Pagination component
├── lib/                        # Utility functions
│   └── storage.ts             # Local storage utilities
├── types/                      # TypeScript type definitions
│   └── movie.ts               # Movie-related types
└── data/                       # Local data storage (auto-generated)
    └── movies.json            # Locally added movies
```

## API Endpoints

### GET /api/movies
Fetches a paginated list of movies.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "movies": [...],
  "page": 1,
  "totalPages": 5,
  "totalMovies": 50
}
```

### POST /api/movies
Adds a new movie to local storage.

**Request Body:**
```json
{
  "title": "Movie Title",
  "genre": "Genre",
  "director": "Director Name",
  "year": 2024,
  "rating": 8.5,
  "description": "Movie description"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Movie Title",
  ...
}
```

### GET /api/recommendations
Fetches 3 random movie recommendations.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Movie 1",
    ...
  },
  ...
]
```

## Best Practices Implemented

### Code Quality
- **TypeScript**: Full type safety across the application
- **Component Organization**: Clean separation of concerns
- **Reusable Components**: Modular component design
- **Error Handling**: Proper error handling in API routes and components

### Performance
- **Client-Side Rendering**: Used where appropriate for interactive components
- **Efficient State Management**: React hooks for local state
- **Optimized Re-renders**: Proper use of useEffect dependencies

### User Experience
- **Loading States**: Spinner indicators during data fetching
- **Responsive Design**: Mobile-first responsive layout
- **Clear Navigation**: Intuitive routing and back navigation
- **Form Validation**: Built-in HTML5 validation

### Data Management
- **File-Based Storage**: Simple local persistence for MVP
- **Data Merging**: Seamless integration of external and local data
- **Automatic ID Generation**: Safe ID assignment for new movies

## Deployment Strategy

### Development
The application runs on a local development server with hot reload:
```bash
npm run dev
```

### Production Build
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Deployment Options

#### Vercel (Recommended)
Vercel is the easiest deployment option for Next.js applications:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to deploy

**Considerations:**
- Automatic HTTPS
- Global CDN
- Serverless functions for API routes
- Zero configuration required
- Free tier available

**Limitations:**
- File-based storage won't persist between deployments
- Need to migrate to a database for production

#### Alternative Platforms

**Netlify**
- Similar to Vercel
- Good Next.js support
- Free tier available

**Docker + Cloud Provider (AWS, GCP, Azure)**
- More control over infrastructure
- Better for file-based persistence
- Requires more configuration

**Railway/Render**
- Simple deployment process
- Good for full-stack apps
- Persistent file storage available

## Scaling Considerations

### Current Architecture Limitations

1. **File-Based Storage**
   - Not suitable for production at scale
   - No concurrent write protection
   - Limited to single server instance

2. **In-Memory Data Merging**
   - All data loaded into memory
   - Not efficient for large datasets

### Recommended Improvements for Scale

#### Database Migration
Replace file storage with a proper database:

**PostgreSQL** (Recommended for production)
- Use Prisma ORM for type-safe database access
- Better query performance
- ACID compliance
- Horizontal scaling with read replicas

**MongoDB**
- Flexible schema for movie data
- Good for rapid development
- Easy horizontal scaling

#### Caching Layer
Add Redis for performance:
- Cache API responses
- Reduce database load
- Store session data
- Rate limiting

#### API Optimization
- Implement proper pagination at the database level
- Add search and filtering capabilities
- Use database indexes for common queries
- Implement API rate limiting

#### Frontend Optimization
- Implement virtual scrolling for large lists
- Add image optimization with Next.js Image component
- Use SWR or React Query for data fetching and caching
- Implement infinite scroll as alternative to pagination

#### Infrastructure
- Use CDN for static assets
- Implement load balancing for multiple instances
- Set up monitoring and logging (Datadog, Sentry)
- Implement CI/CD pipeline
- Add automated testing (Jest, Playwright)

### Estimated Traffic Handling

**Current Setup:**
- ~100 concurrent users
- ~1,000 movies in the system
- Basic read/write operations

**After Scaling Improvements:**
- ~10,000+ concurrent users
- Millions of movies
- Advanced search and filtering
- Real-time recommendations

## Environment Variables

Create a `.env.local` file for local development:

```env
# Add any environment variables here
# Example:
# DATABASE_URL=postgresql://...
# REDIS_URL=redis://...
```

## Development Workflow

1. Create a new branch for features:
```bash
git checkout -b feature/your-feature
```

2. Make changes and test locally

3. Build and verify:
```bash
npm run build
npm start
```

4. Commit and push:
```bash
git add .
git commit -m "Description of changes"
git push origin feature/your-feature
```

5. Create a pull request

## Testing

Currently, the application doesn't include automated tests. For production, consider adding:

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Testing API endpoints
- **E2E Tests**: Playwright or Cypress
- **Type Checking**: `npm run type-check`
- **Linting**: `npm run lint`

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill the process or use a different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
