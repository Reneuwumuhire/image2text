// lib/cors.js
import Cors from "cors";

const cors = Cors({
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

export default cors;
