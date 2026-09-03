import { describe, expect, it } from "vitest";
import { CreateApplicationSchema } from "../../src/dtos/applicationDto.js";

const validApplication = {
	applicantName: "Ada Lovelace",
	applicantEmail: "ada@example.com",
	phoneNumber: "07700 900123",
	address: "1 Example Street, Belfast, BT1 1AA",
	linkedInUrl: "https://www.linkedin.com/in/ada",
	coverLetter: "I am interested in this role.",
};

describe("CreateApplicationSchema", () => {
	it("should accept a valid application", () => {
		const result = CreateApplicationSchema.safeParse(validApplication);

		expect(result.success).toBe(true);
	});

	it("should trim fields and lowercase the email", () => {
		const result = CreateApplicationSchema.parse({
			...validApplication,
			applicantName: "  Ada Lovelace  ",
			applicantEmail: "  Ada@Example.COM  ",
		});

		expect(result.applicantName).toBe("Ada Lovelace");
		expect(result.applicantEmail).toBe("ada@example.com");
	});

	it.each([
		"applicantName",
		"applicantEmail",
		"phoneNumber",
		"address",
		"coverLetter",
	])("should reject a blank %s", (field) => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			[field]: "   ",
		});

		expect(result.success).toBe(false);
	});

	it("should reject an invalid email address", () => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			applicantEmail: "not-an-email",
		});

		expect(result.success).toBe(false);
	});

	it("should reject a cover letter over 2000 characters", () => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			coverLetter: "a".repeat(2001),
		});

		expect(result.success).toBe(false);
	});

	it("should accept an absent linkedInUrl", () => {
		const { linkedInUrl: _omitted, ...withoutLinkedIn } = validApplication;

		const result = CreateApplicationSchema.parse(withoutLinkedIn);

		expect(result.linkedInUrl).toBeUndefined();
	});

	it("should treat an empty linkedInUrl as absent", () => {
		const result = CreateApplicationSchema.parse({
			...validApplication,
			linkedInUrl: "",
		});

		expect(result.linkedInUrl).toBeUndefined();
	});

	it("should reject a malformed linkedInUrl", () => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			linkedInUrl: "linkedin",
		});

		expect(result.success).toBe(false);
	});

	it("should strip a client supplied status", () => {
		const result = CreateApplicationSchema.parse({
			...validApplication,
			status: "accepted",
		});

		expect(result).not.toHaveProperty("status");
	});
});
