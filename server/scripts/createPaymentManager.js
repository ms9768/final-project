require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const readline = require("readline");

const User = require("../models/User");

let sensitiveInputs = [];

function getSafeErrorDetails(error) {
  let message = error instanceof Error ? error.message : String(error);
  const sensitiveValues = [
    process.env.MONGO_URI,
    process.env.JWT_SECRET,
    process.env.BANK_DETAILS_ENCRYPTION_KEY,
    process.env.BREVO_API_KEY,
    ...sensitiveInputs,
  ].filter((value) => typeof value === "string" && value.length >= 4);

  for (const value of sensitiveValues) {
    message = message.split(value).join("[REDACTED]");
  }

  message = message
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[REDACTED_MONGODB_URI]")
    .replace(
      /(\b(?:password(?:Hash)?|email|token|key|secret)\s*[:=]\s*)("[^"]*"|'[^']*'|[^,\s}]+)/gi,
      "$1[REDACTED]"
    );

  const name = error instanceof Error ? error.name : "UnknownError";
  const code =
    error && typeof error === "object" && error.code
      ? ` (${error.code})`
      : "";

  return `${name}${code}: ${message}`;
}

function ask(question) {
  const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    prompt.question(question, (answer) => {
      prompt.close();
      resolve(answer.trim());
    });
  });
}

function askHidden(question) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Run this command from an interactive terminal");
  }

  return new Promise((resolve, reject) => {
    let value = "";
    const input = process.stdin;

    process.stdout.write(question);
    input.setRawMode(true);
    input.resume();
    input.setEncoding("utf8");

    function finish(error) {
      input.removeListener("data", onData);
      input.setRawMode(false);
      input.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    }

    function onData(character) {
      if (character === "\u0003") {
        finish(new Error("Prompt cancelled"));
      } else if (character === "\r" || character === "\n") {
        finish();
      } else if (character === "\u007f" || character === "\b") {
        value = value.slice(0, -1);
      } else if (character >= " ") {
        value += character;
      }
    }

    input.on("data", onData);
  });
}

async function main() {
  const fullName = await ask("Payment manager full name: ");
  const email = (await ask("Payment manager email: ")).toLowerCase();
  sensitiveInputs = [email];
  const password = await askHidden("Password (minimum 12 characters): ");
  sensitiveInputs.push(password);

  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid name and email are required");
  }
  if (password.length < 12) {
    throw new Error("The password must contain at least 12 characters");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(process.env.MONGO_URI);

  if (await User.exists({ email })) {
    throw new Error("An account already uses this email");
  }

  await User.create({
    fullName,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "payment_manager",
    approvalStatus: "approved",
    isActive: true,
  });

  console.log("Payment manager account created.");
}

main()
  .catch((error) => {
    console.error("Could not create the payment manager account.");
    console.error(getSafeErrorDetails(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    sensitiveInputs = [];
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  });
