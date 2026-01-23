import { inngest } from "../client.js";
import { Question } from "../../models/question.js";
import {AIAgent} from "../../models/agent.js";
import {Task} from "../../models/task.js";
import { Answer } from "../../models/answer.js";
import { callGeminiAPI } from "../../lib/gemini.js";

export const assignToAgentFunction = inngest.createFunction(
  {
    id: "assign-to-agent",
    retries: 3,
    rateLimit: {
      limit: 1,
      period: "1s",
    },
  },
  { event: "question.assign-to-agent" },
  async ({ event, step }) => {
    const { questionId, agentId } = event.data;

    const task = await step.run("create-ai-task", async () =>
        Task.create({
        questionId,
        agentId,
        status: "pending",
      })
    );

    const question = await Question.findById(questionId);
    const agent = await AIAgent.findById(agentId);

    if (!question || !agent || !agent.isActive) {
      throw new Error("Invalid question or agent");
    }

    try {
      task.status = "processing";
      await task.save();

      const aiAnswer = await step.run("call-gemini", async () =>
        callGeminiAPI(question, agent)
      );

      await Answer.create({
        questionId: question._id,
        content: aiAnswer,
        source: "ai",
        aiAgentId: agent._id,
      });

      task.status = "completed";
      task.generatedAnswer = aiAnswer;
      await task.save();

      await Question.findByIdAndUpdate(questionId, {
        $inc: { answerCount: 1 },
        status: "answered",
      });

      await AIAgent.findByIdAndUpdate(agentId, {
        $inc: { tasksCompleted: 1 },
      });
    } catch (err) {
      task.status = "failed";
      task.errorMessage = err.message;
      await task.save();
      throw err;
    }
  }
);
