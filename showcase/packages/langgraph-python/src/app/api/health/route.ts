import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "ok",
        integration: "langgraph-python",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
    });
}
