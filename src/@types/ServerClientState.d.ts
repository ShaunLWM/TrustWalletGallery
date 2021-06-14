export interface InfoDiff {
	added: object;
	deleted: object;
	updated: object;
}

// typings for server history aggregate result
export interface TokenHistoryAggregateRaw {
	_id: string;
	key: string;
	infodiff: string;
	infoold: string;
	imgdiff: string;
	lastUpdated: number;
	type: "add" | "update";
	raw?: string;
	platform?: string;
}

// typings for ShortHistorySection
export interface HistoryRouteResults {
	success: boolean;
	histories: HistoryRouteItem[];
	msg?: string;
}

export interface HistoryRouteItem extends Omit<TokenHistoryAggregateRaw, "infodiff" | "infoold" | "raw"> {
	infodiff?: string;
	infoold?: string;
	raw?: TokenRawObj;
}

// typings for single TokenPage
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
		infodiff?: string;
		infoold?: string;
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
