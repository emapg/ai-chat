import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// API handler for POST requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body; // Extract 'prompt' from the request body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string." },
        { status: 400 }
      );
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate response from Gemini API
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Error generating content:", error);

    return NextResponse.json(
      { error: "Something went wrong while generating content." },
      { status: 500 }
    );
  }
}
