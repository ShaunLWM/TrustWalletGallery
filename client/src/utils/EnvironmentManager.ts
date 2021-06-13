import { isDev } from "./Helper";

const DEV_BASE = "http://localhost:3005";
const PROD_BASE = process.env.PROD_BASE;

export const getBaseUrl = () => {
	if (isDev()) {
		return DEV_BASE;
	}
	return PROD_BASE;
};
