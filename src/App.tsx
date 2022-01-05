import React, { useState, useEffect, useRef } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link, NavLink,
  useParams, useLocation, useHistory
} from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Popover from 'react-bootstrap/Popover'
import PopoverBody from 'react-bootstrap/PopoverBody'

import guy from './images/suit-g280f76b53_200.png'
import surprisedGirl from './images/surprised-3355958_200x.png'
import giraffe from './images/giraffe-400.png'
import questionMark from './images/question-mark-1829459_100.png'

import { log } from './util'
import { PrankRunner } from './prankrunner'
import './App.css'
export const version = .01



/*

    <img src={guy} alt="wacky guy" />
                <img src={surprisedGirl} alt="surprised girl" />
background-image: url("./images/surprised-3355958_200x.png");

                */
log(`version ${version} starting`)
//className="App-header"
export function App(): JSX.Element {
  const [showControls, setShowControls] = useState(true)
  const prankRunnerProps = { showControls, setShowControls }
  return (
    <Router>
      <div className="App">
        <header>
          {showControls ?
            <div id="conditional">
              <div id="fooalternate">
            
                < Navbar id="navbar" className="mynav" expand="sm" >

                  <Navbar.Brand as={NavLink} to="/">


                    Web Hijinks
                </Navbar.Brand>

                  <OverlayTrigger
                    placement="auto"
                    trigger={['hover', 'click']}

                    overlay={xpopover}
                  >
                    <img src={questionMark} width="15" height="15" className="d-inline-block align-bottom" alt="" />

                  </OverlayTrigger>



                </Navbar >


              </div>
              <img id="funny" src={giraffe} alt="" />

            </div>
            : null}
        </header >
        <Switch>
          <Route path="/about"> <About /> </Route>
          <Route path="/:prank/:url/:isRunning"> <PrankRunner {...prankRunnerProps} /> </Route>
          <Route path="/:prank/:url"> <PrankRunner {...prankRunnerProps} /> </Route>
          <Route path="/:prank"> <PrankRunner {...prankRunnerProps} /> </Route>
          <Route path="/"> <PrankRunner {...prankRunnerProps} /> </Route>
        </Switch>
      </div>
    </Router>
  );
}

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Simple tooltip
  </Tooltip>
);

const xpopover = (
  <Popover id="popover-basic">
    <Popover.Header as="h3">About</Popover.Header>
    <Popover.Body>
      In these perhaps too serious times a little fun, humour and levity might be needed.
      Just enter the web address of your favorite (or least favorite) website, choose a prank, and see what happens to the website...
    </Popover.Body>
  </Popover>
);

export function About() {
  return <div>about the app</div>
}



export default App;

/*
 <Switch>
          <Route path="/:url/:prank"> <Home /> </Route>
          <Route path="/:url"> <Home /> </Route>
          <Route path="/"> <Home /> </Route>
        </Switch>
        */