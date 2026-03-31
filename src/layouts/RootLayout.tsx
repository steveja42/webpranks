import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'

import 'bootstrap/dist/css/bootstrap.css'
import '../index.css'
import '../App.css'

const navlogo = '/jesterhead-200.png'

export const ShowControlsContext = React.createContext<{
	showControls: boolean
	setShowControls: (v: boolean) => void
}>({ showControls: true, setShowControls: () => {} })

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [showControls, setShowControls] = useState(true)

	useEffect(() => {
		// Load GoatCounter analytics
		const script1 = document.createElement('script')
		script1.src = '//gc.zgo.at/count.js'
		script1.async = true
		script1.setAttribute('data-goatcounter', 'https://4242.goatcounter.com/count')
		document.head.appendChild(script1)

		// Load Google reCAPTCHA
		const script2 = document.createElement('script')
		script2.src = 'https://www.google.com/recaptcha/api.js'
		script2.async = true
		document.head.appendChild(script2)

		return () => {
			// Cleanup if needed
		}
	}, [])

	return (
		<div className="App">
			<header>
				{showControls ? (
					<div id="conditional">
						<div id="fooalternate">
							<Navbar id="navbar" className="mynav" expand="sm">
								<Navbar.Brand as={Link} to="/">
									<img id="navlogo" src={navlogo} alt="jesters hat" />
									Web Pranks
								</Navbar.Brand>
								<Nav>
									<OverlayTrigger placement="auto" trigger={['hover', 'click']} overlay={aboutpopover}>
										<Navbar.Text>About</Navbar.Text>
									</OverlayTrigger>
									<OverlayTrigger placement="auto" trigger={['hover', 'click']} overlay={feedbackpopover}>
										<Nav.Link as={Link} to="/feedback">Feedback</Nav.Link>
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
	)
}

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
