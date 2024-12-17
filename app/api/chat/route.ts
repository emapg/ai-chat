import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  GenerateContentRequest,
  GenerateContentResponse,
} from "@google/generative-ai";

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Define message type
type Message = {
  role: "user" | "assistant";
  content: string;
};

// Define request body type
interface ChatRequestBody {
  messages: Message[];
}

// Define response type
interface ChatResponse {
  response: string;
}

// Handler for POST requests
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = (await req.json()) as ChatRequestBody;
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

    // Define the request to Gemini API
    const request: GenerateContentRequest = {
      contents: [{ role: "user", parts: [{ text: latestMessage }] }],
      safetySettings: [
        {
          category: "harm-category-harassment",
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
    };

    // Generate content
    const result: GenerateContentResponse = await model.generateContent(request);

    // Extract response content
    const response =
      result.response?.text() || "No response received from the AI.";

    // Return the Gemini response
    const responseBody: ChatResponse = { response };
    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Error with Gemini API:", error);

    return NextResponse.json(
      { error: "Something went wrong while fetching the AI response." },
      { status: 500 }
    );
  }
}
