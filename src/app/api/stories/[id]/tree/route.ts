import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/database.types'

interface TreeNode {
  id: string
  content: string
  summary: string | null
  sequence_number: number
  branch_label: string | null
  created_by: string
  is_ai_generated: boolean
  parent_chapter_id: string | null
  children: TreeNode[]
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  // Get all chapters for this story
  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', params.id)
    .order('sequence_number', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Build tree structure
  const nodeMap = new Map<string, TreeNode>()

  // Create all nodes
  chapters.forEach((chapter) => {
    nodeMap.set(chapter.id, {
      ...chapter,
      children: [],
    })
  })

  // Build parent-child relationships
  let rootNode: TreeNode | null = null

  chapters.forEach((chapter) => {
    const node = nodeMap.get(chapter.id)!

    if (chapter.parent_chapter_id) {
      const parent = nodeMap.get(chapter.parent_chapter_id)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      rootNode = node
    }
  })

  return NextResponse.json({ tree: rootNode, chapters })
}
