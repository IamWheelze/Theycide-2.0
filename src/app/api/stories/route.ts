import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/database.types'
import { generateStoryContent, generateStoryTitle } from '@/lib/ai/story-generator'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get('groupId')
  const status = searchParams.get('status')

  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase
    .from('stories')
    .select('*, chapters(*), users!created_by(*)')
    .order('created_at', { ascending: false })

  if (groupId) {
    query = query.eq('group_id', groupId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data: stories, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ stories })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, genre, tone, targetLength, groupId, isPublic } = body

  if (!genre || !tone) {
    return NextResponse.json(
      { error: 'Genre and tone are required' },
      { status: 400 }
    )
  }

  try {
    // Generate initial story chapter with AI
    const { content, summary } = await generateStoryContent({
      genre,
      tone,
      previousChapters: [],
    })

    // Generate title if not provided
    const finalTitle = title || (await generateStoryTitle(content, genre))

    // Create the story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        title: finalTitle,
        genre,
        tone,
        target_length: targetLength || 10,
        group_id: groupId || null,
        is_public: isPublic || false,
        created_by: user.id,
      })
      .select()
      .single()

    if (storyError) {
      return NextResponse.json({ error: storyError.message }, { status: 500 })
    }

    // Create the first chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .insert({
        story_id: story.id,
        content,
        summary,
        sequence_number: 1,
        created_by: user.id,
        is_ai_generated: true,
      })
      .select()
      .single()

    if (chapterError) {
      return NextResponse.json({ error: chapterError.message }, { status: 500 })
    }

    // Update story with root chapter
    await supabase
      .from('stories')
      .update({ root_chapter_id: chapter.id })
      .eq('id', story.id)

    return NextResponse.json({ story: { ...story, root_chapter_id: chapter.id }, chapter })
  } catch (error) {
    console.error('Story creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    )
  }
}
