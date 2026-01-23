import { inngest } from "../client.js";
import { Question } from "../../models/question.js";
import {AIAgent} from "../../models/agent.js";
import {Task} from "../../models/task.js";
import { Answer } from "../../models/answer.js";
import { callGeminiAPI } from "../../lib/gemini.js";

export const assignToAgentFunction = inngest.createFunction(
  { id: "assign-to-agent", retries: 3 },
  { event: "question.assign-to-agent" },
  async ({ event, step }) => {
    const { questionId, agentId, taskId } = event.data;

    // 1. Mark existing task as processing
    await step.run("update-task-status", async () => {
        await Task.findByIdAndUpdate(taskId, { status: "processing" });
    });

    const question = await Question.findById(questionId);
    const agent = await AIAgent.findById(agentId);

    try {
      // 2. Call AI
      const aiAnswer = await step.run("call-gemini", async () =>
        callGeminiAPI(question, agent)
      );

      // 3. Save Answer and Update Question/Task in one flow
      await step.run("finalize-results", async () => {
          await Answer.create({
            questionId,
            content: aiAnswer,
            source: "ai",
            aiAgentId: agentId,
          });

          await Task.findByIdAndUpdate(taskId, { status: "completed", generatedAnswer: aiAnswer });
          await Question.findByIdAndUpdate(questionId, { status: "answered", $inc: { answerCount: 1 } });
      });

    } catch (err) {
      await Task.findByIdAndUpdate(taskId, { status: "failed", errorMessage: err.message });
      throw err; // Re-throw for Inngest retry logic
    }
  }
);