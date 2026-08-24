import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodSchema } from "zod";

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

/** Validates `req.body` against `schema`, replacing it with the parsed data on success. */
export const validateBody =
	(schema: ZodSchema): RequestHandler =>
	(req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			res.status(400).json({ errors: toValidationErrors(result.error.issues) });
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
			res.status(400).json({ errors: toValidationErrors(result.error.issues) });
			return;
		}

		req.params = result.data as Request["params"];
		next();
	};
