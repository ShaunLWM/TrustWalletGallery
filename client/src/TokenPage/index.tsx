import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TokenResults, TokenResultsSuccess } from "../@types/ServerClientState";
import { getBaseUrl } from "../utils/EnvironmentManager";

export default function TokenPage() {
	const { id } = useParams<{ id: string }>();
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState<string>();
	const [token, setToken] = useState<TokenResultsSuccess["token"]>();

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const results = await fetch(`${getBaseUrl()}/token/${id}`);
				const json = (await results.json()) as TokenResults;
				if (json.success) {
					setToken(json.token);
				} else {
					setToken(undefined);
					setError("Token doesn't exist");
				}

				setLoaded(true);
				setError("");
			} catch (e) {
				setLoaded(true);
				setError("Failed to load");
			}
		};

		if (!id) {
			setError("Missing or wrong token id");
		} else {
			fetchToken();
		}
	}, [id]);

	if (!loaded) {
		return <span>Loading..</span>;
	}

	if (error) {
		return <span>{error}</span>;
	}

	return (
		<>
			<div>
				<img src={`${getBaseUrl()}/img/token/${token?.key}.png`} alt={token?.key} />
				<span>
					{token?.raw.name} [{token?.raw.symbol}]
				</span>
				<code>{JSON.stringify(token?.raw, null, 2)}</code>
			</div>
		</>
	);
}
