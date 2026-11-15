
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

    // תשלום למנחה צעירה עבור פגישה
    youngFacilitatorPaymentPerMeeting: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // תשלום למנחה בוגרת עבור פגישה
    seniorFacilitatorPaymentPerMeeting: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // תוספת למנחה בוגרת עבור שיחה ממושכת
    seniorProlongedConversationBonus: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // תשלום שכירות עבור כל פגישה
    rentalPaymentPerMeeting: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // כתובת המייל של המשלוחן
    deliveryEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SystemSettings",
  systemSettingsSchema
);
