import { defaultBackend, defineSandbox } from "eve/sandbox";

export const BOOTSTRAP_MARKER_PATH = "/workspace/smoke-marker.txt";
export const BOOTSTRAP_MARKER_TOKEN = "dash-bootstrap-ok-J3Q";

export const CLI_PATH = "/usr/local/bin/dash-greet";
export const CLI_TOKEN = "dash-greet-cli-ok-R7M";

export const SESSION_MARKER_PATH = "/workspace/session-marker.txt";
export const SESSION_MARKER_TOKEN = "dash-onsession-ok-X5T";

export const METRICS_DIR = "/workspace/metrics";
export const METRICS_TOKEN = "dash-metrics-ok-D6L";

const CLI_SCRIPT = [
  "#!/usr/bin/env python3",
  "import sys",
  'name = sys.argv[1] if len(sys.argv) > 1 else "dashboard"',
  `print(f"${CLI_TOKEN}:{name}")`,
  "",
].join("\n");

export default defineSandbox({
  backend: defaultBackend(),
  revalidationKey: () => "agent-dashboard-bootstrap-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.writeTextFile({
      path: BOOTSTRAP_MARKER_PATH,
      content: BOOTSTRAP_MARKER_TOKEN,
    });
    await sandbox.writeTextFile({ path: CLI_PATH, content: CLI_SCRIPT });
    const chmod = await sandbox.run({ command: `chmod +x ${CLI_PATH}` });
    if (chmod.exitCode !== 0) {
      throw new Error(`bootstrap: chmod failed: ${chmod.stderr}`);
    }
    await sandbox.run({ command: `mkdir -p ${METRICS_DIR}` });
  },
  async onSession({ use }) {
    const sandbox = await use();
    await sandbox.writeTextFile({
      path: SESSION_MARKER_PATH,
      content: SESSION_MARKER_TOKEN,
    });
  },
});
