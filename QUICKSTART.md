# Quick Start Guide

Get StoryVote running locally in 5 minutes.

## 1. Clone and Install

```bash
git clone <repository-url>
cd Theycide-2.0
npm install
```

## 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor and run:
   - Copy/paste `supabase/migrations/001_initial_schema.sql`
   - Click "Run"
   - Copy/paste `supabase/migrations/002_row_level_security.sql`
   - Click "Run"

## 3. Get API Keys

### Supabase
- Go to Settings > API
- Copy Project URL and `anon` key

### OpenAI
- Go to [platform.openai.com](https://platform.openai.com)
- Create API key
- Add credits to account

### Replicate (Optional, for images)
- Go to [replicate.com](https://replicate.com)
- Get API token

## 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx...
REPLICATE_API_TOKEN=r8_xxx...  # Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Create Your First Story

1. Click "Get Started"
2. Sign up with email
3. Click "New Story"
4. Choose:
   - Genre: Fantasy
   - Tone: Epic & Dramatic
   - Length: 10 chapters
5. Click "Create Story with AI"
6. Wait ~10 seconds for AI to generate opening chapter
7. Click "Generate Story Options"
8. Vote on an option
9. Click "Continue Story with Winning Choice"
10. Watch your story grow!

## Common Issues

**"Error: Invalid Supabase URL"**
- Check `.env` has correct URL and keys
- Restart dev server after changing `.env`

**"AI Generation Failed"**
- Verify OpenAI API key is correct
- Check you have credits in OpenAI account
- Try again (sometimes models are busy)

**"Database error"**
- Ensure both SQL migrations ran successfully
- Check Supabase project is active
- Verify RLS policies are enabled

## Next Steps

- Read [README.md](./README.md) for full documentation
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup

## Need Help?

- Check GitHub Issues
- Review Supabase docs: https://supabase.com/docs
- Review Next.js docs: https://nextjs.org/docs
- OpenAI docs: https://platform.openai.com/docs
