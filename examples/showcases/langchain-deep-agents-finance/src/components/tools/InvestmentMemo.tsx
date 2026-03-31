"use client";

import { motion } from "framer-motion";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApprovalButtons } from "@/components/ui/ApprovalButtons";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

interface MemoArgs {
  title?: string;
  date?: string;
  sections?: Array<{ heading: string; body: string }>;
  riskRating?: string;
  recommendation?: string;
  requiresApproval?: boolean;
}

interface Props {
  status: string;
  memo?: MemoArgs;
}

export function InvestmentMemo({ status, memo }: Props) {
  const [approved, setApproved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  if (status === "inProgress" || !memo) {
    return (
      <div className="rounded-lg border border-border bg-cream-warm p-6 space-y-4">
        <div className="skeleton-pulse h-6 w-2/3 rounded bg-cream-dark" />
        <div className="skeleton-pulse h-3 w-1/4 rounded bg-cream-dark" />
        <div className="border-t border-border pt-4">
          <SkeletonLoader rows={5} />
        </div>
      </div>
    );
  }

  function handleApprove() {
    setApproved(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  }

  function handleRequestChanges(feedback: string) {
    console.log("Revision requested:", feedback);
    // In a full implementation, this would trigger useInterrupt
  }

  return (
    <div className="relative rounded-lg border border-border bg-cream-warm p-6 space-y-5">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="confetti-particle absolute w-2 h-2 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: "-8px",
                backgroundColor: ["#C4A961", "#2D5A3D", "#8B3A3A", "#64645F"][i % 4],
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <div>
        <h2 className="font-serif text-xl font-600 text-slate-dark">
          {memo.title}
        </h2>
        {memo.date && (
          <p className="text-xs text-slate-text mt-1">{memo.date}</p>
        )}
      </div>

      {/* Sections */}
      {memo.sections?.map((section, i) => (
        <motion.div
          key={section.heading}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.4, duration: 0.4 }}
          className="space-y-2"
        >
          <h3 className="font-serif text-base font-500 text-slate-dark">
            {section.heading}
          </h3>
          <div className="prose prose-sm max-w-none text-[13px] text-slate-text leading-[1.7]">
            <ReactMarkdown>{section.body}</ReactMarkdown>
          </div>
        </motion.div>
      ))}

      {/* Rating & recommendation badges */}
      <div className="flex items-center gap-3 border-t border-border pt-4">
        {memo.riskRating && <StatusBadge status={memo.riskRating} />}
        {memo.recommendation && (
          <span className="rounded-full border border-forest/30 bg-forest/5 px-2.5 py-0.5 text-xs font-semibold text-forest">
            {memo.recommendation}
          </span>
        )}
      </div>

      {/* Approval */}
      {memo.requiresApproval && !approved && (
        <div className="border-t border-border pt-4">
          <ApprovalButtons
            onApprove={handleApprove}
            onRequestChanges={handleRequestChanges}
          />
        </div>
      )}

      {approved && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 border-t border-border pt-4"
        >
          <span className="text-forest text-lg">&#10003;</span>
          <span className="text-sm font-semibold text-forest">
            Memo approved and saved
          </span>
        </motion.div>
      )}
    </div>
  );
}
