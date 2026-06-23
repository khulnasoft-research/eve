import { defineEval } from "eve/evals";

import { BOOTSTRAP_MARKER_PATH, BOOTSTRAP_MARKER_TOKEN } from "./shared.js";

export default defineEval({
  description: "Dashboard sandbox: bootstrap writes marker file before session start.",
  async test(t) {
    const turn = await t.send(
      `Run the bash command \`cat ${BOOTSTRAP_MARKER_PATH}\` and reply with the file contents verbatim.`,
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("bash", {
      isError: false,
      output: new RegExp(BOOTSTRAP_MARKER_TOKEN),
    });
  },
});
