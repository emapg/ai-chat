import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmBlockThreshold } from "@google/generative-ai";

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { messages } = body;

    // Validate 'messages' input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request format. 'messages' should be an array." },
        { status: 400 }
      );
    }

    // Extract the user's latest input
    const latestMessage = messages[messages.length - 1]?.content || "";

    if (!latestMessage) {
      return NextResponse.json(
        { error: "Empty message content." },
        { status: 400 }
      );
    }

    // Configure the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Generate response from Gemini
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: latestMessage }] }],
      safetySettings: [
        {
          category: "harm-category-harassment", // Use string-based categories
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: "harm-category-hate-speech",
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: "harm-category-sexually-explicit",
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: "harm-category-dangerous-content",
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    // Extract response content
    const response = result.response?.text() || "No response received.";

    // Return the Gemini response
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error with Gemini API:", error);

    return NextResponse.json(
      { error: "Something went wrong while fetching the AI response." },
      { status: 500 }
    );
  }
}
