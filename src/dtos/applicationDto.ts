import { z } from "zod";

const requiredText = (max: number, message: string) =>
	z
		.string()
		.trim()
		.min(1, message)
		.max(max, `Must be ${max} characters or less`);

/**
 * Schema for the POST /job-roles/:id/apply request body.
 * Mirrors the frontend's apply-form validation so the two cannot disagree.
 * `status`, `roleId` and `userId` are deliberately absent: they are set by the
 * server from the route params and the JWT, never by the caller.
 */
export const CreateApplicationSchema = z.object({
	applicantName: requiredText(100, "Enter your full name"),
	applicantEmail: z
		.string()
		.trim()
		.toLowerCase()
		.max(255, "Must be 255 characters or less")
		.pipe(z.email("Enter a valid email address")),
	phoneNumber: requiredText(30, "Enter your phone number"),
	address: requiredText(300, "Enter your home address"),
	// The frontend omits this when blank, but tolerate "" from other callers
	linkedInUrl: z
		.union([
			z.literal(""),
			z
				.string()
				.trim()
				.max(300, "Must be 300 characters or less")
				.pipe(z.url("Enter a valid LinkedIn URL")),
		])
		.optional()
		.transform((value) => (value === "" ? undefined : value)),
	coverLetter: requiredText(
		2000,
		"Enter a cover letter or additional information",
	),
});

/** Shape of the POST /job-roles/:id/apply request body. */
export type CreateApplicationDto = z.infer<typeof CreateApplicationSchema>;

/** Shape of an application returned by the API. */
export interface ApplicationResponseDto {
	id: number;
	roleId: number;
	applicantName: string;
	applicantEmail: string;
	phoneNumber: string;
	address: string;
	linkedInUrl: string | null;
	coverLetter: string;
	status: string;
	createdAt: Date;
}
