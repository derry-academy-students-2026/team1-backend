import app from "./app.js";
import logger from "./lib/logger.js";

const parsedPort = Number.parseInt(process.env.PORT ?? "3000", 10);
const PORT = Number.isFinite(parsedPort) ? parsedPort : 3000;

// Start server
app.listen(PORT, () => {
	logger.info(`Health Endpoint of Basic Node: http://localhost:${PORT}/health`);
});
