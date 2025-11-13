'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Sparkles } from 'lucide-react'

const GENRES = [
  'Fantasy',
  'Sci-Fi',
  'Mystery',
  'Romance',
  'Horror',
  'Adventure',
  'Thriller',
  'Comedy',
  'Drama',
  'Historical',
]

const TONES = [
  'Light & Humorous',
  'Dark & Serious',
  'Epic & Dramatic',
  'Mysterious',
  'Romantic',
  'Suspenseful',
  'Whimsical',
  'Gritty & Realistic',
]

export default function NewStoryPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [tone, setTone] = useState('')
  const [targetLength, setTargetLength] = useState(10)
  const [isPublic, setIsPublic] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!genre || !tone) {
      setError('Please select a genre and tone')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || undefined,
          genre,
          tone,
          targetLength,
          isPublic,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create story')
      }

      // Redirect to the new story
      router.push(`/stories/${data.story.id}`)
    } catch (err: any) {
      setError(err.message)
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Create New Story
            </CardTitle>
            <CardDescription>
              Set up your collaborative story. AI will generate the opening chapter based on your choices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Story Title (Optional)
              </label>
              <Input
                placeholder="Leave blank to auto-generate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                AI will create a title if you leave this blank
              </p>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium mb-2">Genre *</label>
              <div className="grid grid-cols-2 gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className={`p-3 rounded-lg border-2 text-sm transition ${
                      genre === g
                        ? 'border-blue-500 bg-blue-50 font-medium'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium mb-2">Tone *</label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`p-3 rounded-lg border-2 text-sm transition ${
                      tone === t
                        ? 'border-blue-500 bg-blue-50 font-medium'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Length */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Length: {targetLength} chapters
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={targetLength}
                onChange={(e) => setTargetLength(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Short (5)</span>
                <span>Long (50)</span>
              </div>
            </div>

            {/* Public/Private */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isPublic" className="text-sm">
                Make story publicly visible
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Create Button */}
            <Button
              onClick={handleCreate}
              disabled={isCreating || !genre || !tone}
              className="w-full"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Your Story...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Story with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
