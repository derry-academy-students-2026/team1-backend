import { z } from "zod";

const EmailSchema = z
	.string()
	.trim()
	.min(4, "Email must be more than 3 characters")
	.pipe(z.email("Enter a valid email address"));

const PasswordSchema = z
	.string()
	.min(9, "Password must be more than 8 characters")
	.regex(/[A-Z]/, "Password must include an uppercase letter")
	.regex(/[a-z]/, "Password must include a lowercase letter")
	.regex(/[^A-Za-z0-9]/, "Password must include a special character");

/** Schema for the POST /auth/login request body. */
export const LoginSchema = z.object({
	email: EmailSchema,
	password: PasswordSchema,
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

/**
 * Claims embedded in the signed JWT. Kept to the minimum needed to identify
 * the caller on subsequent requests.
 */
export interface JwtPayloadDto {
	userId: number;
	email: string;
}
