import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Dashboard sandbox: report_metrics tool writes execution metrics for dashboard display.",
  async test(t) {
    const turn = await t.send(
      "Use the `report_metrics` tool to report an execution with:\n" +
        '- executionId: "eval-001"\n' +
        '- command: "python test.py"\n' +
        "- exitCode: 0\n" +
        "- executionTimeMs: 150\n" +
        "Reply with a summary of what was reported.",
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("report_metrics", {
      input: {
        executionId: "eval-001",
        command: "python test.py",
        exitCode: 0,
        executionTimeMs: 150,
      },
      isError: false,
      output: { reported: true },
    });
    t.messageIncludes("eval-001");
    t.messageIncludes("success");
  },
});
