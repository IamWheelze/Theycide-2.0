import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/database.types'
import { generateStoryChoices } from '@/lib/ai/story-generator'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { storyId, chapterId } = body

  if (!storyId || !chapterId) {
    return NextResponse.json(
      { error: 'Story ID and Chapter ID are required' },
      { status: 400 }
    )
  }

  try {
    // Get story details
    const { data: story } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Get all chapters for context
    const { data: chapters } = await supabase
      .from('chapters')
      .select('content, summary')
      .eq('story_id', storyId)
      .order('sequence_number', { ascending: true })

    if (!chapters || chapters.length === 0) {
      return NextResponse.json({ error: 'No chapters found' }, { status: 404 })
    }

    // Generate choices with AI
    const { choices: generatedChoices } = await generateStoryChoices({
      genre: story.genre,
      tone: story.tone,
      previousChapters: chapters,
    })

    // Insert choices into database
    const choicesToInsert = generatedChoices.map((choiceText) => ({
      chapter_id: chapterId,
      choice_text: choiceText,
      submitted_by: user.id,
      is_ai_generated: true,
      status: 'active' as const,
    }))

    const { data: insertedChoices, error } = await supabase
      .from('story_choices')
      .insert(choicesToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ choices: insertedChoices })
  } catch (error) {
    console.error('Choice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate choices' },
      { status: 500 }
    )
  }
}
