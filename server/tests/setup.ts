// Global test setup: never let tests hit the real Resend API. Individual tests can
// still inspect `sendOtpEmail` (imported as a jest.Mock) to capture the OTP code
// that would have been emailed.
jest.mock("../src/services/email.service", () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(undefined),
}));

// Same reasoning, same pattern: never let a test upload to real Cloudflare R2.
jest.mock("../src/services/storage.service", () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue("https://mock-r2-public-url.example/products/mock.jpg"),
}));
