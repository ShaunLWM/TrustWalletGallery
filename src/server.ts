import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import Token from "./model/Token";
import TokenHistory from "./model/TokenHistory";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.static("public"));

app.get("/history", async (req, res) => {
	const histories = await TokenHistory.find().sort({ lastUpdated: -1 }).limit(20).select("-_id").lean().exec();
	return res.status(200).json({
		success: true,
		histories: histories.map((history) => {
			return {
				...history,
				infodiff: history.infodiff ? JSON.parse(history.infodiff) : undefined,
			};
		}),
	});
});

app.get("/token/:token", async (req, res) => {
	const results = await Promise.allSettled([
		Token.findOne({ key: req.params.token }).select("-_id").lean().exec(),
		TokenHistory.find({ key: req.params.token }).sort({ lastUpdated: -1 }).select("-_id").lean().exec(),
	]);

	const json = {} as any;
	if (results[0].status === "fulfilled") {
		if (!results[0].value) {
			return res.status(400).json({ success: false, msg: "Token doesn't exist" });
		}

		json.token = results[0].value;
	}

	if (results[1].status === "fulfilled") {
		json.histories = results[1].value.map((history) => {
			return {
				...history,
				infodiff: history.infodiff ? JSON.parse(history.infodiff) : undefined,
			};
		});
	}

	return res.status(200).json({ success: true, result: json });
});

app.listen(process.env.SERVER_PORT, () => {
	console.log(`Server up and running on port ${process.env.SERVER_PORT}`);
});

export default app;
