import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the single source of truth for token validation. Both /demo-access and
// /demo/validate import validateDemoToken from this module — the mock proves
// they share the same underlying validation logic.
vi.mock("../lib/sheets.js", () => ({
  validateDemoToken: vi.fn(),
  appendDemoRequestRow: vi.fn(),
  getAllDemoRequests: vi.fn(),
  appendTrialCustomerRow: vi.fn(),
  getTrialCustomerCount: vi.fn(),
  updateNdaDate: vi.fn(),
}));

import { validateDemoToken } from "../lib/sheets.js";
import app from "../app.js";

const mockValidate = vi.mocked(validateDemoToken);
const GOOD_TOKEN = "a".repeat(64);

beforeEach(() => {
  mockValidate.mockReset();
});

describe("POST /api/demo/validate", () => {
  it("returns 200 { valid: true } for a valid, unexpired token", async () => {
    mockValidate.mockResolvedValue({ valid: true, firstName: "Ada" });
    const res = await request(app).post("/api/demo/validate").send({ token: GOOD_TOKEN });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: true });
    expect(mockValidate).toHaveBeenCalledWith(GOOD_TOKEN);
  });

  it("returns 401 { valid: false } for an invalid token, with no extra details", async () => {
    mockValidate.mockResolvedValue({ valid: false, error: "Invalid or expired link" });
    const res = await request(app).post("/api/demo/validate").send({ token: GOOD_TOKEN });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ valid: false });
  });

  it("returns 401 { valid: false } for an expired token (indistinguishable from invalid)", async () => {
    mockValidate.mockResolvedValue({ valid: false, error: "This link has expired" });
    const res = await request(app).post("/api/demo/validate").send({ token: GOOD_TOKEN });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ valid: false });
  });

  it("returns 400 for a missing token", async () => {
    const res = await request(app).post("/api/demo/validate").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ valid: false });
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed tokens (non-string, too short, bad characters)", async () => {
    for (const bad of [{ token: 123 }, { token: "short" }, { token: "x".repeat(20) + "!;--" }]) {
      const res = await request(app).post("/api/demo/validate").send(bad);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ valid: false });
    }
    expect(mockValidate).not.toHaveBeenCalled();
  });
});

describe("GET /api/demo-access (existing website flow)", () => {
  it("still works and uses the same validateDemoToken function", async () => {
    mockValidate.mockResolvedValue({ valid: true, firstName: "Ada" });
    const res = await request(app).get(`/api/demo-access?token=${GOOD_TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.firstName).toBe("Ada");
    expect(res.body.appUrl).toContain("https://app.footprintnavigator.com");
    expect(mockValidate).toHaveBeenCalledWith(GOOD_TOKEN);
  });

  it("still rejects bad tokens with 401", async () => {
    mockValidate.mockResolvedValue({ valid: false, error: "Invalid or expired link" });
    const res = await request(app).get(`/api/demo-access?token=${GOOD_TOKEN}`);
    expect(res.status).toBe(401);
    expect(res.body.valid).toBe(false);
  });
});
