import { create } from 'zustand'

interface Story {
  id: string
  title: string
  genre: string
  tone: string
  status: string
  created_at: string
  [key: string]: any
}

interface Chapter {
  id: string
  story_id: string
  content: string
  summary: string | null
  sequence_number: number
  [key: string]: any
}

interface Choice {
  id: string
  chapter_id: string
  choice_text: string
  vote_count: number
  is_ai_generated: boolean
  votes?: Array<{ user_id: string }>
  [key: string]: any
}

interface StoryState {
  currentStory: Story | null
  chapters: Chapter[]
  currentChapter: Chapter | null
  choices: Choice[]
  storyTree: any
  isLoading: boolean
  error: string | null

  setCurrentStory: (story: Story | null) => void
  setChapters: (chapters: Chapter[]) => void
  setCurrentChapter: (chapter: Chapter | null) => void
  setChoices: (choices: Choice[]) => void
  setStoryTree: (tree: any) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addChapter: (chapter: Chapter) => void
  addChoice: (choice: Choice) => void
  updateChoice: (choiceId: string, updates: Partial<Choice>) => void
  reset: () => void
}

export const useStoryStore = create<StoryState>((set) => ({
  currentStory: null,
  chapters: [],
  currentChapter: null,
  choices: [],
  storyTree: null,
  isLoading: false,
  error: null,

  setCurrentStory: (story) => set({ currentStory: story }),
  setChapters: (chapters) => set({ chapters }),
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
  setChoices: (choices) => set({ choices }),
  setStoryTree: (tree) => set({ storyTree: tree }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addChapter: (chapter) => set((state) => ({
    chapters: [...state.chapters, chapter]
  })),

  addChoice: (choice) => set((state) => ({
    choices: [...state.choices, choice]
  })),

  updateChoice: (choiceId, updates) => set((state) => ({
    choices: state.choices.map((choice) =>
      choice.id === choiceId ? { ...choice, ...updates } : choice
    ),
  })),

  reset: () => set({
    currentStory: null,
    chapters: [],
    currentChapter: null,
    choices: [],
    storyTree: null,
    isLoading: false,
    error: null,
  }),
}))
