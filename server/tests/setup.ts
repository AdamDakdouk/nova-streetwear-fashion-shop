// Global test setup: never let tests hit the real Resend API. Individual tests can
// still inspect `sendOtpEmail` (imported as a jest.Mock) to capture the OTP code
// that would have been emailed.
jest.mock("../src/services/email.service", () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(undefined),
}));
