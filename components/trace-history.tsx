"use client";

export function TraceHistory() {
  // TODO: Fetch recent traces from DB
  const traces: { id: string; inputText: string; createdAt: string }[] = [];

  if (traces.length === 0) return null;

  return (
    <div className="w-full max-w-lg">
      <h2 className="mb-3 text-sm font-medium text-text-secondary">
        Recent traces
      </h2>
      <ul className="flex flex-col gap-2">
        {traces.map((trace) => (
          <li key={trace.id}>
            <a
              href={`/trace/${trace.id}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-chain-connection" />
              <span className="truncate">{trace.inputText}</span>
              <span className="ml-auto shrink-0 text-xs text-text-tertiary">
                {trace.createdAt}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
