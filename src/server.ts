import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.static("public"));

app.listen(process.env.SERVER_PORT, () => {
	console.log(`Server up and running on port ${process.env.SERVER_PORT}`);
});

export default app;
