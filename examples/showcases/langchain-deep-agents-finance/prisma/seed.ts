import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PORTFOLIOS = [
  {
    name: "Tech-Heavy Growth",
    description: "Concentrated technology portfolio with 60% tech allocation",
    holdings: [
      { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", weight: 0.12, shares: 150, costBasis: 142.5 },
      { ticker: "MSFT", name: "Microsoft Corporation", sector: "Technology", weight: 0.11, shares: 120, costBasis: 378.2 },
      { ticker: "NVDA", name: "NVIDIA Corporation", sector: "Technology", weight: 0.10, shares: 80, costBasis: 485.6 },
      { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Technology", weight: 0.08, shares: 45, costBasis: 141.8 },
      { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary", weight: 0.07, shares: 60, costBasis: 178.9 },
      { ticker: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials", weight: 0.06, shares: 100, costBasis: 195.4 },
      { ticker: "V", name: "Visa Inc.", sector: "Financials", weight: 0.05, shares: 70, costBasis: 275.3 },
      { ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare", weight: 0.05, shares: 35, costBasis: 520.15 },
      { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", weight: 0.04, shares: 90, costBasis: 156.8 },
      { ticker: "PFE", name: "Pfizer Inc.", sector: "Healthcare", weight: 0.03, shares: 200, costBasis: 28.45 },
      { ticker: "XOM", name: "Exxon Mobil Corporation", sector: "Energy", weight: 0.04, shares: 110, costBasis: 104.2 },
      { ticker: "CVX", name: "Chevron Corporation", sector: "Energy", weight: 0.03, shares: 65, costBasis: 155.7 },
      { ticker: "PG", name: "Procter & Gamble Co.", sector: "Consumer Staples", weight: 0.03, shares: 80, costBasis: 162.3 },
      { ticker: "KO", name: "The Coca-Cola Company", sector: "Consumer Staples", weight: 0.02, shares: 150, costBasis: 59.8 },
      { ticker: "PEP", name: "PepsiCo Inc.", sector: "Consumer Staples", weight: 0.02, shares: 60, costBasis: 172.4 },
      { ticker: "NEE", name: "NextEra Energy Inc.", sector: "Utilities", weight: 0.02, shares: 95, costBasis: 72.5 },
      { ticker: "DUK", name: "Duke Energy Corporation", sector: "Utilities", weight: 0.02, shares: 75, costBasis: 98.6 },
      { ticker: "AMT", name: "American Tower Corporation", sector: "Real Estate", weight: 0.02, shares: 40, costBasis: 198.7 },
      { ticker: "PLD", name: "Prologis Inc.", sector: "Real Estate", weight: 0.02, shares: 55, costBasis: 124.5 },
      { ticker: "BND", name: "Vanguard Total Bond ETF", sector: "Fixed Income", weight: 0.02, shares: 200, costBasis: 72.8 },
      { ticker: "TLT", name: "iShares 20+ Year Treasury", sector: "Fixed Income", weight: 0.01, shares: 100, costBasis: 92.4 },
      { ticker: "GLD", name: "SPDR Gold Shares", sector: "Commodities", weight: 0.01, shares: 50, costBasis: 185.6 },
      { ticker: "VWO", name: "Vanguard FTSE Emerging Markets", sector: "International", weight: 0.01, shares: 120, costBasis: 42.3 },
      { ticker: "IEFA", name: "iShares Core MSCI EAFE", sector: "International", weight: 0.01, shares: 100, costBasis: 72.9 },
      { ticker: "VNQ", name: "Vanguard Real Estate ETF", sector: "Real Estate", weight: 0.01, shares: 80, costBasis: 84.2 },
    ],
  },
  {
    name: "Balanced Moderate",
    description: "Well-diversified across sectors with even allocation",
    holdings: [
      { ticker: "VTI", name: "Vanguard Total Stock Market", sector: "Broad Market", weight: 0.20, shares: 200, costBasis: 245.0 },
      { ticker: "VXUS", name: "Vanguard Total International", sector: "International", weight: 0.15, shares: 180, costBasis: 58.5 },
      { ticker: "BND", name: "Vanguard Total Bond ETF", sector: "Fixed Income", weight: 0.15, shares: 300, costBasis: 72.8 },
      { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", weight: 0.08, shares: 50, costBasis: 142.5 },
      { ticker: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials", weight: 0.07, shares: 60, costBasis: 195.4 },
      { ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare", weight: 0.07, shares: 20, costBasis: 520.15 },
      { ticker: "XOM", name: "Exxon Mobil Corporation", sector: "Energy", weight: 0.06, shares: 80, costBasis: 104.2 },
      { ticker: "PG", name: "Procter & Gamble Co.", sector: "Consumer Staples", weight: 0.06, shares: 60, costBasis: 162.3 },
      { ticker: "NEE", name: "NextEra Energy Inc.", sector: "Utilities", weight: 0.05, shares: 90, costBasis: 72.5 },
      { ticker: "AMT", name: "American Tower Corporation", sector: "Real Estate", weight: 0.05, shares: 30, costBasis: 198.7 },
      { ticker: "GLD", name: "SPDR Gold Shares", sector: "Commodities", weight: 0.06, shares: 40, costBasis: 185.6 },
    ],
  },
  {
    name: "Defensive Income",
    description: "Low-risk portfolio focused on utilities, healthcare, and dividends",
    holdings: [
      { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", weight: 0.12, shares: 120, costBasis: 156.8 },
      { ticker: "PG", name: "Procter & Gamble Co.", sector: "Consumer Staples", weight: 0.11, shares: 100, costBasis: 162.3 },
      { ticker: "KO", name: "The Coca-Cola Company", sector: "Consumer Staples", weight: 0.10, shares: 250, costBasis: 59.8 },
      { ticker: "NEE", name: "NextEra Energy Inc.", sector: "Utilities", weight: 0.10, shares: 180, costBasis: 72.5 },
      { ticker: "DUK", name: "Duke Energy Corporation", sector: "Utilities", weight: 0.09, shares: 140, costBasis: 98.6 },
      { ticker: "SO", name: "Southern Company", sector: "Utilities", weight: 0.08, shares: 150, costBasis: 78.4 },
      { ticker: "PFE", name: "Pfizer Inc.", sector: "Healthcare", weight: 0.08, shares: 400, costBasis: 28.45 },
      { ticker: "BND", name: "Vanguard Total Bond ETF", sector: "Fixed Income", weight: 0.12, shares: 250, costBasis: 72.8 },
      { ticker: "TLT", name: "iShares 20+ Year Treasury", sector: "Fixed Income", weight: 0.10, shares: 160, costBasis: 92.4 },
      { ticker: "VNQ", name: "Vanguard Real Estate ETF", sector: "Real Estate", weight: 0.10, shares: 150, costBasis: 84.2 },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const portfolio of DEMO_PORTFOLIOS) {
    await prisma.portfolio.create({
      data: {
        name: portfolio.name,
        description: portfolio.description,
        holdings: {
          create: portfolio.holdings,
        },
      },
    });
    console.log(`  Created portfolio: ${portfolio.name}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
