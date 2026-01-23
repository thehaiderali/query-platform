import { inngest } from "../client.js";
import {Task} from "../../models/task.js";

export const batchProcessPendingTasks = inngest.createFunction(
  { id: "batch-process-pending" },
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    const tasks = await Task.find({ status: "pending" });

    for (const task of tasks) {
      await step.sendEvent("retry-task", {
        name: "question.assign-to-agent",
        data: {
          questionId: task.questionId.toString(),
          agentId: task.agentId.toString(),
        },
      });
    }
  }
);
