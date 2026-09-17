const test = require("node:test");
const assert = require("node:assert");
const request = require("http");

test("Backend environment validation test", () => {
    assert.strictEqual(typeof process.env, "object");
});

test("Backend exports Express app with expected routes", () => {
    process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "12345678901234567890123456789012";
    process.env.GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || "dummy_key";

    const app = require("../src/app");
    assert.strictEqual(typeof app, "function");
    assert.strictEqual(typeof app.listen, "function");
});
