import mongoose from "mongoose";


// AdvancedOrderSchedule model to manage scheduled orders, including recurring ones.
const advancedOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
      index: true,
      validate: {
        validator: value => value > new Date(),
        message: "Scheduled date must be in the future",
      },
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    recurringIntervalDays: {
      type: Number,
      validate: {
        validator: function (value) {
          if (this.isRecurring) return value && value > 0;
          return true;
        },
        message: "Valid recurring interval required",
      },
    },

    nextExecutionDate: {
      type: Date,
      index: true,
    },

    executionCount: {
      type: Number,
      default: 0,
    },

    maxOccurrences: {
      type: Number,
    },

    lastExecutedAt: Date,

    status: {
      type: String,
      enum: [
        "SCHEDULED",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
      ],
      default: "SCHEDULED",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const AdvancedOrder = mongoose.model(
  "AdvancedOrder",
  advancedOrderSchema
);