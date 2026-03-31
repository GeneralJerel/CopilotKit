import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    include: {
      holdings: true,
      analyses: {
        orderBy: { startedAt: "desc" },
        include: {
          scenarios: true,
          memo: true,
          correlation: true,
        },
      },
    },
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  return NextResponse.json(portfolio);
}
