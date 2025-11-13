import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/database.types'
import { generateChapterImage } from '@/lib/ai/image-generator'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { chapterId } = body

  if (!chapterId) {
    return NextResponse.json(
      { error: 'Chapter ID is required' },
      { status: 400 }
    )
  }

  try {
    // Get chapter details
    const { data: chapter } = await supabase
      .from('chapters')
      .select('*, stories(*)')
      .eq('id', chapterId)
      .single()

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Check if image already exists
    const { data: existingImage } = await supabase
      .from('media_assets')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('type', 'image')
      .single()

    if (existingImage) {
      return NextResponse.json({ image: existingImage })
    }

    // Generate image
    const imageUrl = await generateChapterImage({
      chapterContent: chapter.content,
      genre: (chapter.stories as any).genre,
    })

    // Store in database
    const { data: mediaAsset, error } = await supabase
      .from('media_assets')
      .insert({
        chapter_id: chapterId,
        type: 'image',
        url: imageUrl,
        metadata: {
          generator: 'stable-diffusion',
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ image: mediaAsset })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
