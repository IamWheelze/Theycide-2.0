'use client'

import { useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Choice {
  id: string
  choice_text: string
  vote_count: number
  is_ai_generated: boolean
  submitted_by: string
  votes?: Array<{ user_id: string }>
}

interface VotingPanelProps {
  chapterId: string
  choices: Choice[]
  currentUserId: string
  onVote: (choiceId: string) => Promise<void>
  onGenerateChoices: () => Promise<void>
  onSubmitCustomChoice: (text: string) => Promise<void>
}

export function VotingPanel({
  chapterId,
  choices,
  currentUserId,
  onVote,
  onGenerateChoices,
  onSubmitCustomChoice,
}: VotingPanelProps) {
  const [customChoice, setCustomChoice] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGenerateChoices = async () => {
    setIsGenerating(true)
    try {
      await onGenerateChoices()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitCustom = async () => {
    if (!customChoice.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmitCustomChoice(customChoice)
      setCustomChoice('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const userVote = choices.find((c) =>
    c.votes?.some((v) => v.user_id === currentUserId)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>What Happens Next?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Choices */}
        <div className="space-y-2">
          {choices.map((choice) => {
            const hasVoted = choice.votes?.some((v) => v.user_id === currentUserId)

            return (
              <button
                key={choice.id}
                onClick={() => onVote(choice.id)}
                className={`w-full p-4 text-left rounded-lg border-2 transition ${
                  hasVoted
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">{choice.choice_text}</p>
                    {choice.is_ai_generated && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Sparkles className="h-3 w-3" />
                        <span>AI suggested</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-semibold">{choice.vote_count}</span>
                    {hasVoted && <Check className="h-5 w-5 text-blue-600" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Generate AI Choices */}
        {choices.length === 0 && (
          <Button
            onClick={handleGenerateChoices}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Story Options
              </>
            )}
          </Button>
        )}

        {/* Custom Choice Input */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">Or suggest your own:</p>
          <div className="flex gap-2">
            <Input
              placeholder="What should happen next?"
              value={customChoice}
              onChange={(e) => setCustomChoice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitCustom()}
              disabled={isSubmitting}
            />
            <Button
              onClick={handleSubmitCustom}
              disabled={!customChoice.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
