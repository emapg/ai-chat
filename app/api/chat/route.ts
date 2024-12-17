import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API handler for POST requests
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { messages } = body;

    // Validate messages array
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request format. 'messages' should be an array." },
        { status: 400 }
      );
    }

    // Call OpenAI API for chat completions
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Change to the desired model like "gpt-4o-mini" or "gpt-3.5-turbo"
      messages,
    });

    // Extract AI response from the completion
    const response = completion.choices[0]?.message?.content || "No response received.";

    // Return the response to the client
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in OpenAI API call:", error);

    // Handle OpenAI-specific errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: error.message, status: error.status },
        { status: error.status || 500 }
      );
    }

    // General error fallback
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 }
    );
  }
}
