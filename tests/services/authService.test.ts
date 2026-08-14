import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "../../src/services/authService.js";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		user: {
			findUnique: vi.fn(),
		},
	},
}));

vi.mock("argon2", () => ({
	default: {
		hash: vi.fn().mockResolvedValue("$argon2id$decoy"),
		verify: vi.fn(),
	},
}));

const argon2 = (await import("argon2")).default;
const prisma = (await import("../../src/prismaClient.js")).default;

const TEST_SECRET = "test-secret";

const seededUser = {
	userId: 1,
	email: "test1@example.com",
	passwordHash: "$argon2id$stored",
	createdAt: new Date("2026-08-14"),
};

describe("AuthService", () => {
	let service: AuthService;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env.JWT_SECRET = TEST_SECRET;
		service = new AuthService();
	});

	it("should return a signed token containing userId and email on success", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(seededUser as never);
		vi.mocked(argon2.verify).mockResolvedValue(true);

		const result = await service.login("test1@example.com", "Password123!");

		expect(result).not.toBeNull();
		const decoded = jwt.verify(
			result?.token as string,
			TEST_SECRET,
		) as jwt.JwtPayload;
		expect(decoded.userId).toBe(1);
		expect(decoded.email).toBe("test1@example.com");
		expect(decoded.exp).toBeDefined();
	});

	it("should not include the password hash in the token payload", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(seededUser as never);
		vi.mocked(argon2.verify).mockResolvedValue(true);

		const result = await service.login("test1@example.com", "Password123!");
		const decoded = jwt.decode(result?.token as string) as jwt.JwtPayload;

		expect(decoded).not.toHaveProperty("passwordHash");
	});

	it("should normalise the email before querying", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(seededUser as never);
		vi.mocked(argon2.verify).mockResolvedValue(true);

		await service.login("  TEST1@Example.com ", "Password123!");

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { email: "test1@example.com" },
		});
	});

	it("should return null when the user does not exist", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
		vi.mocked(argon2.verify).mockResolvedValue(false);

		const result = await service.login("nobody@example.com", "Password123!");

		expect(result).toBeNull();
		expect(argon2.verify).toHaveBeenCalled();
	});

	it("should return null when the password does not match", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(seededUser as never);
		vi.mocked(argon2.verify).mockResolvedValue(false);

		const result = await service.login("test1@example.com", "wrong-password");

		expect(result).toBeNull();
	});

	it("should throw when JWT_SECRET is not configured", async () => {
		process.env.JWT_SECRET = "";
		vi.mocked(prisma.user.findUnique).mockResolvedValue(seededUser as never);
		vi.mocked(argon2.verify).mockResolvedValue(true);

		await expect(
			service.login("test1@example.com", "Password123!"),
		).rejects.toThrow("JWT_SECRET");
	});

	it("should propagate database errors", async () => {
		vi.mocked(prisma.user.findUnique).mockRejectedValue(
			new Error("DB down") as never,
		);

		await expect(
			service.login("test1@example.com", "Password123!"),
		).rejects.toThrow("DB down");
	});
});
