import dayjs from "dayjs";
import { detailedDiff } from "deep-object-diff";
import React, { useEffect, useState } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { HistoryRouteItem, HistoryRouteResults, InfoDiff } from "../@types/ServerClientState";
import { getBaseUrl } from "../utils/EnvironmentManager";
import { beautifyJson } from "../utils/Helper";

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
	color: #0095ff;
	cursor: pointer;
`;

const HistoryLink = styled(Link)`
	min-width: 120px;
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

interface Props {
	tokenKey?: string;
}

export default function ShortHistorySection({ tokenKey = "" }: Props) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState<string>();
	const [histories, setHistories] = useState<HistoryRouteItem[]>([]);

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const results = await fetch(`${getBaseUrl()}/history${tokenKey ? `/${tokenKey}` : ""}`);
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
	}, [tokenKey]);

	const renderChangelog = (history: HistoryRouteItem) => {
		if (history.type === "add") {
			return (
				<span>
					Token published - <b>{history.raw?.name}</b>
				</span>
			);
		}

		const arr = [];
		if (history.infodiff && history.infoold) {
			if (tokenKey) {
				arr.push(
					<ReactDiffViewer
						oldValue={beautifyJson(history.infodiff)}
						newValue={beautifyJson(history.infoold)}
						splitView={true}
						hideLineNumbers={true}
						compareMethod={DiffMethod.WORDS}
						styles={{
							diffContainer: {
								"max-width": "75%",
							},
						}}
					/>
				);
			} else {
				// if no token key, we just want a simple key changes count
				const infoDiff: InfoDiff = detailedDiff(JSON.parse(history.infodiff), JSON.parse(history.infoold)) as InfoDiff;
				if (infoDiff) {
					if (infoDiff.added && Object.keys(infoDiff.added).length > 0) {
						arr.push(<span>Added {Object.keys(infoDiff.added).length} keys</span>);
					}
					if (infoDiff.deleted && Object.keys(infoDiff.deleted).length > 0) {
						arr.push(<span>Added {Object.keys(infoDiff.deleted).length} keys</span>);
					}
					if (infoDiff.updated && Object.keys(infoDiff.updated).length > 0) {
						arr.push(<span>Added {Object.keys(infoDiff.updated).length} keys</span>);
					}
				}
			}
		}

		if (history.imgdiff) {
			arr.push(<span>Added new image</span>);
		}

		if (arr.length > 0) {
			return (
				<ul>
					{arr.map((p) => (
						<li>{p}</li>
					))}
				</ul>
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
					<HistoryLink to={`/token/${history.key}`}>
						<HistoryRowContainer>
							<HistoryLeft>
								<HistoryLink to={`/token/${history.key}#history-${history._id}`}>
									<HistoryId>#{history._id}</HistoryId>
								</HistoryLink>
								<TokenImage src={`${getBaseUrl()}/img/token/${history.key}.png`} alt="img" />
								{renderChangelog(history)}
							</HistoryLeft>
							<span title={dayjs(history.lastUpdated).toISOString()}>{dayjs(history.lastUpdated).fromNow()}</span>
						</HistoryRowContainer>
					</HistoryLink>
				);
			})}
		</>
	);
}
