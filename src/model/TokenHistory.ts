import { Document, Model, model, Schema } from "mongoose";
import { default as PaginateAggregatePlugin }  from 'mongoose-aggregate-paginate-v2';

export interface ITokenHistory {
	_id: string;
	key: string;
	infodiff: string;
	infoold: string;
	imgdiff: string;
	lastUpdated: number;
	type: "add" | "update";
}

const TokenHistorySchemaFields: Record<keyof ITokenHistory, any> = {
	_id: {
		type: String,
		required: true,
	},
	key: {
		type: String,
		required: true,
	},
	infodiff: {
		type: String,
	},
	infoold: {
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
	timestamps: false,
	_id: false,
});

TokenHistorySchema.plugin(PaginateAggregatePlugin);

export interface ITokenHistoryDocument extends ITokenHistory, Document {
	_id: string;
}

export interface ITokenHistoryModel extends Model<ITokenHistoryDocument> {}

export default model<ITokenHistoryDocument, ITokenHistoryModel>("TokenHistory", TokenHistorySchema);
