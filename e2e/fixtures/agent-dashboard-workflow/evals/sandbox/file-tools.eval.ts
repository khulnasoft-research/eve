import { defineEval } from "eve/evals";

const FILE_TOOLS_TOKEN = "dash-file-tools-ok-Q2H";
const FILE_TOOLS_PATH = "/workspace/file-tools-note.txt";

export default defineEval({
  description: "Dashboard sandbox: built-in write_file/grep tools operate on sandbox filesystem.",
  async test(t) {
    const turn = await t.send(
      [
        `Use the write_file tool to create the file ${FILE_TOOLS_PATH} with exactly this content: ${FILE_TOOLS_TOKEN}`,
        `Then use the grep tool to search for ${FILE_TOOLS_TOKEN} under /workspace.`,
        "Reply with the matching line verbatim.",
      ].join("\n"),
    );
    turn.expectOk();

    t.didNotFail();
    t.completed();
    t.calledTool("write_file", { isError: false });
    t.calledTool("grep", {
      isError: false,
      output: new RegExp(FILE_TOOLS_TOKEN),
    });
    t.messageIncludes(FILE_TOOLS_TOKEN);
  },
});
