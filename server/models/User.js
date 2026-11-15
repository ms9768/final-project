
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
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

        passwordHash: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["facilitator", "coordinator", "payment_manager"],
            required: true
        },

        coordinatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        coordinatorCode: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            uppercase: true
        },

        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            required: true
        },

        // סיווג המנחה לצורך חישוב התשלום
        facilitatorLevel: {
            type: String,
            enum: ["young", "senior"],
            default: null
        },

        bankDetailsStatus: {
            type: String,
            enum: ["not_submitted", "provided"],
            default: "not_submitted",
            required: true
        },

        bankDetailsEncrypted: {
            type: String,
            default: null,
            select: false
        },

        bankDetailsTokenHash: {
            type: String,
            default: null,
            index: true,
            select: false
        },

        bankDetailsTokenExpiresAt: {
            type: Date,
            default: null,
            select: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
