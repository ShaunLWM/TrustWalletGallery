import { Document, Model, model, Schema } from "mongoose";

export interface IToken {
	key: string;
	raw: string;
	img: string;
	platform: string;
}

const TokenSchemaFields: Record<keyof IToken, any> = {
	key: {
		type: String,
		unique: true,
		required: true,
	},
	raw: {
		type: String,
		unique: true,
		required: true,
	},
	img: {
		type: String,
		required: true,
	},
	platform: {
		type: String,
		required: true,
	},
};

const TokenSchema = new Schema<ITokenDocument, ITokenModel>(TokenSchemaFields, {
	timestamps: false,
});

export interface ITokenDocument extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDocument> {}

export default model<ITokenDocument, ITokenModel>("Token", TokenSchema);
