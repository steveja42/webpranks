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
									<img id="navlogo" src={navlogo} alt="Web Pranks Logo - Colorful Jester Hat" />
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
		<Popover.Header as="h3">About Web Pranks</Popover.Header>
		<Popover.Body>
			<p>
				Ever wanted to smash a website with a wrecking ball? Make the whole thing fall apart?
				Throw an uninvited birthday party on someone's homepage?
			</p>
			<p>
				Pick any website, choose your prank, and watch the chaos unfold — all on your screen only.
				Press <em>Back</em> or <em>Esc</em> to pause the mayhem.
			</p>
			<p>
				<strong>Available pranks:</strong> Wrecking Ball &bull; All Fall Down &bull; Happy Birthday &bull; BTC Invaders
			</p>
			<small>
				* All visual effects happen only on your own device. No actual websites are harmed, no animals
				were harmed, and absolutely nobody's feelings need be hurt.<sup>†</sup>
				<br />
				<sup>†</sup> Unless you turn the screen toward your boss.
			</small>
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
