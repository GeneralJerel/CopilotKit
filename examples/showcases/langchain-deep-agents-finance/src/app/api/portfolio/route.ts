import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const portfolios = await prisma.portfolio.findMany({
    include: { holdings: true, analyses: { orderBy: { startedAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(portfolios);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, holdings } = body;

  const portfolio = await prisma.portfolio.create({
    data: {
      name,
      description,
      holdings: {
        create: holdings.map(
          (h: { ticker: string; name?: string; sector: string; weight: number; shares: number; costBasis?: number }) => ({
            ticker: h.ticker,
            name: h.name,
            sector: h.sector,
            weight: h.weight,
            shares: h.shares,
            costBasis: h.costBasis,
          })
        ),
      },
    },
    include: { holdings: true },
  });

  return NextResponse.json(portfolio, { status: 201 });
}
