/**
 * Shape of the POST /auth/login request body.
 */
export interface LoginRequestDto {
	email: string;
	password: string;
}

/**
 * Shape of a successful POST /auth/login response.
 */
export interface LoginResponseDto {
	token: string;
}

/**
 * Claims embedded in the signed JWT. Kept to the minimum needed to identify
 * the caller on subsequent requests.
 */
export interface JwtPayloadDto {
	userId: number;
	email: string;
}
