import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  upvoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  answerCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["open", "answered", "closed"],
    default: "open"
  },
}, { timestamps: true });

questionSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Question = mongoose.model("Question", questionSchema);