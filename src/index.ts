import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

// Start server
app.listen(PORT, () => {
	console.log(`Health Endpoint of Basic Node: http://localhost:${PORT}/health`);
});
