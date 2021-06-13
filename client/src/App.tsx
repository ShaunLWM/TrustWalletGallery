import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import Home from "./Home";
import TokenPage from "./TokenPage";

const Container = styled.div`
	height: 100%;
	width: 100%;
	flex: 1;
`;

function App() {
	return (
		<Container>
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
