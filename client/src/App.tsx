import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import ResetCSS from "./components/ResetCSS";
import Home from "./Home";
import TokenPage from "./TokenPage";

const Container = styled.div`
	height: 100%;
	width: 75%;
	flex: 1;
	margin: 20px auto 0px;
`;

function App() {
	return (
		<Container>
			<ResetCSS />
			<Router>
				<Switch>
					<Route exact path="/">
						<Home />
					</Route>
					<Route exact path="/token/:id">
						<TokenPage />
					</Route>
					<Route path="*">
						<span>404</span>
					</Route>
				</Switch>
			</Router>
		</Container>
	);
}

export default App;
