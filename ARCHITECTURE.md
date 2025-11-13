# Story Voting App - System Architecture

## Executive Summary

A collaborative storytelling platform that enables groups to create branching narratives through AI assistance, democratic voting, and user contributions.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │  State Mgmt  │  │  Components  │      │
│  │  (shadcn/ui) │  │   (Zustand)  │  │   (React)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Story Routes │  │  Vote Routes │  │  AI Routes   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │  AI Pipeline │  │ Queue System │      │
│  │ (DB + Auth)  │  │ Orchestrator │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      External AI Services                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   OpenAI     │  │   Replicate  │  │  ElevenLabs  │      │
│  │  (GPT-4/TTS) │  │  (SD Images) │  │    (TTS)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

#### `users`
- `id` (uuid, primary key)
- `email` (text, unique)
- `username` (text, unique)
- `display_name` (text)
- `avatar_url` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `groups`
- `id` (uuid, primary key)
- `name` (text)
- `description` (text)
- `is_private` (boolean)
- `created_by` (uuid, foreign key -> users.id)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `group_members`
- `id` (uuid, primary key)
- `group_id` (uuid, foreign key -> groups.id)
- `user_id` (uuid, foreign key -> users.id)
- `role` (enum: 'admin', 'member')
- `joined_at` (timestamp)

#### `stories`
- `id` (uuid, primary key)
- `title` (text)
- `group_id` (uuid, foreign key -> groups.id)
- `created_by` (uuid, foreign key -> users.id)
- `genre` (text)
- `tone` (text)
- `target_length` (integer)
- `status` (enum: 'active', 'completed', 'archived')
- `root_chapter_id` (uuid, foreign key -> chapters.id)
- `metadata` (jsonb) - settings, preferences
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `chapters`
- `id` (uuid, primary key)
- `story_id` (uuid, foreign key -> stories.id)
- `parent_chapter_id` (uuid, foreign key -> chapters.id, nullable)
- `content` (text)
- `summary` (text)
- `sequence_number` (integer)
- `branch_label` (text)
- `created_by` (uuid, foreign key -> users.id)
- `is_ai_generated` (boolean)
- `metadata` (jsonb)
- `created_at` (timestamp)

#### `story_choices`
- `id` (uuid, primary key)
- `chapter_id` (uuid, foreign key -> chapters.id)
- `choice_text` (text)
- `submitted_by` (uuid, foreign key -> users.id)
- `is_ai_generated` (boolean)
- `status` (enum: 'pending', 'active', 'chosen', 'rejected')
- `created_at` (timestamp)

#### `votes`
- `id` (uuid, primary key)
- `choice_id` (uuid, foreign key -> story_choices.id)
- `user_id` (uuid, foreign key -> users.id)
- `created_at` (timestamp)
- Unique constraint on (choice_id, user_id)

#### `media_assets`
- `id` (uuid, primary key)
- `chapter_id` (uuid, foreign key -> chapters.id)
- `type` (enum: 'image', 'audio')
- `url` (text)
- `metadata` (jsonb)
- `created_at` (timestamp)

#### `exports`
- `id` (uuid, primary key)
- `story_id` (uuid, foreign key -> stories.id)
- `branch_path` (jsonb) - array of chapter IDs
- `format` (enum: 'pdf', 'audio', 'illustrated', 'storyboard')
- `url` (text)
- `status` (enum: 'pending', 'processing', 'completed', 'failed')
- `metadata` (jsonb)
- `created_at` (timestamp)
- `completed_at` (timestamp)

## Core Features

### 1. User System
- Supabase Auth (email/password, OAuth)
- Guest mode support
- User profiles
- Group management

### 2. Story Engine
- AI-generated story seeds
- Multi-path branching
- Chapter versioning
- Story state machine

### 3. Voting System
- Real-time vote aggregation
- Time-based or manual triggers
- Democratic decision-making
- Vote history

### 4. Branching Tree
- Tree data structure in database
- Visual graph representation (React Flow)
- Branch navigation
- Alternative timeline exploration

### 5. AI Pipelines

#### Text Generation
- OpenAI GPT-4 or Anthropic Claude
- Context-aware story continuation
- Merge conflicting user inputs
- Genre/tone adaptation

#### Image Generation
- Stable Diffusion via Replicate
- Consistent character appearance
- Scene illustration

#### Audio Generation
- OpenAI TTS or ElevenLabs
- Multiple voice profiles
- Chapter-by-chapter narration

