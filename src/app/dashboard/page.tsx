'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StoryCard } from '@/components/StoryCard'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStories()
  }, [])

  async function loadStories() {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*, users!created_by(*)')
        .order('created_at', { ascending: false })

      if (error) throw error

      setStories(data || [])
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your stories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Stories</h1>
            <p className="text-gray-600 mt-1">
              Collaborative stories you've created or joined
            </p>
          </div>
          <Link href="/stories/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Story
            </Button>
          </Link>
        </div>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No stories yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start your first collaborative story with AI
            </p>
            <Link href="/stories/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Story
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
