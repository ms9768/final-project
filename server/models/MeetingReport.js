
const mongoose = require("mongoose");

const meetingReportSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    schoolName: {
      type: String,
      trim: true,
    },

    className: {
      type: String,
      trim: true,
    },

    groupNumber: {
      type: Number,
      enum: [1, 2, 3],
    },

    facilitatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    meetingLocation: {
      type: String,
      enum: ["facilitator_home", "organization_venue"],
      required: true,
    },

    prolongedConversation: {
      type: Boolean,
      default: false,
    },

    paymentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["not_started", "paid"],
      default: "not_started",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
