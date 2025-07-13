import { NextRequest, NextResponse } from 'next/server';
import { generateEventBanner } from '@/ai/bannerGenerator';

export async function POST(req: NextRequest) {
  try {
    console.log('Banner generation API called');
    
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'AI service not configured properly' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { eventTitle, eventType, description, location, date, colorScheme } = body;

    console.log('Received banner generation request:', {
      eventTitle: eventTitle ? 'PROVIDED' : 'MISSING',
      eventType: eventType ? 'PROVIDED' : 'MISSING', 
      description: description ? 'PROVIDED' : 'MISSING',
      location: location ? 'PROVIDED' : 'MISSING',
      date: date ? 'PROVIDED' : 'MISSING',
      colorScheme: colorScheme || 'DEFAULT'
    });

    // Validate required fields
    if (!eventTitle?.trim()) {
      console.error('Missing eventTitle:', eventTitle);
      return NextResponse.json(
        { error: 'Missing required field: eventTitle' },
        { status: 400 }
      );
    }

    if (!eventType?.trim()) {
      console.error('Missing eventType:', eventType);
      return NextResponse.json(
        { error: 'Missing required field: eventType (category)' },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      console.error('Missing description:', description);
      return NextResponse.json(
        { error: 'Missing required field: description' },
        { status: 400 }
      );
    }

    console.log('Generating banner for event:', eventTitle);

    // Generate the banner
    const bannerResult = await generateEventBanner({
      eventTitle,
      eventType,
      description,
      location,
      date,
      colorScheme: colorScheme || 'professional'
    });

    console.log('Banner generated successfully');

    return NextResponse.json({
      success: true,
      banner: bannerResult
    });

  } catch (error) {
    console.error('Error in banner generation API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate banner',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
