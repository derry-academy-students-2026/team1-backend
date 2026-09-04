import { describe, expect, it } from "vitest";
import { CreateApplicationSchema } from "../../src/dtos/applicationDto.js";

const validApplication = {
	applicantName: "Ada Lovelace",
	applicantEmail: "ada@example.com",
	phoneNumber: "07700 900123",
	address: "1 Example Street, Belfast, BT1 1AA",
	linkedInUrl: "https://www.linkedin.com/in/ada",
	coverLetter: "I am interested in this role.",
	rightToWork: "yes",
	privacyConsent: "on",
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

	it("should distinguish a missing email from a malformed one", () => {
		const missing = CreateApplicationSchema.safeParse({
			...validApplication,
			applicantEmail: "  ",
		});
		const malformed = CreateApplicationSchema.safeParse({
			...validApplication,
			applicantEmail: "not-an-email",
		});

		expect(missing.error?.issues[0].message).toBe("Enter your email address");
		expect(malformed.error?.issues[0].message).toBe(
			"Enter an email address in the correct format, like name@example.com",
		);
	});

	it("should accept names with hyphens, apostrophes and accents", () => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			applicantName: "Siobhán O'Neill-Étienne",
		});

		expect(result.success).toBe(true);
	});

	it.each(["A", "12345", "Ada <script>"])(
		"should reject the invalid name %s",
		(applicantName) => {
			const result = CreateApplicationSchema.safeParse({
				...validApplication,
				applicantName,
			});

			expect(result.success).toBe(false);
		},
	);

	it.each(["07700 900123", "+44 808 157 0192", "(028) 9099 0000"])(
		"should accept the phone number %s",
		(phoneNumber) => {
			const result = CreateApplicationSchema.safeParse({
				...validApplication,
				phoneNumber,
			});

			expect(result.success).toBe(true);
		},
	);

	it.each(["abc", "12345", "07700 90012x"])(
		"should reject the phone number %s",
		(phoneNumber) => {
			const result = CreateApplicationSchema.safeParse({
				...validApplication,
				phoneNumber,
			});

			expect(result.success).toBe(false);
		},
	);

	it("should name the field in max length messages", () => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			applicantName: "a".repeat(101),
		});

		expect(result.error?.issues[0].message).toBe(
			"Full name must be 100 characters or less",
		);
	});

	it("should reject a cover letter over 2000 characters", () => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			coverLetter: "a".repeat(2001),
		});

		expect(result.success).toBe(false);
	});

	it("should reject an invalid rightToWork value with the frontend message", () => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			rightToWork: "maybe",
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe(
			"Select whether you have the right to work in the UK/Ireland",
		);
	});

	it("should reject missing rightToWork", () => {
		const { rightToWork: _omitted, ...withoutRightToWork } = validApplication;

		expect(CreateApplicationSchema.safeParse(withoutRightToWork).success).toBe(
			false,
		);
	});

	it("should reject invalid privacyConsent with the frontend message", () => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			privacyConsent: "off",
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe(
			"Consent is required to submit your application",
		);
	});

	it("should reject missing privacyConsent", () => {
		const { privacyConsent: _omitted, ...withoutPrivacyConsent } =
			validApplication;

		expect(
			CreateApplicationSchema.safeParse(withoutPrivacyConsent).success,
		).toBe(false);
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

	it("should add the missing scheme to a LinkedIn URL", () => {
		const result = CreateApplicationSchema.parse({
			...validApplication,
			linkedInUrl: "www.linkedin.com/in/ada",
		});

		expect(result.linkedInUrl).toBe("https://www.linkedin.com/in/ada");
	});

	it.each([
		"https://uk.linkedin.com/in/ada",
		"https://linkedin.com/in/ada",
		"linkedin.com/in/ada",
	])("should accept the LinkedIn URL %s", (linkedInUrl) => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			linkedInUrl,
		});

		expect(result.success).toBe(true);
	});

	it.each([
		"https://example.com/in/ada",
		"https://linkedin.com.evil.example/in/ada",
		"not a url",
	])("should reject the non-LinkedIn URL %s", (linkedInUrl) => {
		const result = CreateApplicationSchema.safeParse({
			...validApplication,
			linkedInUrl,
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
