# StoryVote - AI-Powered Collaborative Storytelling Platform

A complete web application that enables groups to create branching narratives through AI assistance, democratic voting, and user contributions. Built with Next.js 14, Supabase, and advanced AI models.

## Features

### Core Functionality

- **AI-Generated Stories**: Create story seeds with GPT-4 based on genre, tone, and length preferences
- **Democratic Voting**: Groups vote on what happens next in the story
- **User Submissions**: Users can propose their own story directions
- **Branching Narratives**: Create alternate timelines and explore multiple story paths
- **Real-time Collaboration**: Live updates for votes and new chapters
- **Multiple Output Formats**:
  - Text stories (web view)
  - Illustrated storybooks (AI-generated images)
  - Audiobooks (AI narration)
  - PDF exports
  - Storyboard visualizations

### Story Engine

- AI-powered story continuation
- Context-aware narrative generation
- Genre and tone adaptation
- Automatic chapter summaries
- Story tree data structure
- Branch labeling and navigation

### User System

- Supabase authentication (email/password, OAuth)
- User profiles with avatars
- Private and public groups
- Group invite codes
- Story privacy controls

### AI Capabilities

- **Text Generation**: OpenAI GPT-4 for story content
- **Image Generation**: Stable Diffusion via Replicate for chapter illustrations
- **Audio Generation**: OpenAI TTS or ElevenLabs for narration
- **Smart Merging**: AI combines conflicting user inputs into cohesive narrative

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Flow** - Story tree visualization
- **Lucide React** - Icons

### Backend
- **Supabase** - PostgreSQL database, authentication, storage, real-time
- **Next.js API Routes** - Serverless API endpoints
- **Row Level Security** - Data access control

### AI Services
- **OpenAI GPT-4** - Story generation and text processing
- **Replicate (Stable Diffusion)** - Image generation
- **OpenAI TTS / ElevenLabs** - Audio narration

### Deployment
- **Vercel** - Frontend and API hosting
- **Supabase Cloud** - Database and auth

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  UI Layer    │  │  State Mgmt  │  │  Components  │      │
│  │  (Tailwind)  │  │   (Zustand)  │  │   (React)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Layer (Next.js Routes)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Story Routes │  │  Vote Routes │  │  AI Routes   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │  AI Pipeline │  │    Storage   │      │
│  │ (DB + Auth)  │  │ Orchestrator │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External AI Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   OpenAI     │  │   Replicate  │  │  ElevenLabs  │      │
│  │  (GPT/TTS)   │  │  (SD Images) │  │    (TTS)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

- **users** - User profiles (extends Supabase auth)
- **groups** - Story collaboration groups
- **group_members** - Group membership with roles
- **stories** - Story metadata and settings
- **chapters** - Story content with branching
- **story_choices** - Voting options for next chapter
- **votes** - User votes on choices
- **media_assets** - Generated images and audio
- **exports** - Generated story outputs (PDF, audio, etc.)

See `supabase/migrations/001_initial_schema.sql` for complete schema with indexes, constraints, and triggers.

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Replicate API token (optional, for images)
- ElevenLabs API key (optional, for enhanced TTS)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Theycide-2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migrations in `supabase/migrations/` in order:
     - `001_initial_schema.sql`
     - `002_row_level_security.sql`
   - Get your project URL and anon key from Settings > API

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your keys:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # OpenAI
   OPENAI_API_KEY=sk-your-openai-key

   # Replicate (for image generation)
   REPLICATE_API_TOKEN=your_replicate_token

   # ElevenLabs (optional, for premium TTS)
   ELEVENLABS_API_KEY=your_elevenlabs_key

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

#### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

#### Supabase Setup

1. Ensure migrations are run on your production database
2. Configure Row Level Security policies
3. Set up authentication providers (Google, GitHub, etc.)
4. Configure storage buckets for media assets

## Usage Guide

### Creating a Story

1. Sign up or log in
2. Click "New Story" from dashboard
3. Choose genre (Fantasy, Sci-Fi, Mystery, etc.)
4. Select tone (Light & Humorous, Dark & Serious, etc.)
5. Set target length (5-50 chapters)
6. AI generates opening chapter automatically
7. Share with group via invite code

### Voting on Story Direction

1. Open an active story
2. View the latest chapter
3. Click "Generate Story Options" for AI suggestions, or
4. Submit your own idea in the text box
5. Vote on your preferred option
6. When votes are tallied, click "Continue Story"
7. AI generates next chapter based on winning choice

### Exploring Story Branches

1. Click "Story Tree" button
2. View all branches and alternate paths
3. Click on any branch to explore
4. Create new branches from any chapter

### Exporting Stories

1. Open a completed story
2. Click "Export" button
3. Choose format:
   - **Text**: Download as plain text
   - **PDF**: Illustrated PDF book
   - **Audio**: MP3 audiobook with AI narration
   - **Storyboard**: Visual scene-by-scene breakdown
4. Wait for generation (may take 1-2 minutes for illustrated/audio)
5. Download your story

### Managing Groups

