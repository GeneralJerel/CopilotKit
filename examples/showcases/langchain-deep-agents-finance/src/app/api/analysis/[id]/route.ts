import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const analysis = await prisma.analysisRun.findUnique({
    where: { id },
    include: {
      portfolio: { include: { holdings: true } },
      scenarios: true,
      memo: true,
      correlation: true,
    },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  return NextResponse.json(analysis);
}
