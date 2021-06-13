import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { TokenResults, TokenResultsSuccess } from "../@types/ServerClientState";
import { getBaseUrl } from "../utils/EnvironmentManager";

const Container = styled.div`
	display: flex;
	flex-direction: column;
`;

const TokenImage = styled.img`
	height: 42px;
	width: 42px;
`

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
		<Container>
			<span>
				{token?.raw.name} [{token?.raw.symbol}]
			</span>
			<TokenImage src={`${getBaseUrl()}/img/token/${token?.key}.png`} alt={token?.key} />

			<pre>{JSON.stringify(token?.raw, null, 2)}</pre>
		</Container>
	);
}
