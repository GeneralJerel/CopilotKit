import { NextRequest, NextResponse } from "next/server";
import {
    CopilotRuntime,
    ExperimentalEmptyAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

const LANGGRAPH_URL =
    process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123";

console.log("[copilotkit/route] Initializing CopilotKit runtime");
console.log(`[copilotkit/route] LANGGRAPH_URL: ${LANGGRAPH_URL}`);
console.log(`[copilotkit/route] LANGSMITH_API_KEY: ${process.env.LANGSMITH_API_KEY ? "set" : "not set"}`);

const defaultAgent = new LangGraphAgent({
    deploymentUrl: LANGGRAPH_URL,
    graphId: "sample_agent",
    langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
});

console.log("[copilotkit/route] LangGraphAgent created for graph: sample_agent");

export const POST = async (req: NextRequest) => {
    const url = req.url;
    const contentType = req.headers.get("content-type");
    console.log(`[copilotkit/route] POST ${url} (content-type: ${contentType})`);

    try {
        const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
            endpoint: "/api/copilotkit",
            serviceAdapter: new ExperimentalEmptyAdapter(),
            runtime: new CopilotRuntime({
                agents: { default: defaultAgent },
            }),
        });

        const response = await handleRequest(req);
        console.log(`[copilotkit/route] Response status: ${response.status}`);
        return response;
    } catch (error: any) {
        console.error(`[copilotkit/route] ERROR: ${error.message}`);
        console.error(`[copilotkit/route] Stack: ${error.stack}`);
        return NextResponse.json(
            { error: error.message, stack: error.stack },
            { status: 500 }
        );
    }
};

export const GET = async () => {
    console.log("[copilotkit/route] GET /api/copilotkit (health probe)");

    // Check if LangGraph server is reachable
    let langGraphStatus = "unknown";
    try {
        const res = await fetch(`${LANGGRAPH_URL}/ok`, { signal: AbortSignal.timeout(3000) });
        langGraphStatus = res.ok ? "reachable" : `error (${res.status})`;
    } catch (e: any) {
        langGraphStatus = `unreachable (${e.message})`;
    }

    return NextResponse.json({
        status: "ok",
        langgraph_url: LANGGRAPH_URL,
        langgraph_status: langGraphStatus,
        env: {
            OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "set" : "NOT SET",
            LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY ? "set" : "NOT SET",
            NODE_ENV: process.env.NODE_ENV,
        },
    });
};
