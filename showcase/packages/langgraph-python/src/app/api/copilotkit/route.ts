import { NextRequest } from "next/server";
import {
    CopilotRuntime,
    ExperimentalEmptyAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

const LANGGRAPH_URL =
    process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123";

const defaultAgent = new LangGraphAgent({
    deploymentUrl: LANGGRAPH_URL,
    graphId: "sample_agent",
    langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
});

export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        endpoint: "/api/copilotkit",
        serviceAdapter: new ExperimentalEmptyAdapter(),
        runtime: new CopilotRuntime({
            agents: { default: defaultAgent },
        }),
    });

    return handleRequest(req);
};
