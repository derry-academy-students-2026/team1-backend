import type { ApplicationResponseDto } from "../dtos/applicationDto.js";
import Logger from "../lib/logger.js";

type ApplicationRecord = {
	applicationId: number;
	jobRoleId: number;
	applicantName: string;
	applicantEmail: string;
	phoneNumber: string;
	address: string;
	linkedInUrl: string | null;
	coverLetter: string;
	status: string;
	createdAt: Date;
};

/**
 * Maps an application from the database to a response DTO.
 * `userId` is intentionally omitted so the API never exposes account IDs.
 * @param application The application record retrieved from the database.
 * @returns An ApplicationResponseDto object.
 */
export const mapToApplicationResponseDto = (
	application: ApplicationRecord,
): ApplicationResponseDto => {
	Logger.debug(
		`Mapping application ID ${application.applicationId} to response DTO`,
	);

	return {
		id: application.applicationId,
		roleId: application.jobRoleId,
		applicantName: application.applicantName,
		applicantEmail: application.applicantEmail,
		phoneNumber: application.phoneNumber,
		address: application.address,
		linkedInUrl: application.linkedInUrl,
		coverLetter: application.coverLetter,
		status: application.status,
		createdAt: application.createdAt,
	};
};
