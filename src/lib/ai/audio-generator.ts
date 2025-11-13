import OpenAI from 'openai'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AudioGenerationParams {
  text: string
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  speed?: number
}

export async function generateNarration(
  params: AudioGenerationParams
): Promise<Buffer> {
  const { text, voice = 'alloy', speed = 1.0 } = params

  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice,
      input: text,
      speed,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    return buffer
  } catch (error) {
    console.error('Audio generation failed:', error)
    throw new Error('Failed to generate audio narration')
  }
}

export async function generateChapterAudio(
  chapterContent: string,
  chapterNumber: number,
  voice?: AudioGenerationParams['voice']
): Promise<Buffer> {
  // Add chapter introduction
  const narrationText = `Chapter ${chapterNumber}.\n\n${chapterContent}`

  return generateNarration({
    text: narrationText,
    voice,
    speed: 1.0,
  })
}

export async function generateFullAudiobook(
  chapters: Array<{ content: string; sequence_number: number }>,
  voice?: AudioGenerationParams['voice']
): Promise<Buffer[]> {
  const audioPromises = chapters.map((chapter) =>
    generateChapterAudio(chapter.content, chapter.sequence_number, voice)
  )

  return Promise.all(audioPromises)
}

export async function concatenateAudioBuffers(
  buffers: Buffer[]
): Promise<Buffer> {
  // For production, you'd use a proper audio library like fluent-ffmpeg
  // For now, we'll just concatenate the buffers
  // Note: This is a simplified version. In production, use proper audio merging
  return Buffer.concat(buffers)
}

export interface VoiceOption {
  id: string
  name: string
  description: string
  gender: string
}

export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: 'alloy',
    name: 'Alloy',
    description: 'Neutral, versatile voice',
    gender: 'neutral',
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Male, clear and professional',
    gender: 'male',
  },
  {
    id: 'fable',
    name: 'Fable',
    description: 'British accent, storytelling voice',
    gender: 'male',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    description: 'Deep, authoritative male voice',
    gender: 'male',
  },
  {
    id: 'nova',
    name: 'Nova',
    description: 'Young, energetic female voice',
    gender: 'female',
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Soft, expressive female voice',
    gender: 'female',
  },
]

// Alternative: ElevenLabs integration (if API key is available)
export async function generateWithElevenLabs(
  text: string,
  voiceId: string
): Promise<Buffer> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error('ElevenLabs API request failed')
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