1. Create private group from dashboard
2. Share invite code with friends
3. Set member roles (admin/member)
4. Create group-specific stories
5. All members can vote and contribute

## API Reference

### Stories

- `POST /api/stories` - Create new story
- `GET /api/stories` - List stories
- `GET /api/stories/:id` - Get story details
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story
- `GET /api/stories/:id/tree` - Get story tree structure

### Chapters

- `POST /api/chapters` - Create new chapter
- `GET /api/chapters?storyId=:id` - Get story chapters

### Choices & Voting

- `POST /api/choices` - Submit story choice
- `GET /api/choices?chapterId=:id` - Get choices for chapter
- `POST /api/votes` - Cast vote
- `GET /api/votes?choiceId=:id` - Get vote count

### AI Generation

- `POST /api/ai/generate-choices` - Generate AI story options
- `POST /api/ai/generate-image` - Generate chapter illustration

## File Structure

```
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── stories/          # Story endpoints
│   │   │   ├── chapters/         # Chapter endpoints
│   │   │   ├── choices/          # Choice endpoints
│   │   │   ├── votes/            # Voting endpoints
│   │   │   └── ai/               # AI generation endpoints
│   │   ├── dashboard/            # User dashboard
│   │   ├── stories/              # Story pages
│   │   │   ├── new/              # Create story
│   │   │   └── [id]/             # View story
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components
│   │   ├── StoryCard.tsx         # Story card component
│   │   └── VotingPanel.tsx       # Voting interface
│   └── lib/                      # Utilities and services
│       ├── ai/                   # AI service integrations
│       │   ├── story-generator.ts # Story generation
│       │   ├── image-generator.ts # Image generation
│       │   └── audio-generator.ts # Audio generation
│       ├── supabase/             # Supabase client
│       │   ├── client.ts         # Client-side client
│       │   ├── server.ts         # Server-side client
│       │   └── database.types.ts # TypeScript types
│       └── utils.ts              # Utility functions
├── supabase/
│   └── migrations/               # Database migrations
│       ├── 001_initial_schema.sql
│       └── 002_row_level_security.sql
├── public/                       # Static assets
├── ARCHITECTURE.md               # Detailed architecture docs
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Key Features Explained

### AI Story Generation

The story engine uses OpenAI's GPT-4 to generate contextually appropriate narrative content:

- **Context Awareness**: Passes previous chapters, genre, tone to maintain consistency
- **Dynamic Generation**: Adapts to user choices and voting outcomes
- **Automatic Summaries**: Creates concise summaries for quick navigation
- **Conflict Resolution**: Merges competing user inputs into cohesive narrative

### Branching System

Stories are stored as tree structures:

- Each chapter has a parent (except root)
- Multiple children = branching paths
- Traverse tree to follow specific storyline
- Visualize entire tree with React Flow
- Jump between branches anytime

### Democratic Voting

- One vote per user per chapter
- Real-time vote aggregation
- Winning choice drives story forward
- Vote history maintained
- Override mechanism for admins

### Real-time Updates

Supabase Realtime provides instant updates for:
- New votes cast
- New choices submitted
- New chapters created
- Group member activity

## Performance Considerations

- **Caching**: Story content cached on client
- **Optimistic UI**: Instant feedback before API confirmation
- **Background Jobs**: Long-running AI tasks queued
- **Image Optimization**: Next.js automatic image optimization
- **Lazy Loading**: Components loaded on demand
- **Database Indexes**: Optimized queries for common patterns

## Security

- **Row Level Security**: Supabase RLS policies enforce data access
- **Authentication**: Secure JWT-based auth
- **API Rate Limiting**: Prevent abuse
- **Input Sanitization**: XSS protection
- **Content Moderation**: AI content filtering (optional)

## Testing

Run tests:
```bash
npm run test
```

Type checking:
```bash
npm run type-check
```

Linting:
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Troubleshooting

### Common Issues

**AI Generation Fails**
- Check OpenAI API key is valid
- Verify account has credits
- Check API rate limits

**Images Don't Generate**
- Verify Replicate API token
- Check token has credits
- Stable Diffusion can take 30-60 seconds

**Database Errors**
- Verify Supabase URL and keys
- Check RLS policies are set up
- Ensure migrations have run

**Build Errors**
- Delete `.next` folder and rebuild
- Clear `node_modules` and reinstall
- Check Node.js version (18+)

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI models (GPT-5, Claude Opus)
- [ ] Video generation for stories
- [ ] Multiplayer real-time editing
- [ ] Story marketplace
- [ ] Character consistency tracking
- [ ] Voice cloning for character voices
- [ ] 3D scene visualization
- [ ] Translation support

## License

MIT License - See LICENSE file for details

## Acknowledgments

- OpenAI for GPT-4 and TTS
- Replicate for Stable Diffusion hosting
- Supabase for backend infrastructure
- Vercel for hosting platform
- shadcn/ui for component library

## Support

- GitHub Issues: [Report bugs or request features]
- Documentation: See ARCHITECTURE.md for detailed technical docs
- Email: support@storyvote.com

---

Built with love by the StoryVote team. Happy storytelling!
