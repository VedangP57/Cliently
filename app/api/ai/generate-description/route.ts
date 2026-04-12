import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'

export async function POST(request: Request) {
  // Verify auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { prompt, projectTitle, clientName } = await request.json()

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI service not configured' },
      { status: 503 }
    )
  }

  const client = new Groq({ apiKey })

  const context = [
    projectTitle && `Project: ${projectTitle}`,
    clientName && `Client: ${clientName}`,
  ]
    .filter(Boolean)
    .join('. ')

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional freelancer writing invoice line item descriptions. Write concise, professional descriptions in 1-2 sentences. Return only the description text, nothing else.',
        },
        {
          role: 'user',
          content: `${context ? `${context}\n\n` : ''}Write a professional invoice line item description for: ${prompt.trim()}`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ description: text.trim() })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.includes('429') || message.includes('quota') || message.includes('rate')) {
      return NextResponse.json(
        { error: 'AI quota exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to generate description. Please try again.' },
      { status: 500 }
    )
  }
}
