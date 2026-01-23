import { Question } from "../models/question.js";
import { AIAgent} from "../models/agent.js";
import {Task} from "../models/task.js";
import { inngest } from "../inngest/client.js";
import mongoose from "mongoose";

export const assignAgent = async (req, res) => {
  
if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({
    message: 'Invalid or missing user id'
  });
}
  const { agentId } = req.body;
  const questionId = req.params.id;

  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).json({
      success: false,
      error: "Question not found",
    });
  }

  const agent = await AIAgent.findById(agentId);
  if (!agent || !agent.isActive) {
    return res.status(400).json({
      success: false,
      error: "Invalid AI agent",
    });
  }

  // Emit background event (NO AI CALL HERE)
  await inngest.send({
    name: "question.assign-to-agent",
    data: {
      questionId,
      agentId,
      userId: req.user.userId,
    },
  });

  const task = await Task.create({
    questionId,
    agentId,
    status: "pending",
  });

  return res.status(200).json({
    success: true,
    data: {
      taskId: task._id,
      questionId,
      agentId,
      status: "pending",
      message: "Question assigned to agent for processing",
    },
  });
};
