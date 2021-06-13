import React, { useEffect, useState } from "react";
import { HistoryRouteItem, HistoryRouteResults } from "../@types/ServerClientState";
import { getBaseUrl } from "../utils/EnvironmentManager";
import styled from "styled-components";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

const HistoryRowContainer = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	border-bottom: 1px solid rgba(35, 35, 35, 0.1);
	font-size: 14px;
`;

const HistoryLeft = styled.div`
	display: flex;
	align-items: center;
	padding-bottom: 4px;
`;

const HistoryId = styled.span`
	min-width: 120px;
`;

const HistoryLink = styled(Link)`
	text-decoration: none;
	color: black;
	&:focus,
	&:hover,
	&:visited,
	&:link,
	&:active {
		text-decoration: none;
		color: black;
	}
`;

const TokenImage = styled.img`
	width: 24px;
	height: 24px;
	margin-right: 8px;
	border-radius: 50px;
	border-width: 1px;
	border-style: solid;
	border-color: rgba(35, 35, 35, 0.4);
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
			return <span>Token published</span>;
		}

		const arr = [];
		if (history.infodiff) {
			if (history.infodiff.added && Object.keys(history.infodiff.added).length > 0) {
				arr.push(<span>Added {Object.keys(history.infodiff.added).length} keys</span>);
			}
			if (history.infodiff.deleted && Object.keys(history.infodiff.deleted).length > 0) {
				arr.push(<span>Added {Object.keys(history.infodiff.deleted).length} keys</span>);
			}
			if (history.infodiff.updated && Object.keys(history.infodiff.updated).length > 0) {
				arr.push(<span>Added {Object.keys(history.infodiff.updated).length} keys</span>);
			}
		}

		if (history.imgdiff) {
			arr.push(<span>Added new image</span>);
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
					<HistoryLink to={`/token/${history.key}#history-${history._id}`}>
						<HistoryRowContainer>
							<HistoryLeft>
								<HistoryId>#{history._id}</HistoryId>
								<TokenImage src={`${getBaseUrl()}/img/token/${history.key}.png`} alt="img" />
								{renderChangelog(history)}
							</HistoryLeft>
							{dayjs(history.lastUpdated).fromNow()}
						</HistoryRowContainer>
					</HistoryLink>
				);
			})}
		</>
	);
}
