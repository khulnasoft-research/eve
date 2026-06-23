import { defineEval } from "eve/evals";

import { CLI_NAME, CLI_TOKEN } from "./shared.js";

export default defineEval({
  description: "Dashboard sandbox: custom CLI installed in bootstrap is on the PATH.",
  async test(t) {
    const turn = await t.send(
      `Run the bash command \`${CLI_NAME} sandbox\` and reply with its output verbatim.`,
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("bash", {
      isError: false,
      output: new RegExp(`${CLI_TOKEN}:sandbox`),
    });
    t.messageIncludes(`${CLI_TOKEN}:sandbox`);
  },
});
