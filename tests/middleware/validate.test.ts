import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validateBody, validateParams } from "../../src/middleware/validate.js";

const createMockResponse = () => {
	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });
	return { json, status } as unknown as Response & {
		json: ReturnType<typeof vi.fn>;
		status: ReturnType<typeof vi.fn>;
	};
};

describe("validateBody", () => {
	const schema = z.object({
		email: z.string().trim().min(1, "Email is required"),
		password: z.string().min(1, "Password is required"),
	});

	it("calls next() and replaces req.body with the parsed data on success", () => {
		const req = {
			body: { email: " test@example.com ", password: "secret" },
		} as Request;
		const res = createMockResponse();
		const next = vi.fn();

		validateBody(schema)(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.body).toEqual({ email: "test@example.com", password: "secret" });
	});

	it("returns 400 with a structured errors array on failure", () => {
		const req = { body: { email: "", password: "" } } as Request;
		const res = createMockResponse();
		const next = vi.fn();

		validateBody(schema)(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.status(400).json).toHaveBeenCalledWith({
			errors: [
				{ field: "email", message: "Email is required" },
				{ field: "password", message: "Password is required" },
			],
		});
	});
});

describe("validateParams", () => {
	const schema = z.object({
		id: z.string().regex(/^\d+$/, "ID must be a number"),
	});

	it("calls next() when params match the schema", () => {
		const req = { params: { id: "12" } } as unknown as Request;
		const res = createMockResponse();
		const next = vi.fn();

		validateParams(schema)(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.params).toEqual({ id: "12" });
	});

	it("returns 400 with a structured errors array when params are invalid", () => {
		const req = { params: { id: "abc" } } as unknown as Request;
		const res = createMockResponse();
		const next = vi.fn();

		validateParams(schema)(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.status(400).json).toHaveBeenCalledWith({
			errors: [{ field: "id", message: "ID must be a number" }],
		});
	});
});
