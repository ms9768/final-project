
const SystemSettings = require("../models/SystemSettings");

// קבלת הגדרות המערכת
const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();

    // אם עדיין אין הגדרות במסד הנתונים, ניצור הגדרות ברירת מחדל
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get system settings",
    });
  }
};

// עדכון הגדרות המערכת
const updateSystemSettings = async (req, res) => {
  try {
    const {
      refreshmentsBudgetPerParticipant,
      facilitatorPaymentPerMeeting,
    } = req.body;

    if (
      refreshmentsBudgetPerParticipant !== undefined &&
      (typeof refreshmentsBudgetPerParticipant !== "number" ||
        refreshmentsBudgetPerParticipant < 0)
    ) {
      return res.status(400).json({
        message: "Invalid refreshments budget",
      });
    }

    if (
      facilitatorPaymentPerMeeting !== undefined &&
      (typeof facilitatorPaymentPerMeeting !== "number" ||
        facilitatorPaymentPerMeeting < 0)
    ) {
      return res.status(400).json({
        message: "Invalid facilitator payment",
      });
    }

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = new SystemSettings();
    }

    if (refreshmentsBudgetPerParticipant !== undefined) {
      settings.refreshmentsBudgetPerParticipant =
        refreshmentsBudgetPerParticipant;
    }

    if (facilitatorPaymentPerMeeting !== undefined) {
      settings.facilitatorPaymentPerMeeting =
        facilitatorPaymentPerMeeting;
    }

    await settings.save();

    return res.status(200).json(settings);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update system settings",
    });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
};
