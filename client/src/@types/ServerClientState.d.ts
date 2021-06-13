export interface InfoDiff {
	added: object;
	deleted: object;
	updated: object;
}

export interface HistoryRouteItem {
	_id: string;
	key: string;
	infodiff?: InfoDiff;
	imgdiff?: string;
	lastUpdated: number;
	type: "add" | "update";
}

export interface HistoryRouteResults {
	success: boolean;
	histories: HistoryRouteItem[];
	msg?: string;
}

export type TokenResults = TokenResultsSuccess | TokenResultsFailed;

export interface TokenResultsFailed {
	success: false;
	msg: string;
}

export interface TokenResultsSuccess {
	success: true;
	token: {
		key: string;
		raw: TokenRawObj;
		img: string;
	};
	histories: {
		_id: string;
		key: string;
		infodiff?: InfoDiff;
		imgdiff?: string;
		lastUpdated: number;
		type: "add" | "update";
	}[];
}

export interface TokenRawObj {
	name?: string;
	symbol?: string;
	type?: string;
	decimals?: number;
	description?: string;
	website?: string;
	explorer?: string;
	research?: string;
	status?: string;
	id?: string;
}
