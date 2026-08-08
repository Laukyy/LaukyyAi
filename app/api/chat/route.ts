import Anthropic from "@anthropic-ai/sdk";
import { LAUKY_SYSTEM_PROMPT } from "@/lib/systemPrompt";

// Route ini jalan di server (Node runtime), jadi API key AMAN,
// tidak pernah dikirim ke browser/frontend.
export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "ANTHROPIC_API_KEY belum di-set di server. Cek file .env kamu, bro.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Format pesan tidak valid." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const model = process.env.LAUKY_MODEL || "claude-sonnet-4-5-20250929";

    // Bikin ReadableStream supaya frontend bisa nampilin jawaban
    // sedikit demi sedikit (efek "ngetik") alih-alih nunggu full response.
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = anthropic.messages.stream({
            model,
            max_tokens: 4096,
            system: LAUKY_SYSTEM_PROMPT,
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          });

          anthropicStream.on("text", (text) => {
            controller.enqueue(encoder.encode(text));
          });

          anthropicStream.on("error", (err) => {
            console.error("Anthropic stream error:", err);
            controller.enqueue(
              encoder.encode(
                "\n\n[Error: koneksi ke AI kepotong. Coba kirim ulang pesannya, bro.]"
              )
            );
            controller.close();
          });

          await anthropicStream.finalMessage();
          controller.close();
        } catch (err) {
          console.error("Stream setup error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan di server. Cek log server untuk detail.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
      }
