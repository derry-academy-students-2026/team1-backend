import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/healthService.js", () => ({
	getHealthStatus: vi.fn(),
}));

vi.mock("../../src/lib/logger.js", () => ({
	default: {
		info: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
	},
}));

import { getHealth } from "../../src/controllers/healthController.js";
import Logger from "../../src/lib/logger.js";
import { getHealthStatus } from "../../src/services/healthService.js";

describe("getHealth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return health status and log access", () => {
		const payload = {
			status: "UP",
			time: "2026-08-12T12:00:00.000Z",
		} as const;
		vi.mocked(getHealthStatus).mockReturnValue(payload);

		const json = vi.fn();
		const res = { json } as never;
		const next = vi.fn();

		getHealth({} as never, res, next);

		expect(getHealthStatus).toHaveBeenCalledTimes(1);
		expect(Logger.info).toHaveBeenCalledWith("Health endpoint accessed");
		expect(json).toHaveBeenCalledWith(payload);
		expect(next).not.toHaveBeenCalled();
	});

	it("should call next with Error and log structured message on failure", () => {
		const error = new Error("service down");
		vi.mocked(getHealthStatus).mockImplementation(() => {
			throw error;
		});

		const res = { json: vi.fn() } as never;
		const next = vi.fn();

		getHealth({} as never, res, next);

		expect(Logger.error).toHaveBeenCalledWith("Health check failed", error);
		expect(next).toHaveBeenCalledWith(error);
	});

	it("should call next with non-Error values and log stringified message", () => {
		vi.mocked(getHealthStatus).mockImplementation(() => {
			throw "boom";
		});

		const thrown = "boom";
		const res = { json: vi.fn() } as never;
		const next = vi.fn();

		getHealth({} as never, res, next);

		expect(Logger.error).toHaveBeenCalledWith("Health check failed: boom");
		expect(next).toHaveBeenCalledWith(thrown);
	});
});
