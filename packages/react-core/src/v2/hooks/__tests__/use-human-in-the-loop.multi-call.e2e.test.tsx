import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useHumanInTheLoop } from "../use-human-in-the-loop";
import type { ReactHumanInTheLoop } from "../../types";
import { ToolCallStatus } from "@copilotkit/core";
import { CopilotChat } from "../../components/chat/CopilotChat";
import {
  MockStepwiseAgent,
  renderWithCopilotKit,
  runStartedEvent,
  runFinishedEvent,
  toolCallChunkEvent,
  testId,
} from "../../__tests__/utils/test-helpers";

// Regression coverage for two reported HITL bugs found in the banking demo:
//   1. Multiple PARALLEL tool calls to the SAME useHumanInTheLoop tool in one
//      assistant message must each be independently answerable (no wedge).
//   2. A HITL tool whose zod parameters contain an array field must render its
//      args (the array must survive arg parsing), not an empty slot.
describe("useHumanInTheLoop E2E - multiple calls to the same tool", () => {
  it("lets the user answer each of N parallel calls to the SAME HITL tool", async () => {
    const agent = new MockStepwiseAgent();

    const ParallelHITL: React.FC = () => {
      const tool: ReactHumanInTheLoop<{ which: string }> = {
        name: "approve",
        description: "Approve one item",
        parameters: z.object({ which: z.string() }),
        render: ({ status, args, respond }) => (
          <div data-testid={`tool-${args.which ?? "x"}`}>
            <span data-testid={`status-${args.which ?? "x"}`}>{status}</span>
            {respond && (
              <button
                data-testid={`respond-${args.which ?? "x"}`}
                onClick={() => respond(`done-${args.which}`)}
              >
                Approve {args.which}
              </button>
            )}
          </div>
        ),
      };
      useHumanInTheLoop(tool);
      return null;
    };

    renderWithCopilotKit({
      agent,
      children: (
        <>
          <ParallelHITL />
          <div style={{ height: 400 }}>
            <CopilotChat welcomeScreen={false} />
          </div>
        </>
      ),
    });

    const input = await screen.findByRole("textbox");
    fireEvent.change(input, { target: { value: "approve all" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("approve all")).toBeDefined();
    });

    const messageId = testId("msg");

    // One assistant message, three parallel calls to the SAME tool.
    agent.emit(runStartedEvent());
    for (const which of ["a", "b", "c"]) {
      agent.emit(
        toolCallChunkEvent({
          toolCallId: testId(`tc-${which}`),
          toolCallName: "approve",
          parentMessageId: messageId,
          delta: JSON.stringify({ which }),
        }),
      );
    }
    agent.emit(runFinishedEvent());
    agent.complete();

    // Tool calls execute one at a time (HITL handlers block on respond), but
    // every call must eventually become answerable and complete.
    await waitFor(() => {
      expect(screen.getByTestId("status-a").textContent).toBe(
        ToolCallStatus.Executing,
      );
    });
    fireEvent.click(screen.getByTestId("respond-a"));

    await waitFor(() => {
      expect(screen.getByTestId("status-a").textContent).toBe(
        ToolCallStatus.Complete,
      );
      expect(screen.getByTestId("status-b").textContent).toBe(
        ToolCallStatus.Executing,
      );
    });
    fireEvent.click(screen.getByTestId("respond-b"));

    await waitFor(() => {
      expect(screen.getByTestId("status-b").textContent).toBe(
        ToolCallStatus.Complete,
      );
      expect(screen.getByTestId("status-c").textContent).toBe(
        ToolCallStatus.Executing,
      );
    });
    fireEvent.click(screen.getByTestId("respond-c"));

    await waitFor(() => {
      expect(screen.getByTestId("status-c").textContent).toBe(
        ToolCallStatus.Complete,
      );
    });
  });

  it("renders a HITL tool whose args contain an array field", async () => {
    const agent = new MockStepwiseAgent();

    const ArrayHITL: React.FC = () => {
      const tool: ReactHumanInTheLoop<{ ids: string[] }> = {
        name: "approveMany",
        description: "Approve many items",
        parameters: z.object({ ids: z.array(z.string()) }),
        render: ({ status, args, respond }) => (
          <div data-testid="many">
            <span data-testid="many-status">{status}</span>
            <span data-testid="many-count">{args.ids?.length ?? -1}</span>
            {respond && (
              <button data-testid="many-respond" onClick={() => respond("ok")}>
                Approve
              </button>
            )}
          </div>
        ),
      };
      useHumanInTheLoop(tool);
      return null;
    };

    renderWithCopilotKit({
      agent,
      children: (
        <>
          <ArrayHITL />
          <div style={{ height: 400 }}>
            <CopilotChat welcomeScreen={false} />
          </div>
        </>
      ),
    });

    const input = await screen.findByRole("textbox");
    fireEvent.change(input, { target: { value: "approve many" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("approve many")).toBeDefined();
    });

    const messageId = testId("msg");

    agent.emit(runStartedEvent());
    agent.emit(
      toolCallChunkEvent({
        toolCallId: testId("tc"),
        toolCallName: "approveMany",
        parentMessageId: messageId,
        delta: JSON.stringify({ ids: ["t-1", "t-2", "t-3"] }),
      }),
    );

    // The array field must survive parsing and reach the render.
    await waitFor(() => {
      expect(screen.getByTestId("many-count").textContent).toBe("3");
    });

    agent.emit(runFinishedEvent());
    agent.complete();

    await waitFor(() => {
      expect(screen.getByTestId("many-status").textContent).toBe(
        ToolCallStatus.Executing,
      );
      expect(screen.getByTestId("many-count").textContent).toBe("3");
    });
  });
});
