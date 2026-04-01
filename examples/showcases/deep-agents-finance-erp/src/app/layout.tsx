import type { Metadata } from "next";

import { CopilotKit } from "@copilotkit/react-core";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { Montserrat, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const montserrat = Montserrat({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "FinanceOS | Deep Agents ERP",
  description:
    "AI-powered enterprise resource planning dashboard with CopilotKit deep agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", montserrat.variable, playfairDisplayHeading.variable)}>
      <body className="antialiased">
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="finance_erp_agent"
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
