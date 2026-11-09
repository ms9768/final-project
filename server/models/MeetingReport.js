const mongoose = require("mongoose");

const meetingReportSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    meetingDate: {
      type: Date,
      required: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    participantCount: {
      type: Number,
      required: true,
      min: 0,
    },

    refreshmentsCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    refreshmentsBudget: {
      type: Number,
      default: 0,
      min: 0,
    },

    isRefreshmentsOverBudget: {
      type: Boolean,
      default: false,
    },

    receipt: {
      fileName: {
        type: String,
        default: "",
      },

      contentType: {
        type: String,
        default: "",
      },

      data: {
        type: Buffer,
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "needs_correction",
      ],
      default: "pending",
    },

    coordinatorNotes: {
      type: String,
      default: "",
      trim: true,
    },

    // היסטוריית שינויים בסטטוס הדיווח
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "pending",
            "approved",
            "rejected",
            "needs_correction",
          ],
          required: true,
        },

        coordinatorNotes: {
          type: String,
          default: "",
        },

        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MeetingReport",
  meetingReportSchema
);