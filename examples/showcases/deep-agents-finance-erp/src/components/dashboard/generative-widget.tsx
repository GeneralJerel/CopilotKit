"use client";

import React, {
  Component,
  useState,
  useEffect,
  useMemo,
  useCallback,
  Fragment,
} from "react";
import type { ReactNode, ErrorInfo } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  Treemap,
  FunnelChart,
  Funnel,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { GenerativeWidget as GenerativeWidgetType } from "@/types/dashboard";

// --- Scope: everything the agent-generated code can access ---

const BASE_SCOPE = {
  // React
  React,
  useState,
  useEffect,
  useMemo,
  useCallback,
  Fragment,

  // Recharts — charts
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  Treemap,
  FunnelChart,
  Funnel,
  RadialBarChart,
  RadialBar,

  // Recharts — building blocks
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,

  // UI
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,

  // Utils
  formatCurrency,
  formatNumber,
};

// --- Error boundary for runtime render errors ---

interface ErrorBoundaryProps {
  children: ReactNode;
  title: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class GenerativeErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[GenerativeWidget] Runtime error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive text-sm">
              Widget failed to render
            </CardTitle>
            <CardDescription>{this.props.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground bg-muted rounded-md p-3 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

// --- Main component ---

const MAX_CODE_LENGTH = 10_000;

export function GenerativeWidget({
  config,
}: {
  config: GenerativeWidgetType["config"];
  colSpan?: 1 | 2 | 3 | 4;
}) {
  const { code, data, meta, title, subtitle } = config;

  // Build per-widget scope (data + meta injected)
  const scope = useMemo(
    () => ({
      ...BASE_SCOPE,
      data,
      meta: meta ?? { title, subtitle },
    }),
    [data, meta, title, subtitle],
  );

  if (!code || code.length > MAX_CODE_LENGTH) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {!code
              ? "No code provided for this widget."
              : "Generated code exceeds maximum allowed length."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <GenerativeErrorBoundary title={title}>
      <LiveProvider code={code} scope={scope} noInline={false}>
        <LivePreview />
        <LiveError className="text-xs text-destructive bg-destructive/10 rounded-md p-3 mt-2" />
      </LiveProvider>
    </GenerativeErrorBoundary>
  );
}
