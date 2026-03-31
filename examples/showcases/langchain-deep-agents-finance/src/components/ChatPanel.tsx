"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useFrontendTool } from "@copilotkit/react-core";
import { PortfolioHeatmap } from "@/components/tools/PortfolioHeatmap";
import { RiskGauge } from "@/components/tools/RiskGauge";
import { ScenarioCards } from "@/components/tools/ScenarioCards";
import { CorrelationMatrix } from "@/components/tools/CorrelationMatrix";
import { InvestmentMemo } from "@/components/tools/InvestmentMemo";

export function ChatPanel() {
  // Tool 1: Portfolio Heatmap
  useFrontendTool({
    name: "renderPortfolioHeatmap",
    description:
      "Display portfolio holdings as an interactive treemap heatmap, colored by risk and sized by weight",
    parameters: [
      {
        name: "holdings",
        type: "object[]",
        description: "Array of holding objects",
        attributes: [
          { name: "ticker", type: "string", description: "Stock ticker symbol" },
          { name: "name", type: "string", description: "Company name" },
          { name: "sector", type: "string", description: "Market sector" },
          { name: "weight", type: "number", description: "Portfolio weight as decimal (0-1)" },
          { name: "riskScore", type: "number", description: "Risk score 0-100" },
          { name: "change24h", type: "number", description: "24hr price change percentage" },
        ],
      },
    ],
    handler: async ({ holdings }) => {
      return { rendered: true, holdingsCount: holdings.length };
    },
    render: ({ status, args }) => {
      return <PortfolioHeatmap status={status} holdings={args?.holdings} />;
    },
  });

  // Tool 2: Risk Gauge
  useFrontendTool({
    name: "renderRiskGauge",
    description:
      "Display an animated risk gauge showing aggregate portfolio risk score with factor breakdown",
    parameters: [
      { name: "riskScore", type: "number", description: "Overall risk score 0-100" },
      {
        name: "breakdown",
        type: "object[]",
        description: "Risk factor breakdown",
        attributes: [
          { name: "category", type: "string", description: "Risk category name" },
          { name: "score", type: "number", description: "Category risk score 0-100" },
          { name: "weight", type: "number", description: "How much this category contributes" },
          { name: "detail", type: "string", description: "Explanation of this risk factor" },
        ],
      },
      { name: "recommendation", type: "string", description: "AI recommendation text" },
    ],
    handler: async ({ riskScore }) => {
      return { rendered: true, riskScore };
    },
    render: ({ status, args }) => {
      return (
        <RiskGauge
          status={status}
          score={args?.riskScore}
          breakdown={args?.breakdown}
          recommendation={args?.recommendation}
        />
      );
    },
  });

  // Tool 3: Scenario Analysis
  useFrontendTool({
    name: "renderScenarioAnalysis",
    description:
      "Display scenario analysis cards comparing recession, rate hike, and sector rotation impacts",
    parameters: [
      {
        name: "scenarios",
        type: "object[]",
        description: "Array of scenario results",
        attributes: [
          { name: "name", type: "string", description: "Scenario name" },
          { name: "description", type: "string", description: "Brief scenario description" },
          { name: "projectedReturn", type: "number", description: "Projected portfolio return change (%)" },
          { name: "varDelta", type: "number", description: "Change in Value at Risk (%)" },
          { name: "sharpeDelta", type: "number", description: "Change in Sharpe ratio" },
          {
            name: "impactedHoldings",
            type: "object[]",
            description: "Most impacted holdings",
            attributes: [
              { name: "ticker", type: "string", description: "Ticker symbol" },
              { name: "projectedChange", type: "number", description: "Projected change %" },
            ],
          },
          { name: "probability", type: "number", description: "Estimated scenario probability" },
        ],
      },
    ],
    handler: async ({ scenarios }) => {
      return { rendered: true, scenarioCount: scenarios.length };
    },
    render: ({ status, args }) => {
      return <ScenarioCards status={status} scenarios={args?.scenarios} />;
    },
  });

  // Tool 4: Correlation Matrix
  useFrontendTool({
    name: "renderCorrelationMatrix",
    description:
      "Display an interactive correlation matrix heatmap between portfolio holdings",
    parameters: [
      { name: "tickers", type: "string[]", description: "Array of ticker symbols (row/column labels)" },
      { name: "matrix", type: "number[][]", description: "2D array of correlation coefficients (-1 to 1)" },
      { name: "sectorFilter", type: "string", description: "If provided, only show holdings in this sector" },
    ],
    handler: async ({ tickers }) => {
      return { rendered: true, tickerCount: tickers.length };
    },
    render: ({ status, args }) => {
      return (
        <CorrelationMatrix
          status={status}
          tickers={args?.tickers}
          matrix={args?.matrix}
        />
      );
    },
  });

  // Tool 5: Investment Memo
  useFrontendTool({
    name: "renderInvestmentMemo",
    description:
      "Generate and display a structured investment memo with approval workflow",
    parameters: [
      { name: "title", type: "string", description: "Memo title" },
      { name: "date", type: "string", description: "Memo date" },
      {
        name: "sections",
        type: "object[]",
        description: "Memo sections",
        attributes: [
          { name: "heading", type: "string", description: "Section heading" },
          { name: "body", type: "string", description: "Section content (markdown)" },
        ],
      },
      { name: "riskRating", type: "string", description: "Overall risk rating: Low | Moderate | Elevated | High" },
      { name: "recommendation", type: "string", description: "Buy / Hold / Reduce / Sell recommendation" },
      { name: "requiresApproval", type: "boolean", description: "Whether to show approval buttons" },
    ],
    handler: async ({ title }) => {
      return { rendered: true, title };
    },
    render: ({ status, args }) => {
      return <InvestmentMemo status={status} memo={args} />;
    },
  });

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-cream-warm overflow-hidden">
      <div className="border-b border-border px-5 py-3">
        <h2 className="font-serif text-base font-600 text-slate-dark">
          Portfolio Analyst
        </h2>
        <p className="text-xs text-slate-text">
          Upload a portfolio CSV or describe your analysis needs
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <CopilotChat
          labels={{
            title: "FinSight Analyst",
            initial:
              'Try: "Analyze my portfolio for risk exposure and generate recommendations"',
          }}
        />
      </div>
    </div>
  );
}
