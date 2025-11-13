import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/database.types'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { choiceId } = body

  if (!choiceId) {
    return NextResponse.json({ error: 'Choice ID is required' }, { status: 400 })
  }

  try {
    // Check if user already voted for this choice
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('choice_id', choiceId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      // Remove vote (toggle)
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      return NextResponse.json({ voted: false, vote: null })
    }

    // Get the chapter_id for this choice to remove other votes
    const { data: choice } = await supabase
      .from('story_choices')
      .select('chapter_id')
      .eq('id', choiceId)
      .single()

    if (choice) {
      // Remove any other votes by this user for the same chapter
      const { data: otherChoices } = await supabase
        .from('story_choices')
        .select('id')
        .eq('chapter_id', choice.chapter_id)

      if (otherChoices) {
        await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .in(
            'choice_id',
            otherChoices.map((c) => c.id)
          )
      }
    }

    // Add new vote
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        choice_id: choiceId,
        user_id: user.id,
      })
      .select()
      .single()

    if (voteError) {
      return NextResponse.json({ error: voteError.message }, { status: 500 })
    }

    return NextResponse.json({ voted: true, vote })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const choiceId = searchParams.get('choiceId')

  if (!choiceId) {
    return NextResponse.json({ error: 'Choice ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { data: votes, error } = await supabase
    .from('votes')
    .select('*, users!user_id(*)')
    .eq('choice_id', choiceId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ votes, count: votes.length })
}
