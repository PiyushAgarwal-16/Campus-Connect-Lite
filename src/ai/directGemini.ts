import { GoogleGenerativeAI } from '@google/generative-ai';

// Interface for the input parameters
interface EventDescriptionInput {
  eventTitle: string;
  eventType: string;
  targetAudience?: string;
  keyPoints: string[];
  duration?: string;
  location?: string;
}

// Interface for the output
interface EventDescriptionOutput {
  description: string;
  generatedAt: string;
}

// Initialize the Google AI SDK
const getGeminiAPI = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Helper function to generate event description using Gemini
export async function generateEventDescription(input: EventDescriptionInput): Promise<EventDescriptionOutput> {
  try {
    const { eventTitle, eventType, targetAudience, keyPoints, duration, location } = input;
    
    const prompt = `
Create a compelling and professional event description for a campus event with the following details:

Event Title: ${eventTitle}
Event Type: ${eventType}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${duration ? `Duration: ${duration}` : ''}
${location ? `Location: ${location}` : ''}

Key Points to Include:
${keyPoints.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n')}

Please generate a well-structured, engaging description that:
- Is approximately 100-200 words
- Captures the essence of the event
- Highlights the key benefits for attendees
- Uses professional yet accessible language
- Includes a clear call-to-action
- Is suitable for a university campus event platform

The description should be informative, exciting, and encourage student participation.
`;

    const genAI = getGeminiAPI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text();

    return {
      description: description.trim(),
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating event description:', error);
    throw new Error('Failed to generate event description. Please try again.');
  }
}
