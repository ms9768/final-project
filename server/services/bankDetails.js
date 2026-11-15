const crypto = require("crypto");

function getEncryptionKey() {
  const configuredKey = process.env.BANK_DETAILS_ENCRYPTION_KEY;

  if (!configuredKey) {
    throw new Error("Bank details encryption is not configured");
  }

  const key = /^[\da-f]{64}$/i.test(configuredKey)
    ? Buffer.from(configuredKey, "hex")
    : Buffer.from(configuredKey, "base64");

  if (key.length !== 32) {
    throw new Error("Bank details encryption key must be 32 bytes");
  }

  return key;
}

function encryptBankDetails(details) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(details), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

function decryptBankDetails(encryptedDetails) {
  const [version, encodedIv, encodedAuthTag, encodedCiphertext, extra] =
    String(encryptedDetails || "").split(":");

  if (
    version !== "v1" ||
    !encodedIv ||
    !encodedAuthTag ||
    !encodedCiphertext ||
    extra
  ) {
    throw new Error("Bank details data is invalid");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(encodedIv, "base64")
  );
  decipher.setAuthTag(Buffer.from(encodedAuthTag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(plaintext);
}

function validateBankDetails(input) {
  const fieldNames = [
    "accountHolder",
    "bankName",
    "bankNumber",
    "branchNumber",
    "accountNumber",
  ];

  if (
    !input ||
    fieldNames.some((fieldName) => typeof input[fieldName] !== "string")
  ) {
    throw new Error("פרטי חשבון הבנק אינם תקינים");
  }

  const details = {
    accountHolder: input.accountHolder.trim(),
    bankName: input.bankName.trim(),
    bankNumber: input.bankNumber.trim(),
    branchNumber: input.branchNumber.trim(),
    accountNumber: input.accountNumber.trim(),
  };

  if (
    !details.accountHolder ||
    details.accountHolder.length > 120 ||
    !details.bankName ||
    details.bankName.length > 100 ||
    !/^\d{1,3}$/.test(details.bankNumber) ||
    !/^\d{1,4}$/.test(details.branchNumber) ||
    !/^\d{1,20}$/.test(details.accountNumber)
  ) {
    throw new Error("פרטי חשבון הבנק אינם תקינים");
  }

  return details;
}

function createBankDetailsToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashBankDetailsToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = {
  createBankDetailsToken,
  decryptBankDetails,
  encryptBankDetails,
  hashBankDetailsToken,
  validateBankDetails,
};
