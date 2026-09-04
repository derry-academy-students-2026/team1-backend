import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodSchema } from "zod";
import Logger from "../lib/logger.js";

interface ValidationErrorItem {
	field: string;
	message: string;
}

/** Maps Zod issues to the API's `{ field, message }` error contract. */
const toValidationErrors = (
	issues: { path: PropertyKey[]; message: string }[],
): ValidationErrorItem[] =>
	issues.map((issue) => ({
		field: issue.path.join("."),
		message: issue.message,
	}));

/** Logs the rejected field names only, so request payloads never reach the logs. */
const logValidationFailure = (
	req: Request,
	source: string,
	errors: ValidationErrorItem[],
): void => {
	const fields = errors.map((error) => error.field).join(", ");
	Logger.warn(
		`⚠️  [VALIDATION] Rejected ${source} for ${req.method} ${req.path} | Fields: ${fields} | Status: 400`,
	);
};

/** Validates `req.body` against `schema`, replacing it with the parsed data on success. */
export const validateBody =
	(schema: ZodSchema): RequestHandler =>
	(req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			const errors = toValidationErrors(result.error.issues);
			logValidationFailure(req, "body", errors);
			// `message` mirrors the auth endpoints so clients can show one readable error
			res
				.status(400)
				.json({ message: errors[0]?.message ?? "Invalid request", errors });
			return;
		}

		req.body = result.data;
		next();
	};

/** Validates `req.params` against `schema`, replacing it with the parsed data on success. */
export const validateParams =
	(schema: ZodSchema): RequestHandler =>
	(req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.params);

		if (!result.success) {
			const errors = toValidationErrors(result.error.issues);
			logValidationFailure(req, "params", errors);
			res
				.status(400)
				.json({ message: errors[0]?.message ?? "Invalid request", errors });
			return;
		}

		req.params = result.data as Request["params"];
		next();
	};
