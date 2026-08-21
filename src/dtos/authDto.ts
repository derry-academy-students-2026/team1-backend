import { z } from "zod";

/** Schema for the POST /auth/login request body. */
export const LoginSchema = z.object({
	email: z.string().trim().min(1, "Email is required"),
	password: z.string().min(1, "Password is required"),
});

/** Schema for the POST /auth/register request body. */
export const RegisterSchema = LoginSchema;

/**
 * Shape of the POST /auth/login request body.
 */
export type LoginRequestDto = z.infer<typeof LoginSchema>;

/** Shape of the POST /auth/register request body. */
export type RegisterRequestDto = z.infer<typeof RegisterSchema>;

/**
 * Shape of a successful POST /auth/login response.
 */
export interface LoginResponseDto {
	token: string;
}

/** Shape of a successful POST /auth/register response. */
export type RegisterResponseDto = LoginResponseDto;

/** Returns whether an email has a valid, practical address format. */
export const isValidEmail = (email: string): boolean =>
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Returns whether a password meets the registration policy. */
export const isValidRegistrationPassword = (password: string): boolean =>
	password.length > 8 &&
	/[A-Z]/.test(password) &&
	/[a-z]/.test(password) &&
	/[^A-Za-z0-9]/.test(password);

/**
 * Claims embedded in the signed JWT. Kept to the minimum needed to identify
 * the caller on subsequent requests.
 */
export interface JwtPayloadDto {
	userId: number;
	email: string;
}
