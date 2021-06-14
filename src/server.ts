import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { TokenHistoryAggregateRaw } from "./@types/ServerClientState";
import Token from "./model/Token";
import TokenHistory from "./model/TokenHistory";
import { tryParseJson } from "./utils/Helper";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.static("public"));

app.get("/history/:token?", async (req, res) => {
	const agg: any[] = [
		// {
		// 	$match: {
		// 		type: "update",
		// 	},
		// },
		{
			$lookup: {
				from: "tokens",
				localField: "key",
				foreignField: "key",
				as: "token",
			},
		},
		{
			$unwind: {
				path: "$token",
			},
		},
		{
			$project: {
				_id: 1,
				key: 1,
				type: 1,
				lastUpdated: 1,
				infodiff: 1,
				infoold: 1,
				imgdiff: 1,
				platform: "$token.platform",
				raw: "$token.raw",
			},
		},
	];

	if (req.params.token) {
		agg.unshift({
			$match: {
				key: req.params.token,
			},
		});
	}

	const histories = await TokenHistory.aggregate(agg).limit(20).exec();
	return res.status(200).json({
		success: true,
		histories: histories.map((history: TokenHistoryAggregateRaw) => {
			return {
				...history,
				raw: history.raw ? tryParseJson(history.raw) : undefined,
			};
		}),
	});
});

app.get("/token/:token", async (req, res) => {
	const results = await Promise.allSettled([
		Token.findOne({ key: req.params.token }).select("-_id").lean().exec(),
		TokenHistory.find({ key: req.params.token }).sort({ lastUpdated: -1 }).lean().exec(),
	]);

	const json = {} as any;
	if (results[0].status === "fulfilled") {
		if (!results[0].value) {
			return res.status(400).json({ success: false, msg: "Token doesn't exist" });
		}

		json.token = { ...results[0].value, raw: tryParseJson(results[0].value.raw) };
	}

	if (results[1].status === "fulfilled") {
		json.histories = results[1].value;
	}

	return res.status(200).json({ success: true, ...json });
});

app.listen(process.env.SERVER_PORT, () => {
	console.log(`Server up and running on port ${process.env.SERVER_PORT}`);
});

export default app;
