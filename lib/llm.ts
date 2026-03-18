import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ChatCompletionMessageFunctionToolCall } from "openai/resources/chat/completions";

// ── Provider config ─────────────────────────────
export type LLMProvider = "anthropic" | "openrouter";

export const provider: LLMProvider =
  (process.env.LLM_PROVIDER as LLMProvider) || "openrouter";

const OPENROUTER_DEFAULT_MODEL = "minimax/minimax-text-01";

export const openRouterModel =
  process.env.OPENROUTER_MODEL || OPENROUTER_DEFAULT_MODEL;

// Per-agent model overrides (all via OpenRouter)
export const openRouterCausalModel =
  process.env.OPENROUTER_CAUSAL_MODEL || "anthropic/claude-opus-4";

// ── Clients ─────────────────────────────────────
const anthropic = new Anthropic();

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ── Shared types ────────────────────────────────
export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LLMToolCall {
  id: string;
  name: string;
  input: Record<string, string>;
}

export interface LLMResponse {
  text: string;
  thinking?: string;
  toolCalls: LLMToolCall[];
  stopReason: "end" | "tool_use";
}

// ── Helpers ─────────────────────────────────────
function isFunctionToolCall(
  tc: OpenAI.Chat.ChatCompletionMessageToolCall,
): tc is ChatCompletionMessageFunctionToolCall {
  return tc.type === "function";
}

function parseFunctionToolCalls(
  toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] | undefined,
): LLMToolCall[] {
  return (toolCalls || []).filter(isFunctionToolCall).map((tc) => ({
    id: tc.id,
    name: tc.function.name,
    input: JSON.parse(tc.function.arguments) as Record<string, string>,
  }));
}

// ── Unified chat function ───────────────────────
export async function chat(params: {
  model?: string;
  system: string;
  messages: LLMMessage[];
  tools?: LLMTool[];
  maxTokens?: number;
  thinking?: boolean;
}): Promise<LLMResponse> {
  if (provider === "anthropic") {
    return chatAnthropic(params);
  }
  return chatOpenRouter(params);
}

// ── Anthropic implementation ────────────────────
async function chatAnthropic(params: {
  model?: string;
  system: string;
  messages: LLMMessage[];
  tools?: LLMTool[];
  maxTokens?: number;
  thinking?: boolean;
}): Promise<LLMResponse> {
  const anthropicMessages: Anthropic.Messages.MessageParam[] = params.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const anthropicTools: Anthropic.Messages.Tool[] | undefined = params.tools?.map(
    (t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as Anthropic.Messages.Tool["input_schema"],
    }),
  );

  const createParams: Anthropic.Messages.MessageCreateParamsNonStreaming = {
    model: params.model || "claude-sonnet-4-5-20250929",
    max_tokens: params.maxTokens || 4000,
    system: params.system,
    messages: anthropicMessages,
  };

  if (anthropicTools?.length) {
    createParams.tools = anthropicTools;
  }

  if (params.thinking) {
    createParams.thinking = { type: "enabled", budget_tokens: 4000 };
    createParams.max_tokens = 16000;
  }

  const response = await anthropic.messages.create(createParams);

  let text = "";
  let thinking = "";
  const toolCalls: LLMToolCall[] = [];

  for (const block of response.content) {
    if (block.type === "text") {
      text = block.text;
    } else if (block.type === "thinking") {
      thinking = block.thinking;
    } else if (block.type === "tool_use") {
      toolCalls.push({
        id: block.id,
        name: block.name,
        input: block.input as Record<string, string>,
      });
    }
  }

  return {
    text,
    thinking: thinking || undefined,
    toolCalls,
    stopReason: response.stop_reason === "tool_use" ? "tool_use" : "end",
  };
}

