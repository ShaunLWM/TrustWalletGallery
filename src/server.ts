import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { TokenHistoryAggregateRaw } from "./@types/ServerClientState";
import Token from "./model/Token";
import TokenHistory from "./model/TokenHistory";
import { tryParseJson } from "./utils/Helper";
import https from "https";
import fs from "fs-extra";

const app = express();

app.use(helmet());
app.use(
	cors({
		origin: [/https*:\/\/shaunlwm\.me/, "http://localhost:3005"],
	})
);
app.use(compression());

if (process.env.ENVIRONMENT && process.env.ENVIRONMENT === "prod") {
	const options = {
		key: fs.readFileSync(process.env.SSL_KEY as string),
		cert: fs.readFileSync(process.env.SSL_CERT as string),
		ca: fs.readFileSync(process.env.SSL_CHAIN as string),
	};

	https.createServer(options, app).listen(process.env.SERVER_PORT, () => {
		console.log(`[server] PROD up and runnin on port ${process.env.SERVER_PORT}`);
	});
} else {
	app.listen(process.env.SERVER_PORT, () => {
		console.log(`[server] DEV up and runnin on port ${process.env.SERVER_PORT}`);
	});
}

app.use(express.static("public"));

app.get("/history/:token?", async (req, res) => {
	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page as string);
		if (isNaN(page)) {
			page = 1;
		}
	}

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
		{
			$sort: {
				lastUpdated: -1,
			},
		},
	];

	// @ts-ignore
	if (req.params.token) {
		agg.unshift({
			$match: {
				// @ts-ignore
				key: req.params.token,
			},
		});
	}

	// @ts-ignore
	const histories = await TokenHistory.aggregatePaginate(TokenHistory.aggregate(agg), {
		page,
		limit: 20,
	});

	return res.status(200).json({
		success: true,
		histories: histories.docs.map((history: TokenHistoryAggregateRaw) => {
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

export default app;
