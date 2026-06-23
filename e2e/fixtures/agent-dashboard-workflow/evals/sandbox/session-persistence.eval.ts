import { defineEval } from "eve/evals";

const PERSIST_TOKEN = "dash-persist-ok-D6L";
const PERSIST_PATH = "/workspace/persist-note.txt";

export default defineEval({
  description: "Dashboard sandbox: workspace filesystem persists across turns.",
  async test(t) {
    const first = await t.send(
      `Run the bash command \`printf %s ${PERSIST_TOKEN} > ${PERSIST_PATH}\`. ` +
        "Reply with the single word: done.",
    );
    first.expectOk();
    const firstSessionId = t.sessionId;

    const second = await t.send(
      `Run the bash command \`cat ${PERSIST_PATH}\` and reply with the file contents verbatim.`,
    );
    second.expectOk();

    if (t.sessionId !== firstSessionId) {
      throw new Error(
        `Expected both turns in one session; got ${String(firstSessionId)} then ${String(t.sessionId)}.`,
      );
    }

    t.didNotFail();
    t.completed();
    t.calledTool("bash", {
      isError: false,
      output: new RegExp(PERSIST_TOKEN),
    });
    t.messageIncludes(PERSIST_TOKEN);
  },
});
