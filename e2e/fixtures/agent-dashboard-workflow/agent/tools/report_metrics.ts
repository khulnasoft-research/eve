import { defineTool } from "eve/tools";
import { z } from "zod";

/**
 * Simulates reporting sandbox execution metrics to the agent-dashboard
 * monitoring system. The tool captures execution duration, exit code, and
 * sandbox resource usage, structured in the same shape the dashboard API
 * exposes.
 */
export default defineTool({
  description:
    "Reports sandbox execution metrics to the monitoring system. " +
    "Records execution time, exit code, and resource usage for dashboard display.",
  inputSchema: z.object({
    executionId: z.string().describe("Unique execution identifier."),
    command: z.string().describe("The command that was executed."),
    exitCode: z.number().int().describe("Process exit code."),
    executionTimeMs: z.number().describe("Execution duration in milliseconds."),
  }),
  async execute(input, ctx) {
    const sandbox = await ctx.getSandbox();
    const metrics = {
      executionId: input.executionId,
      command: input.command,
      exitCode: input.exitCode,
      executionTimeMs: input.executionTimeMs,
      timestamp: new Date().toISOString(),
      sandboxId: sandbox.id,
      status: input.exitCode === 0 ? "success" : "failure",
    };
    const reportPath = `/workspace/metrics/${input.executionId}.json`;
    await sandbox.writeTextFile({
      path: reportPath,
      content: JSON.stringify(metrics, null, 2),
    });
    return { reported: true, reportPath, metrics };
  },
});
