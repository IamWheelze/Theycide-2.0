import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/database.types'
import { generateStoryChoices } from '@/lib/ai/story-generator'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chapterId = searchParams.get('chapterId')

  if (!chapterId) {
    return NextResponse.json(
      { error: 'Chapter ID is required' },
      { status: 400 }
    )
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { data: choices, error } = await supabase
    .from('story_choices')
    .select('*, users!submitted_by(*), votes(*)')
    .eq('chapter_id', chapterId)
    .eq('status', 'active')
    .order('vote_count', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ choices })
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
  const { chapterId, choiceText, isAiGenerated = false } = body

  if (!chapterId || !choiceText) {
    return NextResponse.json(
      { error: 'Chapter ID and choice text are required' },
      { status: 400 }
    )
  }

  try {
    const { data: choice, error } = await supabase
      .from('story_choices')
      .insert({
        chapter_id: chapterId,
        choice_text: choiceText,
        submitted_by: user.id,
        is_ai_generated: isAiGenerated,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ choice })
  } catch (error) {
    console.error('Choice creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create choice' },
      { status: 500 }
    )
  }
}
