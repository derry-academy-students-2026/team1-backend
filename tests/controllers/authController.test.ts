import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "../../src/controllers/authController.js";
import { RegistrationError } from "../../src/services/authService.js";

const createMockResponse = () => {
	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });
	return { json, status } as unknown as Response & {
		json: ReturnType<typeof vi.fn>;
		status: ReturnType<typeof vi.fn>;
	};
};

const createRequest = (body: unknown) => ({ body }) as Request;

describe("AuthController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return 200 with the token on successful login", async () => {
		const login = vi.fn().mockResolvedValue({ token: "signed.jwt.value" });
		const controller = new AuthController({ login } as never);
		const res = createMockResponse();

		await controller.login(
			createRequest({ email: "test1@example.com", password: "Password123!" }),
			res,
		);

		expect(login).toHaveBeenCalledWith("test1@example.com", "Password123!");
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.status(200).json).toHaveBeenCalledWith({
			token: "signed.jwt.value",
		});
	});

	it("should return 401 with a generic message when credentials are invalid", async () => {
		const login = vi.fn().mockResolvedValue(null);
		const controller = new AuthController({ login } as never);
		const res = createMockResponse();

		await controller.login(
			createRequest({ email: "test1@example.com", password: "wrong" }),
			res,
		);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.status(401).json).toHaveBeenCalledWith({
			message: "Invalid email or password",
		});
	});

	it("should return 500 when the service rejects with a non-Error value", async () => {
		const login = vi.fn().mockRejectedValue("boom");
		const controller = new AuthController({ login } as never);
		const res = createMockResponse();

		await controller.login(
			createRequest({ email: "test1@example.com", password: "Password123!" }),
			res,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.status(500).json).toHaveBeenCalledWith({
			message: "Failed to process login",
		});
	});

	it("should return 500 when the service throws", async () => {
		const login = vi.fn().mockRejectedValue(new Error("boom"));
		const controller = new AuthController({ login } as never);
		const res = createMockResponse();

		await controller.login(
			createRequest({ email: "test1@example.com", password: "Password123!" }),
			res,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.status(500).json).toHaveBeenCalledWith({
			message: "Failed to process login",
		});
	});

	it("should return 201 with the token on successful registration", async () => {
		const register = vi.fn().mockResolvedValue({ token: "signed.jwt.value" });
		const controller = new AuthController({ register } as never);
		const res = createMockResponse();

		await controller.register(
			createRequest({ email: "new@example.com", password: "Password123!" }),
			res,
		);

		expect(register).toHaveBeenCalledWith("new@example.com", "Password123!");
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.status(201).json).toHaveBeenCalledWith({
			token: "signed.jwt.value",
		});
	});

	it.each([
		[
			"duplicate email",
			new RegistrationError("DUPLICATE_EMAIL"),
			409,
			"An account with this email already exists",
		],
	])(
		"should map registration %s errors",
		async (_name, error, status, message) => {
			const register = vi.fn().mockRejectedValue(error);
			const controller = new AuthController({ register } as never);
			const res = createMockResponse();

			await controller.register(
				createRequest({ email: "new@example.com", password: "Password123!" }),
				res,
			);

			expect(res.status).toHaveBeenCalledWith(status);
			expect(res.status(status).json).toHaveBeenCalledWith({ message });
		},
	);

	it("should return the registration failure message when the service throws unexpectedly", async () => {
		const register = vi.fn().mockRejectedValue(new Error("boom"));
		const controller = new AuthController({ register } as never);
		const res = createMockResponse();

		await controller.register(
			createRequest({ email: "new@example.com", password: "Password123!" }),
			res,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.status(500).json).toHaveBeenCalledWith({
			message: "Failed to process registration",
		});
	});

	it("should return the registration failure message when the service rejects with a non-Error value", async () => {
		const register = vi.fn().mockRejectedValue("boom");
		const controller = new AuthController({ register } as never);
		const res = createMockResponse();

		await controller.register(
			createRequest({ email: "new@example.com", password: "Password123!" }),
			res,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.status(500).json).toHaveBeenCalledWith({
			message: "Failed to process registration",
		});
	});
});
