import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./Home";
import TokenPage from "./TokenPage";

function App() {
	return (
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
	);
}

export default App;
