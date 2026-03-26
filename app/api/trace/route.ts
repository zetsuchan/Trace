import { runTrace } from "@/lib/agents/orchestrator";
import { runQuickTrace } from "@/lib/agents/quick-trace";
import { getSession } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { inputText, mode } = await req.json();

  if (!inputText) {
    return new Response("Missing inputText", { status: 400 });
  }

  await logAudit({
    userId: user.id,
    action: "create_trace",
    metadata: { mode, inputTextLength: inputText.length },
    ipAddress: getClientIp(req),
  });

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
