import { NextRequest, NextResponse } from 'next/server';
import { generateEventDescription } from '@/ai/directGemini';

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if API key is available
    console.log('API Key available:', !!process.env.GOOGLE_API_KEY);
    console.log('API Key length:', process.env.GOOGLE_API_KEY?.length);
    
    const body = await request.json();
    
    // Validate required fields
    const { eventTitle, eventType, keyPoints } = body;
    
    if (!eventTitle || !eventType || !keyPoints || !Array.isArray(keyPoints) || keyPoints.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: eventTitle, eventType, and keyPoints are required' },
        { status: 400 }
      );
    }

    // Filter out empty key points
    const validKeyPoints = keyPoints.filter((point: string) => point.trim().length > 0);
    
    if (validKeyPoints.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid key point is required' },
        { status: 400 }
      );
    }

    // Generate the description using Gemini
    const result = await generateEventDescription({
      eventTitle,
      eventType,
      targetAudience: body.targetAudience,
      keyPoints: validKeyPoints,
      duration: body.duration,
      location: body.location
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-description API:', error);
    return NextResponse.json(
      { error: 'Failed to generate event description. Please try again.' },
      { status: 500 }
    );
  }
}
