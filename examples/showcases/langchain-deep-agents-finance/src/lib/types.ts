export type AnalysisStep =
  | "idle"
  | "parsing"
  | "heatmap"
  | "risk"
  | "scenarios"
  | "correlation"
  | "memo"
  | "approval"
  | "complete";

export interface HoldingData {
  ticker: string;
  name: string;
  sector: string;
  weight: number;
  riskScore: number;
  change24h: number;
}

export interface RiskBreakdown {
  category: string;
  score: number;
  weight: number;
  detail: string;
}

export interface RiskData {
  overallScore: number;
  beta: number;
  sharpe: number;
  varDaily: number;
  breakdown: RiskBreakdown[];
  recommendation: string;
}

export interface ScenarioData {
  name: string;
  description: string;
  projectedReturn: number;
  varDelta: number;
  sharpeDelta: number;
  impactedHoldings: Array<{ ticker: string; projectedChange: number }>;
  probability: number;
}

export interface CorrelationData {
  tickers: string[];
  matrix: number[][];
  sectorFilter: string | null;
}

export interface MemoSection {
  heading: string;
  body: string;
}

export interface MemoData {
  title: string;
  date: string;
  sections: MemoSection[];
  riskRating: string;
  recommendation: string;
  status: "draft" | "approved" | "revision_requested";
  revisionCount: number;
}

export interface TodoItem {
  task: string;
  status: "pending" | "in_progress" | "done";
}

export interface FinSightAgentState {
  currentStep: AnalysisStep;
  todos: TodoItem[];
  portfolio: {
    name: string;
    holdingsCount: number;
    totalSectors: number;
    holdings: HoldingData[];
  } | null;
  risk: RiskData | null;
  scenarios: ScenarioData[] | null;
  correlation: CorrelationData | null;
  memo: MemoData | null;
}
