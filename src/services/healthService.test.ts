import assert from "node:assert/strict";
import test from "node:test";

import { getHealthStatus } from "./healthService.js";

test("getHealthStatus returns an UP status with an ISO timestamp", () => {
	const healthStatus = getHealthStatus();

	assert.equal(healthStatus.status, "UP");
	assert.doesNotThrow(() => new Date(healthStatus.time).toISOString());
});
