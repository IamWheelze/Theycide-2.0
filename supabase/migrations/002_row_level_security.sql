-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Groups policies
CREATE POLICY "Users can view public groups or groups they're in"
  ON public.groups FOR SELECT
  USING (
    NOT is_private OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups"
  ON public.groups FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = groups.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Group admins can delete groups"
  ON public.groups FOR DELETE
  USING (created_by = auth.uid());

-- Group members policies
CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can add members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_id AND (
        g.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Group admins can remove members"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_id AND (
        g.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
        )
      )
    )
  );

-- Stories policies
CREATE POLICY "Users can view public stories or stories in their groups"
  ON public.stories FOR SELECT
  USING (
    is_public OR
    created_by = auth.uid() OR
    (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = stories.group_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Group members can create stories"
  ON public.stories FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND (
      group_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_id = stories.group_id AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Story creators can update stories"
  ON public.stories FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Story creators can delete stories"
  ON public.stories FOR DELETE
  USING (created_by = auth.uid());

-- Chapters policies
CREATE POLICY "Users can view chapters of accessible stories"
  ON public.chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_id AND (
        s.is_public OR
        s.created_by = auth.uid() OR
        (s.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = s.group_id AND gm.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Group members can create chapters"
  ON public.chapters FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_id AND (
        s.created_by = auth.uid() OR
        (s.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = s.group_id AND gm.user_id = auth.uid()
        ))
      )
    )
  );

-- Story choices policies
CREATE POLICY "Users can view choices for accessible chapters"
  ON public.story_choices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chapters c
      JOIN public.stories s ON s.id = c.story_id
      WHERE c.id = chapter_id AND (
        s.is_public OR
        s.created_by = auth.uid() OR
        (s.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = s.group_id AND gm.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Group members can submit choices"
  ON public.story_choices FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by AND
    EXISTS (
      SELECT 1 FROM public.chapters c
      JOIN public.stories s ON s.id = c.story_id
      WHERE c.id = chapter_id AND (
        s.created_by = auth.uid() OR
        (s.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = s.group_id AND gm.user_id = auth.uid()
        ))
      )
    )
  );

-- Votes policies
CREATE POLICY "Users can view votes for accessible choices"
  ON public.votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.story_choices sc
      JOIN public.chapters c ON c.id = sc.chapter_id
      JOIN public.stories s ON s.id = c.story_id
      WHERE sc.id = choice_id AND (
        s.is_public OR
        s.created_by = auth.uid() OR
        (s.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = s.group_id AND gm.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can vote on accessible choices"
  ON public.votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.story_choices sc
      JOIN public.chapters c ON c.id = sc.chapter_id
      JOIN public.stories s ON s.id = c.story_id
      WHERE sc.id = choice_id AND (
        s.created_by = auth.uid() OR
        (s.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = s.group_id AND gm.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- Media assets policies
CREATE POLICY "Users can view media for accessible chapters"
  ON public.media_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chapters c
      JOIN public.stories s ON s.id = c.story_id
      WHERE c.id = chapter_id AND (
        s.is_public OR
        s.created_by = auth.uid() OR
        (s.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = s.group_id AND gm.user_id = auth.uid()
        ))
      )
    )
  );

-- Exports policies
CREATE POLICY "Users can view exports for accessible stories"
  ON public.exports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_id AND (
        s.is_public OR
        s.created_by = auth.uid() OR
        (s.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = s.group_id AND gm.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can create exports for accessible stories"
  ON public.exports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_id AND (
        s.created_by = auth.uid() OR
        (s.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = s.group_id AND gm.user_id = auth.uid()
        ))
      )
    )
  );
