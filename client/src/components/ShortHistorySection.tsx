import React, { useEffect, useState } from "react";
import { HistoryRouteItem, HistoryRouteResults } from "../@types/ServerClientState";
import { getBaseUrl } from "../utils/EnvironmentManager";
import styled from "styled-components";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

const HistoryRow = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
`;

const TokenImage = styled.img`
	width: 40px;
	height: 40px;
	margin-right: 8px;
	border-radius: 50px;
	border-width: 1px;
	border-style: solid;
	border-color: black;
`;

export default function ShortHistorySection() {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState<string>();
	const [histories, setHistories] = useState<HistoryRouteItem[]>([]);

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const results = await fetch(`${getBaseUrl()}/history`);
				const json = (await results.json()) as HistoryRouteResults;
				setLoaded(true);
				if (json.success) {
					setHistories(json.histories);
				} else {
					if (json.msg) {
						setError(json.msg);
					} else {
						setError("Error");
					}
				}
			} catch (e) {
				setLoaded(true);
				setError(e);
				setHistories([]);
			}
		};

		fetchHistory();
	}, []);

	const renderChangelog = (history: HistoryRouteItem) => {
		if (history.type === "add") {
			return <span>added token</span>;
		}

		const arr = [];
		if (Object.keys(history.infodiff.added).length > 0) {
			arr.push(<span>Added {Object.keys(history.infodiff.added).length} keys</span>);
		}
		if (Object.keys(history.infodiff.deleted).length > 0) {
			arr.push(<span>Added {Object.keys(history.infodiff.deleted).length} keys</span>);
		}
		if (Object.keys(history.infodiff.updated).length > 0) {
			arr.push(<span>Added {Object.keys(history.infodiff.updated).length} keys</span>);
		}

		if (arr.length > 0) {
			return (
				<li>
					{arr.map((p) => (
						<ul>{p}</ul>
					))}
				</li>
			);
		}
	};

	if (!loaded) {
		return <span>Loading..</span>;
	}

	if (error) {
		return <span>{error}</span>;
	}

	return (
		<>
			{histories.map((history: HistoryRouteItem) => {
				return (
					<HistoryRow>
						<Link to={`/token/${history.key}`}>{dayjs(history.lastUpdated).fromNow()}</Link>
						<TokenImage src={`${getBaseUrl()}/img/token/${history.key}.png`} alt="img" />
						{renderChangelog(history)}
					</HistoryRow>
				);
			})}
		</>
	);
}
