export interface InfoDiff {
	added: object;
	deleted: object;
	updated: object;
}

export interface HistoryRouteItem {
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

export type TokenResults =
	| {
			success: false;
			msg: string;
	  }
	| {
			success: true;
			token: {
				key: string;
				raw: string;
				img: string;
			};
			histories: {
				key: string;
				infodiff?: InfoDiff;
				imgdiff?: string;
				lastUpdated: number;
				type: "add" | "update";
			}[];
	  };
