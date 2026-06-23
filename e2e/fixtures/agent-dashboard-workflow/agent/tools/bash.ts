import { defineTool, defineBashTool } from "eve/tools";
import { never } from "eve/tools/approval";

/**
 * Bash tool with auto-approval for programmatic smoke tests.
 */
export default defineTool({
  ...defineBashTool(),
  needsApproval: never(),
});
