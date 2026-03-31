"use client";

import { useCoagentStateRender } from "@copilotkit/react-core";
import { FinSightAgentState } from "@/lib/types";

const DEFAULT_STATE: FinSightAgentState = {
  currentStep: "idle",
  todos: [],
  portfolio: null,
  risk: null,
  scenarios: null,
  correlation: null,
  memo: null,
};

export function useFinSightState() {
  const { state } = useCoagentStateRender<FinSightAgentState>({
    name: "finsight_analyst",
    render: () => {
      return null;
    },
  });

  return state ?? DEFAULT_STATE;
}
