import { Suspense } from "react";
import { TraceContent } from "./trace-content";

export default function TracePage() {
  return (
    <Suspense>
      <TraceContent />
    </Suspense>
  );
}
