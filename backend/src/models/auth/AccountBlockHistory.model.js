import mongoose from "mongoose";

const accountBlockSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    reason: String,
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const AccountBlockHistory = mongoose.model(
  "AccountBlockHistory",
  accountBlockSchema
);
