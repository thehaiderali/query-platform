import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    required: true,
    default: "user"
  },
  bio: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  questionsCount: {
    type: Number,
    default: 0
  },
  answersCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);