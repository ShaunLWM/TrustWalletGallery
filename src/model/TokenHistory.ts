import { Document, Model, model, Schema } from "mongoose";

export interface ITokenHistory {
	_id: string;
	key: string;
	infodiff: string;
	imgdiff: string;
	lastUpdated: number;
	type: "add" | "update";
}

const TokenHistorySchemaFields: Record<keyof ITokenHistory, any> = {
	_id: {
		type: String,
		unique: true,
		required: true,
	},
	key: {
		type: String,
		unique: true,
		required: true,
	},
	infodiff: {
		type: String,
	},
	imgdiff: {
		type: String,
	},
	lastUpdated: {
		type: Number,
		default: +Date.now(),
	},
	type: {
		type: String,
		enum: ["add", "update"],
		required: true,
	},
};

const TokenHistorySchema = new Schema<ITokenHistoryDocument, ITokenHistoryModel>(TokenHistorySchemaFields, {
	timestamps: true,
});

export interface ITokenHistoryDocument extends ITokenHistory, Document {
	_id: string;
}

export interface ITokenHistoryModel extends Model<ITokenHistoryDocument> {}

export default model<ITokenHistoryDocument, ITokenHistoryModel>("TokenHistory", TokenHistorySchema);
