# Deployment and Scaling Guide

This document outlines deployment strategies and scaling considerations for the Movie Application.

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Deployment Steps](#deployment-steps)
3. [Environment Configuration](#environment-configuration)
4. [Scaling Strategy](#scaling-strategy)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Deployment Options

### 1. Vercel (Recommended for Quick Start)

**Pros:**
- Zero configuration deployment
- Automatic HTTPS and CDN
- Serverless functions for API routes
- Excellent Next.js support
- Free tier available
- Automatic preview deployments

**Cons:**
- File-based storage doesn't persist
- Serverless function limitations (10-second timeout on hobby plan)
- Vendor lock-in

**Best For:** MVP, demos, small-scale applications

### 2. Docker + Cloud Platform (AWS/GCP/Azure)

**Pros:**
- Full control over infrastructure
- Persistent file storage
- Custom scaling rules
- No vendor lock-in
- Can run anywhere

**Cons:**
- Requires DevOps knowledge
- More expensive
- More setup time

**Best For:** Production applications, enterprise use

### 3. Railway/Render

**Pros:**
- Easy deployment
- Persistent file storage
- Database integration
- Affordable pricing
- Good for full-stack apps

**Cons:**
- Smaller ecosystem than major cloud providers
- Less control than Docker deployment

**Best For:** Small to medium production applications

---

## Deployment Steps

### Vercel Deployment

1. **Prepare the Application**
```bash
# Ensure build works locally
npm run build
npm start
```

2. **Install Vercel CLI**
```bash
npm install -g vercel
```

3. **Deploy**
```bash
vercel
```

4. **Configure Environment Variables** (if needed)
   - Go to Vercel Dashboard
   - Select your project
   - Navigate to Settings > Environment Variables
   - Add required variables

5. **Deploy to Production**
```bash
vercel --prod
```

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Update next.config.js**
```javascript
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
```

3. **Build Docker Image**
```bash
docker build -t movie-app .
```

4. **Run Container**
```bash
docker run -p 3000:3000 -v $(pwd)/data:/app/data movie-app
```

5. **Deploy to Cloud**

**AWS ECS:**
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag movie-app:latest <account>.dkr.ecr.us-east-1.amazonaws.com/movie-app:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/movie-app:latest
```

**Google Cloud Run:**
```bash
gcloud run deploy movie-app --image gcr.io/[PROJECT-ID]/movie-app --platform managed
```

### Railway Deployment

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login and Initialize**
```bash
railway login
railway init
```

3. **Deploy**
```bash
railway up
```

---

## Environment Configuration

### Development (.env.local)
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Production (.env.production)
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com

# Database (when migrating from file storage)
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis (for caching)
REDIS_URL=redis://host:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-ga-id
```

---

## Scaling Strategy

### Phase 1: Initial Deployment (0-1,000 users)

**Current Architecture:**
- Single server instance
- File-based storage
- No caching

**Handles:**
- ~100 concurrent users
- ~1,000 movies
- ~10 requests/second

**Cost:** $0-20/month (on free/hobby tiers)

### Phase 2: Small Scale (1,000-10,000 users)

**Recommended Changes:**

1. **Migrate to Database**
```typescript
// Install Prisma
npm install @prisma/client
npm install -D prisma

// Initialize Prisma
npx prisma init

// schema.prisma
model Movie {
  id          Int      @id @default(autoincrement())
  title       String
  genre       String
  director    String
  year        Int
  rating      Float?
  description String?
  poster      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

2. **Add Redis Caching**
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export async function GET(request: NextRequest) {
  const cacheKey = `movies:page:${page}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  // Fetch from database...
  await redis.setex(cacheKey, 3600, data); // Cache for 1 hour
}
```

3. **Optimize Queries**
```typescript
// Add pagination at database level
const movies = await prisma.movie.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

**Handles:**
- ~1,000 concurrent users
- ~100,000 movies
- ~100 requests/second

**Cost:** $50-200/month

### Phase 3: Medium Scale (10,000-100,000 users)

**Recommended Changes:**

1. **Load Balancing**
   - Multiple server instances
   - Use cloud load balancer (AWS ALB, GCP Load Balancer)

2. **Database Optimization**
   - Add database indexes
   - Set up read replicas
   - Implement connection pooling

```sql
-- Add indexes
CREATE INDEX idx_movies_genre ON movies(genre);
CREATE INDEX idx_movies_year ON movies(year);
CREATE INDEX idx_movies_title ON movies(title);
```

3. **CDN for Static Assets**
   - Use CloudFront, Cloudflare, or Fastly
   - Serve images through CDN

4. **API Rate Limiting**
```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

export async function GET(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  // Continue...
}
```

**Handles:**
- ~10,000 concurrent users
- ~1,000,000 movies
- ~1,000 requests/second

**Cost:** $500-2,000/month

### Phase 4: Large Scale (100,000+ users)

**Recommended Changes:**

1. **Microservices Architecture**
   - Split into separate services
   - Movies service
   - Recommendations service
   - User service

2. **Advanced Caching**
   - Multi-layer caching (CDN, Redis, Application)
   - Cache invalidation strategies

3. **Database Sharding**
   - Horizontal database partitioning
   - Separate read and write databases

4. **Message Queue**
```typescript
// For async operations like sending notifications
import { Queue } from 'bullmq';

const emailQueue = new Queue('emails', {
  connection: redisConnection,
});

await emailQueue.add('send-recommendation', {
  userId: user.id,
  movies: recommendations,
});
```

5. **Search Engine**
```typescript
// Elasticsearch for advanced search
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: process.env.ELASTICSEARCH_URL });

const result = await client.search({
  index: 'movies',
  body: {
    query: {
      multi_match: {
        query: searchTerm,
        fields: ['title^2', 'director', 'description'],
      },
    },
  },
});
```

**Handles:**
- ~100,000+ concurrent users
- ~10,000,000+ movies
- ~10,000+ requests/second

**Cost:** $5,000-50,000+/month

---

## Performance Optimization

### Frontend Optimization

1. **Image Optimization**
```typescript
import Image from 'next/image';

<Image
  src={movie.poster}
  alt={movie.title}
  width={300}
  height={450}
  loading="lazy"
/>
```

2. **Code Splitting**
```typescript
import dynamic from 'next/dynamic';

const AddMovieForm = dynamic(() => import('@/components/AddMovieForm'), {
  loading: () => <Spinner />,
});
```

3. **Data Fetching Optimization**
```typescript
// Use SWR for client-side data fetching
import useSWR from 'swr';

function Movies() {
  const { data, error, isLoading } = useSWR('/api/movies', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}
```

### Backend Optimization

1. **Database Connection Pooling**
```typescript
// Prisma configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 20
}
```

2. **Compression**
```typescript
// Enable gzip compression
const nextConfig = {
  compress: true,
};
```

3. **Monitoring Query Performance**
```typescript
import { performance } from 'perf_hooks';

const start = performance.now();
const movies = await fetchMovies();
const duration = performance.now() - start;

if (duration > 1000) {
  console.warn(`Slow query: ${duration}ms`);
}
```

---

## Monitoring and Maintenance

### Monitoring Tools

1. **Vercel Analytics** (for Vercel deployments)
   - Real-time analytics
   - Web vitals tracking

2. **Sentry** (Error tracking)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

3. **Datadog/New Relic** (APM)
   - Application performance monitoring
   - Database query tracking
   - Custom metrics

4. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusPage.io

### Key Metrics to Monitor

- **Response Time**: API endpoint latency
- **Error Rate**: 4xx and 5xx errors
- **Throughput**: Requests per second
- **Database Performance**: Query execution time
- **Cache Hit Rate**: Redis cache effectiveness
- **Memory Usage**: Application memory consumption
- **CPU Usage**: Server CPU utilization

### Logging

```typescript
// Structured logging
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

logger.info({ movieId, userId }, 'Movie viewed');
logger.error({ error, endpoint }, 'API error');
```

### Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - Test restore procedures

2. **File Storage Backups** (if using file-based storage)
   - Backup data directory daily
   - Store in S3 or equivalent

---

## Security Considerations

1. **HTTPS Only**
   - Enforce HTTPS in production
   - Use HSTS headers

2. **Input Validation**
```typescript
import { z } from 'zod';

const movieSchema = z.object({
  title: z.string().min(1).max(200),
  year: z.number().min(1888).max(new Date().getFullYear() + 5),
  rating: z.number().min(0).max(10).optional(),
});
```

3. **Rate Limiting**
   - Prevent abuse
   - DDoS protection

4. **CORS Configuration**
   - Whitelist allowed origins
   - Restrict methods

5. **Security Headers**
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};
```

---

## Cost Optimization

1. **Use Free Tiers**
   - Vercel Hobby (free)
   - Upstash Redis (free tier)
   - Supabase PostgreSQL (free tier)

2. **Optimize Database Queries**
   - Reduce unnecessary queries
   - Use pagination
   - Implement caching

3. **CDN Usage**
   - Cache static assets
   - Reduce bandwidth costs

4. **Auto-scaling**
   - Scale down during low traffic
   - Use serverless where appropriate

---

## Rollback Strategy

1. **Version Control**
   - Tag releases: `git tag v1.0.0`
   - Keep deployment history

2. **Database Migrations**
   - Always create reversible migrations
   - Test rollback procedures

3. **Feature Flags**
```typescript
const features = {
  newRecommendationAlgo: process.env.FEATURE_NEW_ALGO === 'true',
};

if (features.newRecommendationAlgo) {
  // New algorithm
} else {
  // Old algorithm
}
```

4. **Blue-Green Deployment**
   - Maintain two production environments
   - Switch traffic between them

---

## Checklist Before Going Live

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates configured
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Error tracking configured
- [ ] Documentation updated
- [ ] Rollback plan tested
- [ ] CDN configured
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Analytics integrated

---

## Support and Troubleshooting

### Common Issues

**Issue: High memory usage**
- Check for memory leaks
- Optimize database queries
- Implement pagination

**Issue: Slow API responses**
- Add caching layer
- Optimize database indexes
- Use CDN for static assets

**Issue: Database connection errors**
- Implement connection pooling
- Check connection limits
- Monitor active connections

---

## Conclusion

This deployment guide provides a roadmap for scaling from a simple deployment to handling enterprise-level traffic. Start with simple solutions (Vercel, file storage) and progressively add complexity as your user base grows.

Remember: Premature optimization is the root of all evil. Scale when you need to, not before.
