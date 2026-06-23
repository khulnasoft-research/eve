import { defineEval } from "eve/evals";

export default defineEval({
  description: "Dashboard sandbox: run_python tool executes real Python in sandbox.",
  async test(t) {
    const turn = await t.send(
      "Use the `run_python` tool to evaluate the expression `[x*x for x in range(5)]`. " +
        "Reply with just the resulting list.",
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("run_python", {
      input: { expression: "[x*x for x in range(5)]" },
      isError: false,
      output: { result: [0, 1, 4, 9, 16] },
    });
    t.messageIncludes("0");
    t.messageIncludes("9");
  },
});
