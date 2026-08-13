import app from "./app.js";
import Logger from "./lib/logger.js";

const PORT = process.env.PORT ?? "4000";

// Start server
app.listen(PORT, () => {
	Logger.info(`🚀 Server running on http://localhost:${PORT}/job-roles`);
	Logger.info(`📝 Try: http://localhost:${PORT}/health`);
});
