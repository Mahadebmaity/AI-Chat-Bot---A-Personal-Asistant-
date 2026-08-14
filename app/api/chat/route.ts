import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const BASE_SYSTEM_INSTRUCTION = `You are "My Assistant", a helpful, friendly, and knowledgeable AI assistant powered by Google Gemini. 

Your traits:
- Clear, concise, and well-structured responses
- Use Markdown formatting (headings, bullet points, code blocks) when appropriate
- Friendly and approachable tone
- Honest about uncertainty — never make things up
- Break complex topics into digestible steps

You help with: writing, coding, research, brainstorming, analysis, math, and everyday questions.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not set. Please add your API key to .env.local. Get a free key at https://aistudio.google.com/app/apikey",
        },
        { status: 401 }
      );
    }

    const {
      message,
      model,
      history,
      customInstructions,
      userName,
      userBio,
      responseStyle,
      temperature,
    } = await request.json();

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const selectedModel = model || "gemini-3.7-flash";
    const client = new GoogleGenAI({ apiKey });

    // Build personalized system instructions
    let finalSystemInstruction = BASE_SYSTEM_INSTRUCTION;

    if (userName || userBio || customInstructions || responseStyle) {
      finalSystemInstruction += "\n\n--- USER PERSONALIZATION & PREFERENCES ---";
      if (userName) {
        finalSystemInstruction += `\nUser's name: ${userName}`;
      }
      if (userBio) {
        finalSystemInstruction += `\nUser's background/bio: ${userBio}`;
      }
      if (responseStyle) {
        finalSystemInstruction += `\nPreferred response style: ${responseStyle}`;
      }
      if (customInstructions) {
        finalSystemInstruction += `\nSpecial instructions from user: ${customInstructions}`;
      }
    }

    // Build multi-turn contents array
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.content && item.content.trim()) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.content }],
          });
        }
      }
    }

    // Append current message
    contents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    const parsedTemp = typeof temperature === "number" ? Math.max(0.1, Math.min(1.0, temperature)) : 0.7;

    const responseStream = await client.models.generateContentStream({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: parsedTemp,
      },
    });

    // Stream the response as SSE (Server-Sent Events)
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              const data = JSON.stringify({ type: "text", text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          const doneData = JSON.stringify({ type: "done" });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Stream error";
          const errorData = JSON.stringify({ type: "error", error: errorMessage });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    console.error("[/api/chat] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
