import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface StoryContext {
  genre: string
  tone: string
  previousChapters: Array<{
    content: string
    summary?: string
  }>
  chosenOption?: string
}

export interface GeneratedStory {
  content: string
  summary: string
}

export interface GeneratedChoices {
  choices: string[]
}

export async function generateStoryContent(
  context: StoryContext
): Promise<GeneratedStory> {
  const { genre, tone, previousChapters, chosenOption } = context

  const isFirstChapter = previousChapters.length === 0

  let systemPrompt = `You are a creative storyteller specializing in ${genre} stories with a ${tone} tone.
Your task is to write engaging, immersive narrative content that captures readers' imagination.`

  let userPrompt = ''

  if (isFirstChapter) {
    userPrompt = `Create an opening chapter for a ${genre} story with a ${tone} tone.
The chapter should:
- Be 300-500 words
- Introduce the setting and main character(s)
- Establish the initial conflict or hook
- Leave readers wanting more
- Be engaging and descriptive

Write only the story content, no meta-commentary.`
  } else {
    const storyHistory = previousChapters
      .map((ch, i) => `Chapter ${i + 1}: ${ch.summary || ch.content.slice(0, 200)}`)
      .join('\n\n')

    userPrompt = `Continue the following ${genre} story with a ${tone} tone:

${storyHistory}

${chosenOption ? `The story should continue based on this decision: "${chosenOption}"` : ''}

Write the next chapter (300-500 words) that:
- Flows naturally from the previous events
- ${chosenOption ? 'Incorporates the chosen direction' : 'Advances the plot meaningfully'}
- Maintains the established tone and style
- Adds new developments or revelations
- Keeps readers engaged

Write only the story content, no meta-commentary.`
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 1000,
  })

  const content = completion.choices[0]?.message?.content || ''

  // Generate summary
  const summaryCompletion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You create concise, accurate summaries of story chapters.',
      },
      {
        role: 'user',
        content: `Summarize this chapter in 2-3 sentences:\n\n${content}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 150,
  })

  const summary = summaryCompletion.choices[0]?.message?.content || ''

  return { content, summary }
}

export async function generateStoryChoices(
  context: StoryContext
): Promise<GeneratedChoices> {
  const { genre, tone, previousChapters } = context

  const latestChapter = previousChapters[previousChapters.length - 1]

  const prompt = `Given this ${genre} story with a ${tone} tone, generate 3 compelling options for what could happen next.

Latest chapter:
${latestChapter.content}

Generate 3 distinct story directions that:
- Are each 1-2 sentences
- Offer meaningfully different paths
- Maintain the genre and tone
- Create interesting dramatic possibilities
- Are clear and actionable

Format your response as a JSON array of strings, like:
["Option 1 description", "Option 2 description", "Option 3 description"]`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You generate creative story continuation options in JSON format.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.9,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  })

  const response = completion.choices[0]?.message?.content || '{}'

  try {
    const parsed = JSON.parse(response)
    const choices = parsed.choices || parsed.options || Object.values(parsed)

    if (Array.isArray(choices) && choices.length > 0) {
      return { choices: choices.slice(0, 3) }
    }
  } catch (error) {
    console.error('Failed to parse AI choices:', error)
  }

  // Fallback
  return {
    choices: [
      'The character decides to confront the challenge directly.',
      'The character seeks help from an unexpected ally.',
      'The character discovers a hidden truth that changes everything.',
    ],
  }
}

export async function mergeUserInputs(
  input1: string,
  input2: string,
  context: StoryContext
): Promise<string> {
  const { genre, tone } = context

  const prompt = `Two readers of a ${genre} story with a ${tone} tone have suggested different directions:

Option 1: ${input1}
Option 2: ${input2}

Create a single, cohesive story direction that incorporates the best elements of both suggestions.
The merged option should:
- Be 1-2 sentences
- Feel natural and unified
- Honor both original suggestions where possible
- Maintain the story's genre and tone

Respond with only the merged option text.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 100,
  })

  return completion.choices[0]?.message?.content || input1
}

export async function generateStoryTitle(
  firstChapter: string,
  genre: string
): Promise<string> {
  const prompt = `Based on this opening chapter of a ${genre} story, generate a compelling title:

${firstChapter}

The title should be:
- 2-6 words
- Memorable and evocative
- Fitting for the genre
- Intriguing without spoiling

Respond with only the title, no quotes or explanation.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 20,
  })

  return completion.choices[0]?.message?.content?.replace(/^["']|["']$/g, '') || 'Untitled Story'
}
