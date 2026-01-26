import { inngest } from "../client.js";
import { Question } from "../../models/question.js";
import { AIAgent } from "../../models/agent.js";
import { Task } from "../../models/task.js";
import { Answer } from "../../models/answer.js";
import { callGeminiAPI } from "../../lib/gemini.js";

export const assignToAgentFunction = inngest.createFunction(
  { id: "assign-to-agent", retries: 3 },
  { event: "question.assign-to-agent" },
  async ({ event, step }) => {
    const { questionId, agentId } = event.data;

    // 1. Get question and agent
    const question = await step.run("get-question", async () => {
      const q = await Question.findById(questionId);
      if (!q) throw new Error("Question not found");
      console.log(`Question ${questionId} current status: ${q.status}, answerCount: ${q.answerCount}`);
      return q;
    });

    const agent = await step.run("get-agent", async () => {
      const a = await AIAgent.findById(agentId);
      if (!a || !a.isActive) throw new Error("Agent not found or inactive");
      return a;
    });

    // 2. Create task first
    const task = await step.run("create-task", async () => {
      const existingTask = await Task.findOne({ questionId, agentId });
      if (existingTask) {
        console.log(`Found existing task for question ${questionId} and agent ${agentId}`);
        return existingTask;
      }
      console.log(`Creating new task for question ${questionId} and agent ${agentId}`);
      return await Task.create({
        questionId,
        agentId,
        status: "processing",
      });
    });

    try {
      // 3. Call AI
      const aiAnswer = await step.run("call-gemini", async () => {
        try {
          console.log(`Calling Gemini API for question: ${question.title}`);
          const answer = await callGeminiAPI(question, agent);
          console.log(`AI response generated successfully, length: ${answer.length} chars`);
          return answer;
        } catch (error) {
          console.error("AI Generation Error:", error);
          throw new Error(`AI generation failed: ${error.message}`);
        }
      });

      // 4. Save Answer and Update Task and Question Status
      await step.run("save-answer", async () => {
        console.log(`Saving answer for question ${questionId}`);
        
        // Check if AI answer already exists
        const existingAIAnswer = await Answer.findOne({
          questionId,
          source: 'ai',
          aiAgentId: agentId
        });

        let answerCreated = false;
        
        if (!existingAIAnswer) {
          console.log(`Creating new Answer document`);
          await Answer.create({
            questionId,
            content: aiAnswer,
            source: "ai",
            aiAgentId: agentId,
          });
          answerCreated = true;

          // Update agent tasks completed
          await AIAgent.findByIdAndUpdate(agentId, {
            $inc: { tasksCompleted: 1 }
          });
          console.log(`Incremented tasksCompleted for agent ${agentId}`);

          // Update question: increment answer count
          await Question.findByIdAndUpdate(questionId, {
            $inc: { answerCount: 1 }
          });
          console.log(`Incremented answerCount for question ${questionId}`);
        } else {
          console.log(`AI answer already exists for question ${questionId} and agent ${agentId}`);
        }

        // Update question status to "answered" (regardless of whether answer was just created)
        await Question.findByIdAndUpdate(questionId, {
          status: "answered"
        });
        console.log(`Updated question ${questionId} status to "answered"`);

        // Update task status
        await Task.findByIdAndUpdate(task._id, {
          status: "completed",
          generatedAnswer: aiAnswer,
          completedAt: new Date()
        });
        console.log(`Updated task ${task._id} status to "completed"`);
        
        // Verify the update
        const updatedQuestion = await Question.findById(questionId);
        console.log(`Question ${questionId} updated status: ${updatedQuestion.status}, answerCount: ${updatedQuestion.answerCount}`);
      });

      console.log(`Successfully processed question ${questionId}`);

    } catch (error) {
      // Handle errors
      await step.run("handle-error", async () => {
        console.error(`Error processing question ${questionId}:`, error.message);
        
        // Update task status to failed
        await Task.findByIdAndUpdate(task._id, {
          status: "failed",
          errorMessage: error.message,
          failedAt: new Date()
        });
        console.log(`Updated task ${task._id} status to "failed"`);
        
        // Optionally, you might want to update question status to "failed" as well
        // await Question.findByIdAndUpdate(questionId, {
        //   status: "failed"
        // });
      });
      throw error;
    }
  }
);