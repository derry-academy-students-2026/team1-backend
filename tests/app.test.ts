import { app } from "../src/app.js";
import { describe, it, expect } from "vitest";
import request from "supertest";

describe("GET /health", () => {
  it("should return status UP and current time", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("UP");
    expect(new Date(response.body.time).toString()).not.toBe("Invalid Date");
  });
});