### 6. Output Generation
- PDF export with illustrations
- MP3 audiobook compilation
- Illustrated storybook
- Shareable web links

## API Routes

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

### Stories
- `POST /api/stories` - Create story
- `GET /api/stories/:id` - Get story details
- `GET /api/stories/:id/tree` - Get full story tree
- `PUT /api/stories/:id` - Update story settings
- `DELETE /api/stories/:id` - Archive story

### Chapters
- `POST /api/chapters` - Create chapter (continue story)
- `GET /api/chapters/:id` - Get chapter details
- `GET /api/chapters/:id/children` - Get child chapters

### Choices & Voting
- `POST /api/choices` - Submit story choice
- `GET /api/choices/:chapterId` - Get choices for chapter
- `POST /api/votes` - Cast vote
- `GET /api/votes/:choiceId` - Get vote count

### AI Generation
- `POST /api/ai/generate-story` - Generate story content
- `POST /api/ai/generate-choices` - Generate choice options
- `POST /api/ai/generate-image` - Generate chapter illustration
- `POST /api/ai/generate-audio` - Generate audio narration

### Exports
- `POST /api/exports` - Request export
- `GET /api/exports/:id` - Get export status
- `GET /api/exports/:id/download` - Download export

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member

## State Management

### Global State (Zustand)
- `authStore` - User authentication state
- `storyStore` - Current story state
- `votingStore` - Active votes and choices
- `uiStore` - UI preferences, modals, etc.

### Real-time Subscriptions
- Story updates
- Vote changes
- New chapters
- Group activity

## Frontend Components

### Pages
- `/` - Landing page
- `/dashboard` - User dashboard
- `/stories/new` - Create story
- `/stories/[id]` - Story viewer
- `/stories/[id]/vote` - Voting interface
- `/stories/[id]/tree` - Branch visualization
- `/stories/[id]/export` - Export options
- `/groups` - Group management
- `/groups/[id]` - Group detail

### Key Components
- `StoryViewer` - Read story chapters
- `VotingPanel` - Vote on choices
- `ChoiceSubmission` - Submit custom ideas
- `StoryTree` - Visual branch map
- `ChapterEditor` - Create/edit chapters
- `ExportDialog` - Generate outputs
- `AudioPlayer` - Play audiobook
- `ImageGallery` - View illustrations

## AI Orchestration

### Story Generation Pipeline
1. Receive context (previous chapters, genre, tone)
2. Generate 3-5 continuation options
3. Present to users for voting
4. Winner triggers next chapter generation
5. Store in database with metadata

### Conflict Resolution
When user inputs conflict:
1. AI analyzes both inputs
2. Generates hybrid continuation
3. Preserves key elements from both
4. Maintains story coherence

### Image Generation Pipeline
1. Extract scene description from chapter
2. Maintain character consistency (embeddings)
3. Generate image with appropriate style
4. Store in Supabase Storage
5. Link to chapter

### Audio Generation Pipeline
1. Split story into narration chunks
2. Generate audio for each chunk
3. Add music/effects (optional)
4. Concatenate into single file
5. Store and link to story

## Security & Performance

### Security
- Row-level security in Supabase
- API rate limiting
- Content moderation
- CSRF protection
- Input sanitization

### Performance
- Image optimization (Next.js)
- Lazy loading
- Caching strategy
- Background job queue for exports
- Optimistic UI updates

## Deployment

### Infrastructure
- **Frontend & API**: Vercel
- **Database**: Supabase
- **Storage**: Supabase Storage
- **Queue**: Upstash Redis (for background jobs)

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
REPLICATE_API_TOKEN
ELEVENLABS_API_KEY
```

### CI/CD
- GitHub Actions for testing
- Automatic deployment to Vercel on push
- Database migrations via Supabase CLI

## Success Metrics

1. Users can create and join groups
2. Stories can be created with AI assistance
3. Voting system functions in real-time
4. Branching creates alternate timelines
5. Exports generate properly formatted outputs
6. UI is responsive and intuitive
7. System handles 100+ concurrent users
8. AI responses generated < 10 seconds
9. Story tree visualization loads < 2 seconds
10. All tests pass with >80% coverage

## Future Enhancements

- Mobile app (React Native)
- Advanced AI models (GPT-5, Claude Opus)
- Video generation
- Multiplayer real-time editing
- Story marketplace
- AI character consistency tracking
- Voice cloning for character voices
- 3D scene visualization
