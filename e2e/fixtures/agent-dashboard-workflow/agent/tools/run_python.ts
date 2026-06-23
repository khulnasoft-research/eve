import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description:
    "Executes a Python expression in the sandbox and returns the result. " +
    "Only call when the user explicitly asks to run Python.",
  inputSchema: z.object({
    expression: z.string().describe("Python expression to evaluate."),
  }),
  async execute({ expression }, ctx) {
    const sandbox = await ctx.getSandbox();
    const script = [
      "import json, sys",
      `result = eval(${JSON.stringify(expression)})`,
      "json.dump({'result': result}, sys.stdout)",
      "",
    ].join("\n");
    const scriptPath = "eval_expr.py";
    await sandbox.writeTextFile({ path: scriptPath, content: script });
    const result = await sandbox.run({
      command: `python ${sandbox.resolvePath(scriptPath)}`,
    });
    if (result.exitCode !== 0) {
      throw new Error(`python exited ${result.exitCode}:\n${result.stderr}`);
    }
    return JSON.parse(result.stdout);
  },
});
