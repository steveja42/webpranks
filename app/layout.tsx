'use client'
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'

import 'bootstrap/dist/css/bootstrap.css'
import '../src/index.css'
import '../src/App.css'

const navlogo = '/jesterhead-200.png'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showControls, setShowControls] = useState(true)

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="fun hijinks and pranks using webpages you choose" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-120x120.png" />
        <link rel="manifest" href="/manifest.json" />
        <title>Web Pranks</title>
        <Script
          data-goatcounter="https://4242.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.google.com/recaptcha/api.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <div className="App">
          <header>
            {showControls ? (
              <div id="conditional">
                <div id="fooalternate">
                  <Navbar id="navbar" className="mynav" expand="sm">
                    <Navbar.Brand as={Link} href="/">
                      <img id="navlogo" src={navlogo} alt="jesters hat" />
                      Web Pranks
                    </Navbar.Brand>
                    <Nav>
                      <OverlayTrigger placement="auto" trigger={['hover', 'click']} overlay={aboutpopover}>
                        <Navbar.Text>About</Navbar.Text>
                      </OverlayTrigger>
                      <OverlayTrigger placement="auto" trigger={['hover', 'click']} overlay={feedbackpopover}>
                        <Nav.Link as={Link} href="/feedback">Feedback</Nav.Link>
                      </OverlayTrigger>
                    </Nav>
                  </Navbar>
                </div>
              </div>
            ) : null}
          </header>
          <ShowControlsContext.Provider value={{ showControls, setShowControls }}>
            {children}
          </ShowControlsContext.Provider>
        </div>
      </body>
    </html>
  )
}

export const ShowControlsContext = React.createContext<{
  showControls: boolean
  setShowControls: (v: boolean) => void
}>({ showControls: true, setShowControls: () => {} })

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
)

const feedbackpopover = (
  <Popover id="popover-basic">
    <Popover.Header as="h3">Feedback</Popover.Header>
    <Popover.Body>
      <p>Here you can report bugs, request a custom prank, make feature requests or give a testimonial.</p>
    </Popover.Body>
  </Popover>
)
