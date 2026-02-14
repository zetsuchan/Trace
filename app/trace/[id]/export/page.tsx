import { VisitCard } from "@/components/visit-card";

export default async function ExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <a
        href={`/trace/${id}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        &larr; Back to trace
      </a>

      <VisitCard traceId={id} />
    </div>
  );
}
