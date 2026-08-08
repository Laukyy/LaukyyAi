import { LAUKY_SYSTEM_PROMPT } from "@/lib/systemPrompt";

export const runtime = "nodejs";

const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60 * 1000;

// Menyimpan waktu request setiap IP
const requestLog = new Map<string, number[]>();

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];

  // Hapus request yang sudah lewat 1 menit
  const recentRequests = timestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= RATE_LIMIT) {
    requestLog.set(ip, recentRequests);
    return false;
  }

  recentRequests.push(now);
  requestLog.set(ip, recentRequests);

  return true;
}

export async function POST(req: Request) {
  try {
    // =========================
    // RATE LIMIT
    // =========================

    const ip = getClientIp(req);

    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({
          error:
            "Santai bro 😭 Lu terlalu banyak request. Tunggu sekitar 1 jam eh 1 menit sebelum spam Lauky lagi.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }

    // =========================
    // API KEY
    // =========================

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY belum di-set di server.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // =========================
    // REQUEST BODY
    // =========================

    const body = await req.json();
    const messages: ChatMessage[] = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Format pesan tidak valid.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // =========================
    // GEMINI CONTENTS
    // =========================

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: message.content,
        },
      ],
    }));

    // =========================
    // GEMINI API
    // =========================

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: LAUKY_SYSTEM_PROMPT,
              },
            ],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 500,
          },
        }),
      }
    );

    const data = await response.json();

    // =========================
    // GEMINI ERROR
    // =========================

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
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // =========================
    // AMBIL JAWABAN
    // =========================

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("") || "";

    if (!text) {
      return new Response(
        JSON.stringify({
          error: "Gemini tidak memberikan jawaban.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
