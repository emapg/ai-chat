import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json(); // Expect an array of messages

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // You can use "gpt-3.5-turbo"
      messages,
    });

    const response = completion.choices[0]?.message?.content || "No response.";
    return NextResponse.json({ response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
