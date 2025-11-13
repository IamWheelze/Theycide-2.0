import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
})

export interface ImageGenerationParams {
  chapterContent: string
  genre: string
  style?: string
}

export async function generateChapterImage(
  params: ImageGenerationParams
): Promise<string> {
  const { chapterContent, genre, style = 'digital art' } = params

  // Extract key visual elements from the chapter
  const sceneDescription = await extractSceneDescription(chapterContent, genre)

  const prompt = `${style}, ${genre} scene: ${sceneDescription}, highly detailed, professional illustration, cinematic lighting, vibrant colors`

  const negativePrompt =
    'text, watermark, signature, blurry, low quality, distorted, ugly, bad anatomy'

  try {
    const output = await replicate.run('stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b', {
      input: {
        prompt,
        negative_prompt: negativePrompt,
        width: 1024,
        height: 768,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 30,
      },
    }) as string[]

    return output[0] || ''
  } catch (error) {
    console.error('Image generation failed:', error)
    throw new Error('Failed to generate chapter illustration')
  }
}

async function extractSceneDescription(
  chapterContent: string,
  genre: string
): Promise<string> {
  // Use OpenAI to extract visual elements
  const OpenAI = (await import('openai')).default
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const prompt = `Extract the key visual elements from this ${genre} story chapter to create an illustration prompt.
Focus on:
- Main characters and their appearance
- Setting and environment
- Key objects or props
- Mood and atmosphere
- Action or moment being depicted

Chapter:
${chapterContent}

Respond with a concise 1-2 sentence visual description suitable for image generation.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 100,
  })

  return completion.choices[0]?.message?.content || 'A scene from the story'
}

export async function generateStoryboardImages(
  chapters: Array<{ content: string }>,
  genre: string
): Promise<string[]> {
  const imagePromises = chapters.map((chapter) =>
    generateChapterImage({
      chapterContent: chapter.content,
      genre,
      style: 'storyboard style, sketch',
    })
  )

  return Promise.all(imagePromises)
}

export async function generateCoverImage(
  title: string,
  genre: string,
  firstChapter: string
): Promise<string> {
  const sceneDescription = await extractSceneDescription(firstChapter, genre)

  const prompt = `Professional book cover art, ${genre} novel titled "${title}", ${sceneDescription}, dramatic composition, eye-catching, bestseller quality, high detail`

  const negativePrompt =
    'text, title text, words, letters, watermark, signature, blurry, low quality'

  try {
    const output = await replicate.run('stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b', {
      input: {
        prompt,
        negative_prompt: negativePrompt,
        width: 768,
        height: 1024,
        num_outputs: 1,
        guidance_scale: 8,
        num_inference_steps: 40,
      },
    }) as string[]

    return output[0] || ''
  } catch (error) {
    console.error('Cover image generation failed:', error)
    throw new Error('Failed to generate cover image')
  }
}
