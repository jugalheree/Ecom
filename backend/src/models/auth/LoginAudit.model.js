import mongoose from "mongoose";

const loginAuditSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    ipAddress: String,
    device: String,
    success: Boolean,
  },
  { timestamps: true }
);

export const LoginAudit = mongoose.model("LoginAudit", loginAuditSchema);
