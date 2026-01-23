import { serve } from "inngest/express";
import { inngest } from "./client.js";
import { assignToAgentFunction } from "./functions/assignToAgent.js";
import { batchProcessPendingTasks } from "./functions/batchProcessPending.js";

export const inngestHandler = serve({
  client: inngest,
  functions: [
    assignToAgentFunction,
    batchProcessPendingTasks,
  ],
});
