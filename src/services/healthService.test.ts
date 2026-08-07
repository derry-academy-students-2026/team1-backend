import { expect, test } from "vitest";

import { getHealthStatus } from "./healthService.js";

test("getHealthStatus returns an UP status with an ISO timestamp", () => {
	const healthStatus = getHealthStatus();

	expect(healthStatus.status).toBe("UP");
	expect(new Date(healthStatus.time).toString()).not.toBe("Invalid Date");
});
