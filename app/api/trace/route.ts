import { runTrace } from "@/lib/agents/orchestrator";
import { runQuickTrace } from "@/lib/agents/quick-trace";

export async function POST(req: Request) {
  const { inputText, mode } = await req.json();

  if (!inputText) {
    return new Response("Missing inputText", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        if (mode === "quick") {
          await runQuickTrace(inputText, send);
        } else {
          await runTrace(inputText, send);
        }
        send("done", { success: true });
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
