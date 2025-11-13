'use client'

import Link from 'next/link'
import { BookOpen, Users, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'

interface StoryCardProps {
  story: {
    id: string
    title: string
    genre: string
    tone: string
    status: string
    created_at: string
    is_public: boolean
    users?: {
      username: string
      display_name?: string
    }
  }
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link href={`/stories/${story.id}`}>
      <Card className="hover:shadow-lg transition cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <span className="line-clamp-1">{story.title}</span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                story.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : story.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {story.status}
            </span>
          </CardTitle>
          <CardDescription>
            {story.genre} • {story.tone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{story.is_public ? 'Public' : 'Private'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatRelativeTime(story.created_at)}</span>
            </div>
          </div>
          {story.users && (
            <div className="mt-2 text-sm text-gray-500">
              by {story.users.display_name || story.users.username}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
