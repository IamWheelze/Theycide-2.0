import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/database.types'
import { generateStoryContent } from '@/lib/ai/story-generator'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { storyId, parentChapterId, chosenOption, branchLabel } = body

  if (!storyId) {
    return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
  }

  try {
    // Get story details
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Get previous chapters for context
    const { data: previousChapters } = await supabase
      .from('chapters')
      .select('content, summary')
      .eq('story_id', storyId)
      .order('sequence_number', { ascending: true })

    // Generate new chapter content
    const { content, summary } = await generateStoryContent({
      genre: story.genre,
      tone: story.tone,
      previousChapters: previousChapters || [],
      chosenOption,
    })

    // Determine sequence number
    const parentSequence = parentChapterId
      ? (
          await supabase
            .from('chapters')
            .select('sequence_number')
            .eq('id', parentChapterId)
            .single()
        ).data?.sequence_number || 0
      : 0

    // Create the new chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .insert({
        story_id: storyId,
        parent_chapter_id: parentChapterId || null,
        content,
        summary,
        sequence_number: parentSequence + 1,
        branch_label: branchLabel || null,
        created_by: user.id,
        is_ai_generated: true,
      })
      .select()
      .single()

    if (chapterError) {
      return NextResponse.json({ error: chapterError.message }, { status: 500 })
    }

    return NextResponse.json({ chapter })
  } catch (error) {
    console.error('Chapter creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const storyId = searchParams.get('storyId')
  const parentChapterId = searchParams.get('parentChapterId')

  if (!storyId) {
    return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  let query = supabase
    .from('chapters')
    .select('*')
    .eq('story_id', storyId)
    .order('sequence_number', { ascending: true })

  if (parentChapterId) {
    query = query.eq('parent_chapter_id', parentChapterId)
  }

  const { data: chapters, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ chapters })
}
