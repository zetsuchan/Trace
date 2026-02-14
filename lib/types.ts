// ─────────────────────────────────────────────
// TRACE — Core Domain Types
// ─────────────────────────────────────────────

export interface Patient {
  id: string;
  name?: string;
  genotype: "HbSS" | "HbSC" | "HbS-beta-thal-plus" | "HbS-beta-thal-zero";
  hbfLevel?: number;
  knownTriggers: string[];
  medications: Medication[];
  specialists: Specialist[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
}

export interface Specialist {
  type: string; // e.g., "hematologist", "ENT", "pulmonologist"
  name?: string;
}

export interface ChainNode {
  id: string;
  type: "symptom" | "mechanism" | "root-cause";
  title: string;
  description: string;
  bodySystem: string;
  confidence: number;
  citations?: Citation[];
  patientEvidence?: string;
}

export interface Citation {
  title: string;
  source: string;
  url?: string;
}

export interface ChainConnection {
  fromNodeId: string;
  toNodeId: string;
  mechanism: string;
  strength: "strong" | "moderate" | "possible";
}

// ─────────────────────────────────────────────
// Branching Investigation Types
// ─────────────────────────────────────────────

export interface InvestigationThread {
  id: string;
  title: string;
  category: "weather" | "hydration" | "sleep" | "breathing" | "activity" | "stress" | "medication" | "mechanism" | "root-cause" | "other";
  icon: string; // emoji
  description: string;
  confidence: number;
}

export interface InvestigationNode {
  id: string;
  type: "symptom" | "mechanism" | "root-cause" | "thread-start";
  title: string;
  description: string;
  bodySystem?: string;
  confidence: number;
  citations?: Citation[];
  patientEvidence?: string;
  // Branching structure
  children?: InvestigationNode[]; // Possible next branches
  threads?: InvestigationThread[]; // Available threads to explore
  mechanism?: string; // Connection mechanism from parent
}

export interface InvestigationState {
  symptomNode: InvestigationNode;
  investigatedPath: string[]; // IDs of nodes user chose
  currentNode: InvestigationNode | null;
  availableThreads: InvestigationThread[];
  isComplete: boolean;
  discoveredChain?: {
    nodes: InvestigationNode[];
    connections: string[]; // mechanism descriptions
    confidence: number;
  };
}

export interface CausalChain {
  id: string;
  nodes: ChainNode[];
  connections: ChainConnection[];
  overallConfidence: number;
  label: string;
}

export interface Trace {
  id: string;
  patientId: string;
  inputText: string;
  thinking: string;
  chains: CausalChain[];
  summary: string;
  suggestions: Suggestion[];
  weatherData?: WeatherContext;
  createdAt: Date;
}

export interface Suggestion {
  text: string;
  forDoctor: boolean;
  urgency: "info" | "discuss" | "urgent";
}

export interface WeatherContext {
  temperature: number;
  humidity: number;
  airQualityIndex: number;
  conditions: string;
  alerts?: string[];
}

// ─────────────────────────────────────────────
// SSE Event Types (server → client streaming)
// ─────────────────────────────────────────────

export type TraceStreamEvent =
  | { type: "thinking"; content: string }
  | { type: "tool_status"; tool: string; status: string }
  | { type: "chain"; chain: CausalChain }
  | { type: "summary"; content: string }
  | { type: "suggestions"; suggestions: Suggestion[] }
  | { type: "done"; traceId: string }
  | { type: "error"; message: string };
