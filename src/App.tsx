import React, { useState, useEffect, useRef } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams, useLocation,useHistory
} from "react-router-dom";
import { log } from './util'
import { PrankForm } from './prankform'
import './App.css'
export const version = .01

log(`version ${version} starting`)
//className="App-header"
function App(): JSX.Element {
  return (
    <div className="App">
      <Router>
        <Real/>
      </Router> 
    </div>
  );
}

const Testx = () =>  ( <Switch>
<Route path="/:url/:prank"> <Home/> </Route>
<Route path="/:url"> <Home /> </Route>
<Route path="/"> <Home /> </Route>
</Switch>)

const Real = () =>   <Switch>
<Route path="/:prank/:url"> <PrankForm /> </Route>
<Route path="/:prank"> <PrankForm /> </Route>
<Route path="/"> <PrankForm /> </Route>
</Switch>


function HomeButton() {
  const history = useHistory();

  function handleClick() {
    history.push("/foo");
  }

  return (
    <button type="button" onClick={handleClick}>
      Go home
    </button>
  );
  }

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Home() {
  const query = useQuery();
  log(`prank is ${query.get("prank")}`)
  console.log(useParams())
  useEffect(() => {    /** effect run on component load */
		console.log(`component load`)
	
	}, []);

  const location = useLocation();
  React.useEffect(() => {
    log(`location changed: ${location.pathname}`);
  }, [location])

return  <div>
    <h2>Home</h2>
    <HomeButton/>
  </div>
}





export default App;

/* 
 <Switch>
          <Route path="/:url/:prank"> <Home /> </Route>
          <Route path="/:url"> <Home /> </Route>
          <Route path="/"> <Home /> </Route>
        </Switch>
        */