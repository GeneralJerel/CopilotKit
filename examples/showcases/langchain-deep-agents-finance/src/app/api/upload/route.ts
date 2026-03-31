import { NextRequest, NextResponse } from "next/server";

interface ParsedHolding {
  ticker: string;
  name: string;
  shares: number;
  sector: string;
  costBasis: number;
}

function parseCSV(text: string): ParsedHolding[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const tickerIdx = headers.indexOf("ticker");
  const nameIdx = headers.indexOf("name");
  const sharesIdx = headers.indexOf("shares");
  const sectorIdx = headers.indexOf("sector");
  const costIdx = headers.findIndex((h) => h.includes("cost"));

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return {
      ticker: cols[tickerIdx] || "",
      name: cols[nameIdx] || "",
      shares: parseFloat(cols[sharesIdx]) || 0,
      sector: cols[sectorIdx] || "Other",
      costBasis: parseFloat(cols[costIdx]) || 0,
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const holdings = parseCSV(text);

    if (holdings.length === 0) {
      return NextResponse.json({ error: "No holdings found in CSV" }, { status: 400 });
    }

    // Compute weights from shares * cost basis
    const totalValue = holdings.reduce((sum, h) => sum + h.shares * h.costBasis, 0);
    const enriched = holdings.map((h) => ({
      ...h,
      weight: totalValue > 0 ? (h.shares * h.costBasis) / totalValue : 1 / holdings.length,
    }));

    return NextResponse.json({
      success: true,
      holdingsCount: enriched.length,
      holdings: enriched,
      filename: file.name,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
