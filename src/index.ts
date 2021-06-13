import "dotenv/config";
import "./server";

import { detailedDiff } from "deep-object-diff";
import execa from "execa";
import fs from "fs-extra";
import md5File from "md5-file";
import mongoose from "mongoose";
import schedule from "node-schedule";
import path from "path";
import Token, { IToken } from "./model/Token";
import TokenHistory, { ITokenHistory } from "./model/TokenHistory";

const ASSET_FOLDER_NAME = "TrustWalletAssets";
const BLOCKCHAIN_WHITELISTED_FOLDER = ["binance", "bitcoin", "ethereum"];

const PROJECT_DIRECTORY = path.resolve(".");
const TRUST_WALLET_ASSET_DIRECTORY = path.resolve("..", ASSET_FOLDER_NAME);

const fetchGitRepository = async (force = false) => {
	// if (!fs.pathExistsSync(TRUST_WALLET_ASSET_DIRECTORY)) {
	// 	console.log(`Path doesn't exist. Cloning..`);
	// 	const results = await execa("git", [
	// 		"clone",
	// 		"https://github.com/trustwallet/assets",
	// 		TRUST_WALLET_ASSET_DIRECTORY,
	// 	]);
	// 	console.log(results);
	// }

	console.log(`Folder exist. Updating..`);
	process.chdir(TRUST_WALLET_ASSET_DIRECTORY);
	// const repoFetch = await execa("git", ["fetch"]);
	// // TODO: check the error message for not a git repo then clone again
	// console.log(repoFetch);
	// const repoPull = await execa("git", ["pull"]);
	// console.log(repoPull);
	// if (repoPull.stdout === "Already up to date." && !force) {
	// 	return console.log("Already up to date. Ignoring..");
	// }

	const historyWrites = [];
	const tokenWrites = [];

	const folders = fs.readdirSync("blockchains").filter((dir) => BLOCKCHAIN_WHITELISTED_FOLDER.includes(dir));

	for (const folder of folders) {
		const folderAssetsDirectory = path.resolve("blockchains", folder, "assets");
		if (!fs.pathExistsSync(folderAssetsDirectory)) continue;
		const coinsList = fs.readdirSync(folderAssetsDirectory);

		const keys = coinsList.map((c) => `${folder}-${c}`);
		const tokens = await Token.find().where("key").in(keys).lean().exec();

		for (const coin of coinsList) {
			const key = `${folder}-${coin}`;
			console.log(key);

			const coinPath = path.join(folderAssetsDirectory, coin);
			const coinDirectory = fs.readdirSync(coinPath);

			if (!coinDirectory.includes("logo.png") || !coinDirectory.includes("info.json")) {
				console.log(`${key}: missing assets`);
				continue;
			}

			const logoPath = path.join(coinPath, "logo.png");
			const imageHash = md5File.sync(logoPath);
			const coinJsonInfo = fs.readJsonSync(path.join(coinPath, "info.json"));
			const existingToken = tokens.find((token) => token.key === key);

			if (existingToken) {
				console.log(`${key} exist. checking changes.`);
				const historyObj: Partial<ITokenHistory> = {};
				const tokenObj: Partial<IToken> = {};

				// check info.json diff
				try {
					const existingTokenRaw = JSON.parse(existingToken.raw);
					const jsonChanges = detailedDiff(existingTokenRaw, coinJsonInfo) as any;
					if (
						(jsonChanges["added"] && Object.keys(jsonChanges["added"]).length > 0) ||
						(jsonChanges["deleted"] && Object.keys(jsonChanges["deleted"]).length > 0) ||
						(jsonChanges["updated"] && Object.keys(jsonChanges["updated"]).length > 0)
					) {
						console.log(`${key}: json changes`);
						historyObj.infodiff = JSON.stringify(jsonChanges);
						tokenObj.raw = JSON.stringify(coinJsonInfo);
					}
				} catch (error) {}

				// check logo.png
				if (existingToken.img !== imageHash) {
					// TODO: log changes
					console.log(`${key}: img changes`);
					historyObj.imgdiff = imageHash;
					tokenObj.img = imageHash;
					fs.copyFileSync(logoPath, path.resolve(PROJECT_DIRECTORY, "public", "img", "token", `${key}.png`));
				}

				if (Object.keys(historyObj).length > 0) {
					historyObj.lastUpdated = +Date.now();
					historyObj.type = "update";
					historyWrites.push({
						updateOne: {
							filter: { key },
							update: {
								$set: historyObj,
							},
							upsert: true,
						},
					});
				}

				if (Object.keys(tokenObj).length > 0) {
					tokenWrites.push({
						updateOne: {
							filter: { key },
							update: {
								$set: tokenObj,
							},
							upsert: true,
						},
					});
				}
			} else {
				console.log(`${key} doesn't exist`);
				fs.copyFileSync(logoPath, path.resolve(PROJECT_DIRECTORY, "public", "img", "token", `${key}.png`));
				const now = +Date.now();
				tokenWrites.push({
					insertOne: {
						document: {
							key,
							raw: JSON.stringify(coinJsonInfo),
							img: imageHash,
							platform: folder,
						},
					},
				});

				historyWrites.push({
					insertOne: {
						document: {
							key,
							type: "add",
							lastUpdated: now,
						},
					},
				});
			}
		}
	}

	if (tokenWrites.length > 0) {
		console.log(`${tokenWrites.length} tokenWrites to be added.`);
		await Token.collection.bulkWrite(tokenWrites);
	}

	if (historyWrites.length > 0) {
		console.log(`${historyWrites.length} historyWrites to be added.`);
		await TokenHistory.collection.bulkWrite(historyWrites);
	}

	console.log(`Done`);
};

(async () => {
	fs.ensureDirSync("public/img/token");
	const url = process.env.MONGODB as string;
	if (!url) throw new Error("Missing .env variables.");
	await mongoose.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	});

	const count = await Token.collection.estimatedDocumentCount();
	if (count < 1) {
		console.log(`Filling database..`);
		await fetchGitRepository(true);
	}

	schedule.scheduleJob("0 */12 * * *", async () => {
		await fetchGitRepository();
	});
})();
