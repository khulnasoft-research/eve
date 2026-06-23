import { defineEval } from "eve/evals";

import {
  SESSION_MARKER_PATH,
  SESSION_MARKER_TOKEN,
  WORKSPACE_SEED_PATH,
  WORKSPACE_SEED_TOKEN,
} from "./shared.js";

export default defineEval({
  description: "Dashboard sandbox: onSession marker and workspace seed are both present.",
  async test(t) {
    const turn = await t.send(
      `Run the bash command \`cat ${SESSION_MARKER_PATH} ${WORKSPACE_SEED_PATH}\` ` +
        "and reply with the combined file contents verbatim.",
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("bash", {
      isError: false,
      output: new RegExp(`${SESSION_MARKER_TOKEN}[\\s\\S]*${WORKSPACE_SEED_TOKEN}`),
    });
    t.messageIncludes(SESSION_MARKER_TOKEN);
    t.messageIncludes(WORKSPACE_SEED_TOKEN);
  },
});
