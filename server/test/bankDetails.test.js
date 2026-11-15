const test = require("node:test");
const assert = require("node:assert/strict");

const {
  decryptBankDetails,
  encryptBankDetails,
  validateBankDetails,
} = require("../services/bankDetails");

process.env.BANK_DETAILS_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString(
  "base64"
);

const validDetails = {
  accountHolder: "Example Facilitator",
  bankName: "Example Bank",
  bankNumber: "12",
  branchNumber: "345",
  accountNumber: "123456789",
};

test("bank details are encrypted at rest and decrypt back to their fields", () => {
  const encrypted = encryptBankDetails(validDetails);

  assert.notEqual(encrypted, JSON.stringify(validDetails));
  assert.equal(encrypted.includes(validDetails.accountNumber), false);
  assert.deepEqual(decryptBankDetails(encrypted), validDetails);
});

test("tampered bank details fail authentication", () => {
  const encrypted = encryptBankDetails(validDetails);
  const parts = encrypted.split(":");
  parts[3] = Buffer.from("tampered", "utf8").toString("base64");

  assert.throws(() => decryptBankDetails(parts.join(":")));
});

test("bank details validation rejects missing or malformed account numbers", () => {
  assert.throws(
    () => validateBankDetails({ ...validDetails, accountNumber: "12-34" }),
    /פרטי חשבון הבנק אינם תקינים/
  );
  assert.throws(
    () => validateBankDetails({ ...validDetails, accountHolder: "" }),
    /פרטי חשבון הבנק אינם תקינים/
  );
});
