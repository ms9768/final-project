const test = require("node:test");
const assert = require("node:assert/strict");

const {
  requirePaymentManager,
} = require("../middleware/authMiddleware");

test("coordinators are denied payment-manager routes", async () => {
  let statusCode;
  let responseBody;
  let nextCalled = false;

  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  await requirePaymentManager(
    { user: { role: "coordinator" } },
    response,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(statusCode, 403);
  assert.equal(responseBody.message, "אין הרשאה לבצע פעולה זו");
  assert.equal(nextCalled, false);
});
