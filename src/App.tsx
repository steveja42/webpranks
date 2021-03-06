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
import Container from "react-bootstrap/Container"

import navlogo from './images/jesterhead-200.png'
import info from './images/info.png'

import { log } from './util'
import { PrankRunner } from './prankrunner'
import './App.css'
import { FeedbackForm, Donate } from './feedback'

export const version = .01



/*

    <img src={navlogo} alt="jesterhat" />
                <img src={surprisedGirl} alt="surprised girl" />
background-image: url("./images/surprised-3355958_200x.png");
<img src={questionMark} width="15" height="15" className="d-inline-block align-bottom" alt="i with circle around it" />

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
                    <img id="navlogo" src={navlogo} alt="jesters hat" />
                    Web Pranks
                </Navbar.Brand>
                  <Nav >
                    <OverlayTrigger placement="auto" trigger={['hover', 'click']} overlay={aboutpopover}>
                      <Navbar.Text>
                        About
                      </Navbar.Text>
                    </OverlayTrigger>
                    <OverlayTrigger placement="auto" trigger={['hover', 'click']} overlay={feedbackpopover}>

                    <Nav.Link as={NavLink} to="/feedback" activeClassName="navselected">Feedback</Nav.Link>
                    </OverlayTrigger>
                  </Nav>
                </Navbar >
              </div>
            </div>
            : null}
        </header >
        <Switch>
          <Route path="/feedback">
            <Container>
              <FeedbackForm />
            </Container>
          </Route>
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

const aboutpopover = (
  <Popover id="popover-basic">
    <Popover.Header as="h3">About</Popover.Header>
    <Popover.Body>
      <p>Ready for a little fun, humour or levity?
      Just enter the web address of your favorite (or least favorite) website, choose a prank<sup>*</sup>, and see what happens...<br />
      Then you can press <em>Back</em> or <em>Esc</em> to pause.</p>
      Whatever you do, don't go to your friends device and prank them!<br /><br />
      * Any apparent changes to websites only happen on your own device and don't effect the actual websites for other people. No animals were harmed in the making of this website.
    </Popover.Body>
  </Popover>
);

const feedbackpopover = (
  <Popover id="popover-basic">
    <Popover.Header as="h3">Feedback</Popover.Header>
    <Popover.Body>
      <p>Here you can report bugs, request a custom prank, make feature requests or give a testimonial.</p>
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