// ── OpenRouter implementation ───────────────────
async function chatOpenRouter(params: {
  model?: string;
  system: string;
  messages: LLMMessage[];
  tools?: LLMTool[];
  maxTokens?: number;
}): Promise<LLMResponse> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: params.system },
    ...params.messages.map(
      (m) =>
        ({
          role: m.role,
          content: m.content,
        }) as OpenAI.Chat.ChatCompletionMessageParam,
    ),
  ];

  const tools: OpenAI.Chat.ChatCompletionTool[] | undefined = params.tools?.map(
    (t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }),
  );

  const createParams: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model: params.model || openRouterModel,
    max_tokens: params.maxTokens || 4000,
    messages,
  };

  if (tools?.length) {
    createParams.tools = tools;
  }

  const response = await openrouter.chat.completions.create(createParams);

  const choice = response.choices[0];
  const text = choice.message.content || "";
  const toolCalls = parseFunctionToolCalls(choice.message.tool_calls);

  return {
    text,
    toolCalls,
    stopReason: choice.finish_reason === "tool_calls" ? "tool_use" : "end",
  };
}

// ── Tool-loop chat (for agentic flows) ──────────
export async function chatWithTools(params: {
  model?: string;
  system: string;
  userMessage: string;
  tools: LLMTool[];
  maxTokens?: number;
  thinking?: boolean;
  executeTool: (name: string, input: Record<string, string>) => Promise<string>;
}): Promise<LLMResponse> {
  if (provider === "anthropic") {
    return toolLoopAnthropic(params);
  }
  return toolLoopOpenRouter(params);
}

// ── Anthropic tool loop ─────────────────────────
async function toolLoopAnthropic(params: {
  model?: string;
  system: string;
  userMessage: string;
  tools: LLMTool[];
  maxTokens?: number;
  thinking?: boolean;
  executeTool: (name: string, input: Record<string, string>) => Promise<string>;
}): Promise<LLMResponse> {
  const anthropicTools: Anthropic.Messages.Tool[] = params.tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters as Anthropic.Messages.Tool["input_schema"],
  }));

  const createParams: Anthropic.Messages.MessageCreateParamsNonStreaming = {
    model: params.model || "claude-sonnet-4-5-20250929",
    max_tokens: params.maxTokens || 16000,
    system: params.system,
    tools: anthropicTools,
    messages: [],
  };

  if (params.thinking) {
    createParams.thinking = { type: "enabled", budget_tokens: 4000 };
  }

  let messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: params.userMessage },
  ];

  let response = await anthropic.messages.create({
    ...createParams,
    messages,
  });

  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const result = await params.executeTool(
        block.name,
        block.input as Record<string, string>,
      );
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
    }

    messages = [
      ...messages,
      { role: "assistant", content: response.content as Anthropic.Messages.ContentBlockParam[] },
      { role: "user", content: toolResults },
    ];

    response = await anthropic.messages.create({
      ...createParams,
      messages,
    });
  }

  let text = "";
  let thinking = "";
  for (const block of response.content) {
    if (block.type === "text") text = block.text;
    else if (block.type === "thinking") thinking = block.thinking;
  }

  return { text, thinking: thinking || undefined, toolCalls: [], stopReason: "end" };
}

// ── OpenRouter tool loop ────────────────────────
async function toolLoopOpenRouter(params: {
  model?: string;
  system: string;
  userMessage: string;
  tools: LLMTool[];
  maxTokens?: number;
  executeTool: (name: string, input: Record<string, string>) => Promise<string>;
}): Promise<LLMResponse> {
  const tools: OpenAI.Chat.ChatCompletionTool[] = params.tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: params.system },
    { role: "user", content: params.userMessage },
  ];

  let response = await openrouter.chat.completions.create({
    model: params.model || openRouterModel,
    max_tokens: params.maxTokens || 16000,
    messages,
    tools,
  });

  let choice = response.choices[0];

  while (choice.finish_reason === "tool_calls") {
    messages.push(choice.message);

    for (const tc of (choice.message.tool_calls || []).filter(isFunctionToolCall)) {
      const input = JSON.parse(tc.function.arguments) as Record<string, string>;
      const result = await params.executeTool(tc.function.name, input);
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }

    response = await openrouter.chat.completions.create({
      model: params.model || openRouterModel,
      max_tokens: params.maxTokens || 16000,
      messages,
      tools,
    });
    choice = response.choices[0];
  }

  return {
    text: choice.message.content || "",
    toolCalls: [],
    stopReason: "end",
  };
}
