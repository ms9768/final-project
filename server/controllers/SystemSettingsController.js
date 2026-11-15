
const SystemSettings = require("../models/SystemSettings");

// קבלת הגדרות המערכת
const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();

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
      youngFacilitatorPaymentPerMeeting,
      seniorFacilitatorPaymentPerMeeting,
      seniorProlongedConversationBonus,
      rentalPaymentPerMeeting,
      deliveryEmail,
    } = req.body;

    const settingsToValidate = [
      {
        value: refreshmentsBudgetPerParticipant,
        message: "Invalid refreshments budget",
      },
      {
        value: youngFacilitatorPaymentPerMeeting,
        message: "Invalid young facilitator payment",
      },
      {
        value: seniorFacilitatorPaymentPerMeeting,
        message: "Invalid senior facilitator payment",
      },
      {
        value: seniorProlongedConversationBonus,
        message: "Invalid prolonged conversation bonus",
      },
      {
        value: rentalPaymentPerMeeting,
        message: "Invalid rental payment",
      },
    ];

    for (const setting of settingsToValidate) {
      if (
        setting.value !== undefined &&
        (typeof setting.value !== "number" ||
          !Number.isFinite(setting.value) ||
          setting.value < 0)
      ) {
        return res.status(400).json({
          message: setting.message,
        });
      }
    }

    // בדיקת כתובת המייל של המשלוחן
    if (deliveryEmail !== undefined) {
      if (typeof deliveryEmail !== "string") {
        return res.status(400).json({
          message: "Invalid delivery email",
        });
      }

      const normalizedEmail = deliveryEmail.trim().toLowerCase();

      if (
        normalizedEmail !== "" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      ) {
        return res.status(400).json({
          message: "Invalid delivery email",
        });
      }
    }

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = new SystemSettings();
    }

    if (refreshmentsBudgetPerParticipant !== undefined) {
      settings.refreshmentsBudgetPerParticipant =
        refreshmentsBudgetPerParticipant;
    }

    if (youngFacilitatorPaymentPerMeeting !== undefined) {
      settings.youngFacilitatorPaymentPerMeeting =
        youngFacilitatorPaymentPerMeeting;
    }

    if (seniorFacilitatorPaymentPerMeeting !== undefined) {
      settings.seniorFacilitatorPaymentPerMeeting =
        seniorFacilitatorPaymentPerMeeting;
    }

    if (seniorProlongedConversationBonus !== undefined) {
      settings.seniorProlongedConversationBonus =
        seniorProlongedConversationBonus;
    }

    if (rentalPaymentPerMeeting !== undefined) {
      settings.rentalPaymentPerMeeting =
        rentalPaymentPerMeeting;
    }

    if (deliveryEmail !== undefined) {
      settings.deliveryEmail = deliveryEmail.trim().toLowerCase();
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
