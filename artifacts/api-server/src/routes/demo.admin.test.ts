import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";

vi.mock("../lib/sheets.js", () => ({
  validateDemoToken: vi.fn(),
  appendDemoRequestRow: vi.fn(),
  getAllDemoRequests: vi.fn(),
  appendTrialCustomerRow: vi.fn(),
  getTrialCustomerCount: vi.fn(),
  updateNdaDate: vi.fn(),
}));

import { getAllDemoRequests } from "../lib/sheets.js";
import app from "../app.js";

const mockGetAll = vi.mocked(getAllDemoRequests);
const ORIGINAL_ADMIN_KEY = process.env.ADMIN_KEY;

beforeEach(() => {
  mockGetAll.mockReset();
});

afterEach(() => {
  if (ORIGINAL_ADMIN_KEY === undefined) {
    delete process.env.ADMIN_KEY;
  } else {
    process.env.ADMIN_KEY = ORIGINAL_ADMIN_KEY;
  }
});

describe("GET /api/admin/requests", () => {
  it("fails closed with 401 when ADMIN_KEY env var is not configured", async () => {
    delete process.env.ADMIN_KEY;
    const res = await request(app).get("/api/admin/requests?key=anything");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(mockGetAll).not.toHaveBeenCalled();
  });

  it("fails closed even when the supplied key is empty and env key is missing", async () => {
    delete process.env.ADMIN_KEY;
    const res = await request(app).get("/api/admin/requests");
    expect(res.status).toBe(401);
    expect(mockGetAll).not.toHaveBeenCalled();
  });

  it("returns 401 for a wrong key", async () => {
    process.env.ADMIN_KEY = "correct-test-key";
    const res = await request(app).get("/api/admin/requests?key=wrong-key");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(mockGetAll).not.toHaveBeenCalled();
  });

  it("rejects the old hardcoded credential", async () => {
    process.env.ADMIN_KEY = "correct-test-key";
    const res = await request(app).get("/api/admin/requests?key=FootprintAdmin2026");
    expect(res.status).toBe(401);
    expect(mockGetAll).not.toHaveBeenCalled();
  });

  it("succeeds with the correctly configured key", async () => {
    process.env.ADMIN_KEY = "correct-test-key";
    mockGetAll.mockResolvedValue([]);
    const res = await request(app).get("/api/admin/requests?key=correct-test-key");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(mockGetAll).toHaveBeenCalled();
  });

  it("does not leak the configured key in error responses", async () => {
    process.env.ADMIN_KEY = "correct-test-key";
    const res = await request(app).get("/api/admin/requests?key=nope");
    expect(JSON.stringify(res.body)).not.toContain("correct-test-key");
  });
});
