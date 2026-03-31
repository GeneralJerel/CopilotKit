"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ApprovalButtonsProps {
  onApprove: () => void;
  onRequestChanges: (feedback: string) => void;
  disabled?: boolean;
}

export function ApprovalButtons({ onApprove, onRequestChanges, disabled }: ApprovalButtonsProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onApprove}
          disabled={disabled}
          className="flex-1 rounded-lg border border-gold bg-cream-warm px-4 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-gold/10 disabled:opacity-50"
        >
          Approve & Send
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFeedback(!showFeedback)}
          disabled={disabled}
          className="flex-1 rounded-lg border border-border bg-cream-warm px-4 py-2.5 text-sm font-semibold text-slate-text transition-colors hover:bg-cream-dark disabled:opacity-50"
        >
          Request Changes
        </motion.button>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe what should be changed..."
              className="w-full rounded-lg border border-border bg-cream-warm p-3 text-sm text-slate-dark placeholder:text-slate-text/50 focus:border-gold focus:outline-none"
              rows={3}
            />
            <button
              onClick={() => {
                onRequestChanges(feedback);
                setFeedback("");
                setShowFeedback(false);
              }}
              disabled={!feedback.trim()}
              className="mt-2 rounded-lg bg-slate-dark px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-slate-dark/80 disabled:opacity-50"
            >
              Submit Feedback
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
