import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function() {
      return this.source === 'user';
    }
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  source: {
    type: String,
    enum: ["user", "ai"],
    required: true,
    default: "user"
  },
  aiAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AIAgent",
    required: function() {
      return this.source === 'ai';
    }
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isAccepted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const Answer = mongoose.model("Answer", answerSchema);