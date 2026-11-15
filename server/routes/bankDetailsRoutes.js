const express = require("express");

const User = require("../models/User");
const {
  encryptBankDetails,
  hashBankDetailsToken,
  validateBankDetails,
} = require("../services/bankDetails");
const {
  authenticateToken,
  requireFacilitator,
} = require("../middleware/authMiddleware");

const router = express.Router();

function isValidLinkToken(token) {
  return typeof token === "string" && /^[a-f\d]{64}$/i.test(token);
}

router.post("/link/validate", async (req, res) => {
  const token = req.body?.token;

  if (!isValidLinkToken(token)) {
    return res.status(400).json({
      message: "הקישור אינו תקף או שפג תוקפו",
    });
  }

  try {
    const user = await User.findOne({
      role: "facilitator",
      bankDetailsTokenHash: hashBankDetailsToken(token),
      bankDetailsTokenExpiresAt: { $gt: new Date() },
    }).select("_id");

    if (!user) {
      return res.status(400).json({
        message: "הקישור אינו תקף או שפג תוקפו",
      });
    }

    return res.status(200).json({ valid: true });
  } catch {
    return res.status(500).json({
      message: "לא ניתן לבדוק את הקישור כעת",
    });
  }
});

router.post("/link", async (req, res) => {
  const body = req.body || {};
  const { token } = body;

  if (!isValidLinkToken(token)) {
    return res.status(400).json({
      message: "הקישור אינו תקף או שפג תוקפו",
    });
  }

  let details;

  try {
    details = validateBankDetails(body);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  let encryptedDetails;
  try {
    encryptedDetails = encryptBankDetails(details);
  } catch {
    console.error("Bank details encryption configuration failed");
    return res.status(503).json({
      message: "לא ניתן לשמור את פרטי החשבון כעת",
    });
  }

  try {
    const user = await User.findOneAndUpdate(
      {
        role: "facilitator",
        bankDetailsTokenHash: hashBankDetailsToken(token),
        bankDetailsTokenExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          bankDetailsEncrypted: encryptedDetails,
          bankDetailsStatus: "provided",
        },
        $unset: {
          bankDetailsTokenHash: 1,
          bankDetailsTokenExpiresAt: 1,
        },
      },
      { new: true, runValidators: true }
    ).select("bankDetailsStatus");

    if (!user) {
      return res.status(400).json({
        message: "הקישור אינו תקף או שפג תוקפו",
      });
    }

    return res.status(200).json({
      message: "פרטי חשבון הבנק נשמרו בצורה מאובטחת",
      bankDetailsStatus: user.bankDetailsStatus,
    });
  } catch {
    console.error("Bank details link submission failed");
    return res.status(500).json({
      message: "לא ניתן לשמור את פרטי החשבון כעת",
    });
  }
});

router.get(
  "/me/status",
  authenticateToken,
  requireFacilitator,
  async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.user.userId,
        role: "facilitator",
        isActive: true,
      }).select("bankDetailsStatus");

      if (!user) {
        return res.status(404).json({
          message: "המנחה לא נמצאה",
        });
      }

      return res.status(200).json({
        bankDetailsStatus: user.bankDetailsStatus,
      });
    } catch {
      return res.status(500).json({
        message: "לא ניתן לטעון את סטטוס פרטי החשבון",
      });
    }
  }
);

router.put(
  "/me",
  authenticateToken,
  requireFacilitator,
  async (req, res) => {
    let details;

    try {
      details = validateBankDetails(req.body || {});
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    let encryptedDetails;
    try {
      encryptedDetails = encryptBankDetails(details);
    } catch {
      console.error("Bank details encryption configuration failed");
      return res.status(503).json({
        message: "לא ניתן לשמור את פרטי החשבון כעת",
      });
    }

    try {
      const user = await User.findOneAndUpdate(
        {
          _id: req.user.userId,
          role: "facilitator",
          isActive: true,
        },
        {
          $set: {
            bankDetailsEncrypted: encryptedDetails,
            bankDetailsStatus: "provided",
          },
        },
        { new: true, runValidators: true }
      ).select("bankDetailsStatus");

      if (!user) {
        return res.status(404).json({
          message: "המנחה לא נמצאה",
        });
      }

      return res.status(200).json({
        message: "פרטי חשבון הבנק עודכנו בצורה מאובטחת",
        bankDetailsStatus: user.bankDetailsStatus,
      });
    } catch {
      console.error("Authenticated bank details update failed");
      return res.status(500).json({
        message: "לא ניתן לשמור את פרטי החשבון כעת",
      });
    }
  }
);

module.exports = router;
