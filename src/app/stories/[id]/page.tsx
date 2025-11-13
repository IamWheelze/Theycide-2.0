'use client'

import { useEffect, useState } from 'use strict'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VotingPanel } from '@/components/VotingPanel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, GitBranch, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function StoryPage() {
  const params = useParams()
  const storyId = params.id as string

  const [story, setStory] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [currentChapter, setCurrentChapter] = useState<any>(null)
  const [choices, setChoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    loadStory()
    loadUser()
  }, [storyId])

  useEffect(() => {
    if (chapters.length > 0) {
      const latest = chapters[chapters.length - 1]
      setCurrentChapter(latest)
      loadChoices(latest.id)
    }
  }, [chapters])

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function loadStory() {
    try {
      const { data: storyData } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single()

      const { data: chaptersData } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', storyId)
        .order('sequence_number', { ascending: true })

      setStory(storyData)
      setChapters(chaptersData || [])
    } catch (error) {
      console.error('Error loading story:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadChoices(chapterId: string) {
    const { data } = await supabase
      .from('story_choices')
      .select('*, votes(*)')
      .eq('chapter_id', chapterId)
      .eq('status', 'active')

    setChoices(data || [])
  }

  async function handleVote(choiceId: string) {
    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choiceId }),
      })

      await loadChoices(currentChapter.id)
    } catch (error) {
      console.error('Vote error:', error)
    }
  }

  async function handleGenerateChoices() {
    try {
      const response = await fetch('/api/ai/generate-choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          chapterId: currentChapter.id,
        }),
      })

      const data = await response.json()
      setChoices(data.choices || [])
    } catch (error) {
      console.error('Generate choices error:', error)
    }
  }

  async function handleSubmitCustomChoice(text: string) {
    try {
      await fetch('/api/choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: currentChapter.id,
          choiceText: text,
        }),
      })

      await loadChoices(currentChapter.id)
    } catch (error) {
      console.error('Submit choice error:', error)
    }
  }

  async function handleContinueStory() {
    // Find winning choice
    const winner = choices.reduce((prev, current) =>
      current.vote_count > prev.vote_count ? current : prev
    )

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          parentChapterId: currentChapter.id,
          chosenOption: winner.choice_text,
        }),
      })

      if (response.ok) {
        await loadStory()
      }
    } catch (error) {
      console.error('Continue story error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Story Not Found</h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{story.title}</h1>
              <p className="text-gray-600">
                {story.genre} • {story.tone}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/stories/${storyId}/tree`}>
                <Button variant="outline">
                  <GitBranch className="mr-2 h-4 w-4" />
                  Story Tree
                </Button>
              </Link>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-6 mb-8">
          {chapters.map((chapter, index) => (
            <Card key={chapter.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Chapter {index + 1}</h3>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{chapter.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Voting Panel */}
        {user && currentChapter && story.status === 'active' && (
          <div className="space-y-4">
            <VotingPanel
              chapterId={currentChapter.id}
              choices={choices}
              currentUserId={user.id}
              onVote={handleVote}
              onGenerateChoices={handleGenerateChoices}
              onSubmitCustomChoice={handleSubmitCustomChoice}
            />

            {choices.length > 0 && (
              <Button
                onClick={handleContinueStory}
                className="w-full"
                size="lg"
              >
                Continue Story with Winning Choice
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
