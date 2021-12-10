import React, { useState, useEffect, useRef } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams, useLocation, useHistory
} from "react-router-dom";
import { log } from './util'
import { PrankRunner } from './prankrunner'
import './App.css'
export const version = .01

log(`version ${version} starting`)
//className="App-header"
function App(): JSX.Element {
  return (
    <div className="App">
      <header>
      <Routed /> 
      </header>
    </div>
  );
}

const Routed = () =><Router>
  <Switch>
  <Route path="/:prank/:url/:isRunning"> <PrankRunner /> </Route>
  <Route path="/:prank/:url"> <PrankRunner /> </Route>
  <Route path="/:prank"> <PrankRunner /> </Route>
  <Route path="/"> <PrankRunner /> </Route>
</Switch>
</Router> 







export default App;

/*
 <Switch>
          <Route path="/:url/:prank"> <Home /> </Route>
          <Route path="/:url"> <Home /> </Route>
          <Route path="/"> <Home /> </Route>
        </Switch>
        */