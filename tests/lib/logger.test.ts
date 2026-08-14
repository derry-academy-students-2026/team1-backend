import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Logger", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it("should set debug level in development environment", async () => {
		process.env.NODE_ENV = "development";

		const { default: Logger } = await import("../../src/lib/logger.js");

		expect(Logger.level).toBe("debug");
	});

	it("should set http level in production environment", async () => {
		process.env.NODE_ENV = "production";

		const { default: Logger } = await import("../../src/lib/logger.js");

		expect(Logger.level).toBe("http");
	});

	it("should have all log level methods available", async () => {
		const { default: Logger } = await import("../../src/lib/logger.js");

		expect(typeof Logger.error).toBe("function");
		expect(typeof Logger.warn).toBe("function");
		expect(typeof Logger.info).toBe("function");
		expect(typeof Logger.http).toBe("function");
		expect(typeof Logger.debug).toBe("function");
	});

	it("should log error messages", async () => {
		const { default: Logger } = await import("../../src/lib/logger.js");
		const errorSpy = vi.spyOn(Logger, "error");

		Logger.error("Test error message");

		expect(errorSpy).toHaveBeenCalledWith("Test error message");
	});

	it("should log info messages", async () => {
		const { default: Logger } = await import("../../src/lib/logger.js");
		const infoSpy = vi.spyOn(Logger, "info");

		Logger.info("Test info message");

		expect(infoSpy).toHaveBeenCalledWith("Test info message");
	});

	it("should log debug messages", async () => {
		process.env.NODE_ENV = "development";

		const { default: Logger } = await import("../../src/lib/logger.js");
		const debugSpy = vi.spyOn(Logger, "debug");

		Logger.debug("Test debug message");

		expect(debugSpy).toHaveBeenCalledWith("Test debug message");
	});

	it("should log warn messages", async () => {
		const { default: Logger } = await import("../../src/lib/logger.js");
		const warnSpy = vi.spyOn(Logger, "warn");

		Logger.warn("Test warn message");

		expect(warnSpy).toHaveBeenCalledWith("Test warn message");
	});
});
