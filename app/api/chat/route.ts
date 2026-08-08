import { LAUKY_SYSTEM_PROMPT } from "@/lib/systemPrompt";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY belum di-set di server.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Format pesan tidak valid." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: LAUKY_SYSTEM_PROMPT }],
          },
          contents,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return new Response(
        JSON.stringify({
          error:
            data?.error?.message ||
            "Gagal menghubungi Gemini API.",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("") || "";

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Gemini server error:", error);

    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan di server Lauky AI.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
