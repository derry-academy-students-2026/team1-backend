import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "../../src/services/authService.js";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
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
const realArgon2 = (await vi.importActual<typeof import("argon2")>("argon2"))
	.default;
const prisma = (await import("../../src/prismaClient.js")).default;

const TEST_SECRET = "test-secret";

const seededUser = {
	userId: 1,
	email: "test1@example.com",
	passwordHash: "$argon2id$stored",
	role: "user",
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

	it("should propagate non-Error rejections during login", async () => {
		vi.mocked(prisma.user.findUnique).mockRejectedValue("db exploded" as never);

		await expect(
			service.login("test1@example.com", "Password123!"),
		).rejects.toBe("db exploded");
	});

	it("should create a user with a hashed password and return a token", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
		vi.mocked(argon2.hash).mockImplementation((password) =>
			realArgon2.hash(password),
		);
		vi.mocked(prisma.user.create).mockResolvedValue({
			...seededUser,
			email: "new@example.com",
			passwordHash: "",
		} as never);

		const result = await service.register(" NEW@Example.com ", "Password123!");
		const createCall = vi.mocked(prisma.user.create).mock.calls[0]?.[0];
		const storedPasswordHash = createCall?.data.passwordHash as string;

		expect(prisma.user.create).toHaveBeenCalledWith({
			data: {
				email: "new@example.com",
				passwordHash: storedPasswordHash,
				role: "user",
			},
		});
		expect(argon2.hash).toHaveBeenCalledWith("Password123!");
		expect(storedPasswordHash).not.toBe("Password123!");
		expect(await realArgon2.verify(storedPasswordHash, "Password123!")).toBe(
			true,
		);
		expect(result.token).toBeTruthy();
	});

	it("should reject duplicate email", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(seededUser as never);

		await expect(
			service.register("test1@example.com", "Password123!"),
		).rejects.toMatchObject({ code: "DUPLICATE_EMAIL" });
		expect(prisma.user.create).not.toHaveBeenCalled();
	});

	it("should propagate non-Error rejections during registration", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
		vi.mocked(prisma.user.create).mockRejectedValue("db exploded" as never);

		await expect(
			service.register("new@example.com", "Password123!"),
		).rejects.toBe("db exploded");
	});

	it.each([
		["missing domain", "user@example"],
		["missing at sign", "user.example.com"],
	])("should reject invalid email format: %s", async (_name, email) => {
		await expect(service.register(email, "Password123!")).rejects.toMatchObject(
			{ code: "INVALID_EMAIL" },
		);
	});

	it.each([
		["too short", "Pass1!"],
		["missing uppercase", "password123!"],
		["missing lowercase", "PASSWORD123!"],
		["missing special character", "Password123"],
	])("should reject weak password: %s", async (_name, password) => {
		await expect(
			service.register("new@example.com", password),
		).rejects.toMatchObject({ code: "WEAK_PASSWORD" });
	});
});
