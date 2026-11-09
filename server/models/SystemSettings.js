
const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    // תקציב כיבוד למשתתף
    refreshmentsBudgetPerParticipant: {
      type: Number,
      required: true,
      min: 0,
      default: 12,
    },

    // תשלום בסיסי למנחה עבור פגישה
    facilitatorPaymentPerMeeting: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SystemSettings",
  systemSettingsSchema
);
