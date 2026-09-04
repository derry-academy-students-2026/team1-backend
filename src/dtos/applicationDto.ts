import { z } from "zod";

const NAME_FORMAT_MESSAGE =
	"Full name can only include letters, spaces, hyphens and apostrophes";
const PHONE_MESSAGE =
	"Enter a telephone number, like 07700 900123 or +44 808 157 0192";
const LINKEDIN_MESSAGE =
	"Enter a LinkedIn profile URL, like https://www.linkedin.com/in/your-name";

/** Accepts a URL only when it is parseable and hosted on linkedin.com. */
const isLinkedInUrl = (value: string): boolean => {
	try {
		const { hostname, protocol } = new URL(value);
		return (
			(protocol === "https:" || protocol === "http:") &&
			(hostname === "linkedin.com" || hostname.endsWith(".linkedin.com"))
		);
	} catch {
		return false;
	}
};

/**
 * Schema for the POST /job-roles/:id/apply request body.
 * Messages are written for display to the applicant, so they must stay in step
 * with the frontend's apply-form validation.
 * `status`, `roleId` and `userId` are deliberately absent: they are set by the
 * server from the route params and the JWT, never by the caller.
 */
export const CreateApplicationSchema = z.object({
	applicantName: z
		.string()
		.trim()
		.min(1, "Enter your full name")
		.min(2, "Full name must be at least 2 characters")
		.max(100, "Full name must be 100 characters or less")
		.regex(/^[\p{L}\p{M}\s'’.-]+$/u, NAME_FORMAT_MESSAGE),
	applicantEmail: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, "Enter your email address")
		.max(255, "Email address must be 255 characters or less")
		.pipe(
			z.email(
				"Enter an email address in the correct format, like name@example.com",
			),
		),
	phoneNumber: z
		.string()
		.trim()
		.min(1, "Enter your phone number")
		.max(30, "Phone number must be 30 characters or less")
		.regex(/^[0-9\s()+-]+$/, PHONE_MESSAGE)
		.refine((value) => value.replace(/\D/g, "").length >= 10, PHONE_MESSAGE),
	address: z
		.string()
		.trim()
		.min(1, "Enter your home address")
		.max(300, "Home address must be 300 characters or less"),
	// Optional: a missing key and "" both mean the applicant left this blank
	linkedInUrl: z
		.string()
		.trim()
		.max(300, "LinkedIn URL must be 300 characters or less")
		.optional()
		.transform((value) => {
			if (!value) {
				return undefined;
			}
			// Applicants routinely omit the scheme, so add it before validating
			return /^https?:\/\//i.test(value) ? value : `https://${value}`;
		})
		.refine(
			(value) => value === undefined || isLinkedInUrl(value),
			LINKEDIN_MESSAGE,
		),
	coverLetter: z
		.string()
		.trim()
		.min(1, "Enter a cover letter or additional information")
		.max(2000, "Cover letter must be 2000 characters or less"),
	// "no" is a valid submission: the business rule is to record the declaration
	// and screen eligibility later, not to block the application here.
	rightToWork: z.enum(["yes", "no"], {
		message: "Select whether you have the right to work in the UK/Ireland",
	}),
	privacyConsent: z.literal("on", {
		error: "Consent is required to submit your application",
	}),
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
	rightToWork: string;
	privacyConsent: string;
	status: string;
	createdAt: Date;
}
