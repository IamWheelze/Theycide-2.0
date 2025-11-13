# Deployment Guide - StoryVote

Complete guide for deploying StoryVote to production.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account (Production project)
- OpenAI API key with credits
- Replicate API token (optional)
- ElevenLabs API key (optional)

## Step 1: Prepare Supabase Database

### Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region closest to your users
4. Wait for project initialization (~2 minutes)

### Run Database Migrations

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

   Or manually run SQL files in Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_row_level_security.sql`

### Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. (Optional) Enable OAuth providers:
   - Google
   - GitHub
   - Discord
4. Configure email templates in Authentication > Email Templates
5. Set site URL in Authentication > URL Configuration

### Set up Storage

1. Go to Storage
2. Create buckets:
   - `story-images` (public)
   - `story-audio` (public)
   - `story-exports` (public)
3. Configure bucket policies to allow public read access

### Get API Keys

1. Go to Settings > API
2. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep secure!)

## Step 2: Deploy to Vercel

### Connect GitHub Repository

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Initial StoryVote deployment"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Configure Environment Variables

In Vercel dashboard, add all environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI
OPENAI_API_KEY=sk-xxx...

# Replicate
REPLICATE_API_TOKEN=r8_xxx...

# ElevenLabs (optional)
ELEVENLABS_API_KEY=xxx...

# App URL (set to your production domain)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Deploy

1. Click "Deploy"
2. Wait for build (~2-5 minutes)
3. Verify deployment at generated URL

## Step 3: Configure Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Wait for DNS propagation (~5-60 minutes)
5. Update `NEXT_PUBLIC_APP_URL` environment variable
6. Redeploy

## Step 4: Post-Deployment Checks

### Test Core Features

- [ ] User registration works
- [ ] User login works
- [ ] Story creation generates AI content
- [ ] Voting system functions
- [ ] Choices can be submitted
- [ ] Chapters can be continued
- [ ] Images generate (if Replicate configured)
- [ ] Audio generates (if TTS configured)

### Monitor Performance

1. Vercel Analytics
   - Check page load times
   - Monitor Core Web Vitals
   - Track user flows

2. Supabase Dashboard
   - Monitor database queries
   - Check RLS policy performance
   - Review authentication logs

3. API Monitoring
   - OpenAI usage and costs
   - Replicate credits
   - Rate limiting

### Set up Error Monitoring (Recommended)

Install Sentry or similar:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Configure error tracking for production issues.

## Step 5: Production Optimizations

### Database Optimizations

1. **Create Additional Indexes** (if needed after load testing):
   ```sql
   CREATE INDEX CONCURRENTLY idx_votes_user_chapter
   ON votes(user_id, choice_id);

   CREATE INDEX CONCURRENTLY idx_choices_chapter_status
   ON story_choices(chapter_id, status);
   ```

2. **Enable Connection Pooling**:
   - Supabase automatically pools connections
   - For high traffic, consider pgBouncer

3. **Set up Backups**:
   - Enable automatic backups in Supabase dashboard
   - Schedule: Daily at low-traffic time

### API Rate Limiting

Implement rate limiting in API routes:

```typescript
// middleware.ts
import { ratelimit } from '@/lib/rate-limit'

export async function middleware(request: Request) {
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
  const { success } = await ratelimit.limit(identifier)

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
}
```

### Caching Strategy

1. **Static Page Caching**:
   - Landing page: ISR with 1 hour revalidation
   - Public stories: ISR with 5 minute revalidation

2. **API Caching**:
   - Use Vercel Edge Cache for GET requests
   - Cache story trees for 1 minute

3. **Client Caching**:
   - React Query for API response caching
   - Local storage for user preferences

### Content Delivery

1. **Image Optimization**:
   - All images served through Next.js Image component
   - Automatic WebP conversion
   - Responsive images

2. **Asset Optimization**:
   - Minimize bundle size
   - Code splitting for routes
   - Lazy load components

## Step 6: Scaling Considerations

### For High Traffic (1000+ daily users)

1. **Database**:
   - Upgrade Supabase plan
   - Enable read replicas
   - Consider materialized views for complex queries

2. **API**:
   - Implement request queue for AI generation
   - Use background workers for long tasks
   - Consider Redis for session storage

3. **Media Storage**:
   - Use CDN for generated images/audio
   - Implement lazy loading
   - Compress assets

4. **Cost Optimization**:
   - Monitor OpenAI API usage
   - Implement usage limits per user
   - Cache AI responses when appropriate

### Monitoring Setup

1. **Uptime Monitoring**:
   - Use UptimeRobot or Pingdom
   - Alert on downtime

2. **Performance Monitoring**:
   - Vercel Analytics
   - Google Analytics
   - Custom metrics dashboard

3. **Cost Monitoring**:
   - Set up billing alerts
   - Monitor AI API usage
   - Track database size growth

## Step 7: Maintenance

### Regular Tasks

**Daily**:
- Check error logs
- Monitor AI API usage
- Review new user signups

**Weekly**:
- Review performance metrics
- Check database growth
- Update dependencies (if needed)

**Monthly**:
- Database backup verification
- Security audit
- Cost review and optimization

### Updates and Deployments

1. **Staging Environment** (Recommended):
   - Create separate Vercel project for staging
   - Use separate Supabase project
   - Test changes before production

2. **Deployment Process**:
   ```bash
   # Staging
   git push origin staging
   # Test on staging.your-domain.com

   # Production
   git push origin main
   # Auto-deploys to production
   ```

3. **Rollback Process**:
   - Vercel allows instant rollback to previous deployment
   - Go to Deployments > Select previous > Promote to Production

## Troubleshooting Production Issues

### High Database CPU

- Check slow queries in Supabase dashboard
- Add missing indexes
- Optimize RLS policies
- Consider read replicas

### AI Generation Timeouts

- Increase serverless function timeout (Vercel Pro plan)
- Implement request queue
- Add retry logic
- Cache common prompts

### Memory Issues

- Optimize image sizes
- Reduce bundle size
- Use streaming for large responses
- Monitor memory usage in Vercel

### Authentication Issues

- Verify Supabase auth settings
- Check email delivery
- Verify OAuth credentials
- Review RLS policies

## Security Checklist

- [ ] Environment variables secured
- [ ] Service role key not exposed to client
- [ ] RLS policies tested and verified
- [ ] API rate limiting implemented
- [ ] Input sanitization in place
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Content Security Policy set
- [ ] Regular dependency updates
- [ ] Security headers configured

## Support Resources

- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **OpenAI**: https://platform.openai.com/docs

## Emergency Contacts

- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.io
- OpenAI Support: help.openai.com

---

**Remember**: Always test thoroughly in staging before deploying to production!
