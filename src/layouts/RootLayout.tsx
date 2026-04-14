import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'

import '../index.css'
import '../App.css'
import { enableDebugMode } from '../debugMode'
import { useLocalServer } from '../network'

const navlogo = '/jesterhead-200.png'

export const ShowControlsContext = React.createContext<{
	showControls: boolean
	setShowControls: (v: boolean) => void
}>({ showControls: true, setShowControls: () => {} })

function AboutNavItem() {
	const [show, setShow] = useState(false)
	const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
	const navigate = useNavigate()

	const scheduleHide = () => {
		hideTimer.current = setTimeout(() => setShow(false), 150)
	}
	const cancelHide = () => {
		if (hideTimer.current) clearTimeout(hideTimer.current)
	}

	const popover = (
		<Popover
			id="about-popover"
			onMouseEnter={cancelHide}
			onMouseLeave={scheduleHide}
		>
			<Popover.Header as="h3">About Web Pranks</Popover.Header>
			<Popover.Body>
				<p>
					<strong>Web Pranks</strong> is an interactive website prank tool and visual simulator.
					Ever wanted to virtually smash a website with a wrecking ball or play
					BTC Invaders on any URL?
				</p>
				<p>
					Pick any website address, choose a prank effect, and watch the chaos unfold.
					It's a harmless way to "wreck" any site for funny screenshots or videos—all on
					your screen only. Press <em>Back</em> or <em>Esc</em> to pause the mayhem.
				</p>
				<p>
					<strong>Available Pranks:</strong>
					<br />
					• <strong>Wrecking Ball</strong> (Physics-based destruction)
					<br />
					• <strong>All Fall Down</strong> (Gravity simulator)
					<br />
					• <strong>Happy Birthday</strong> (Surprise party overlay)
					<br />
					• <strong>BTC Invaders</strong> (Bitcoin space shooter)
				</p>
				<small>
					* All visual effects happen locally on your device. No actual websites are modified.
					Safe, client-side fun for jokers and developers.
					<br />
					<sup>†</sup> Use responsibly around bosses and IT departments.
				</small>
				<div className="mt-2">
					<a href="/about">Read more on our About Page</a>
				</div>
			</Popover.Body>
		</Popover>
	)

	return (
		<OverlayTrigger
			placement="auto"
			show={show}
			overlay={popover}
		>
			<Navbar.Text
				onMouseEnter={() => { cancelHide(); setShow(true) }}
				onMouseLeave={scheduleHide}
				onClick={() => navigate('/about')}
				style={{ cursor: 'pointer' }}
			>
				About
			</Navbar.Text>
		</OverlayTrigger>
	)
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [showControls, setShowControls] = useState(true)

	useEffect(() => {
		// Load GoatCounter analytics
		const script1 = document.createElement('script')
		script1.src = '/count.js'
		script1.async = true
		script1.setAttribute('data-goatcounter', '/count')
		document.head.appendChild(script1)

		return () => {
			// Cleanup if needed
		}
	}, [])

	return (
		<div className="App">
			<a href="#main-content" className="visually-hidden-focusable">Skip to main content</a>
			<header>
				{showControls ? (
					<div id="conditional">
						<div id="fooalternate">
							<Navbar id="navbar" className="mynav" expand="sm" variant="dark">
								<Navbar.Brand as={Link} to="/" onClick={(e: React.MouseEvent) => { if (e.altKey) { e.preventDefault(); enableDebugMode() } }}>
									<img id="navlogo" src={navlogo} alt="Web Pranks Logo - Colorful Jester Hat" width="163" height="200" />
									Web Pranks
								</Navbar.Brand>
								<Nav>
									<AboutNavItem />
									<OverlayTrigger placement="auto" trigger={['hover', 'click']} overlay={feedbackpopover}>
										<Nav.Link as={Link} to="/feedback">Feedback</Nav.Link>
									</OverlayTrigger>
									{useLocalServer && (
										<Navbar.Text style={{ color: '#ff9800', fontWeight: 'bold', fontSize: '0.8em' }}>
											⚠ LOCAL SERVER
										</Navbar.Text>
									)}
								</Nav>
							</Navbar>
						</div>
					</div>
				) : null}
			</header>
			<ShowControlsContext.Provider value={{ showControls, setShowControls }}>
				<main id="main-content">{children}</main>
			</ShowControlsContext.Provider>
		</div>
	)
}


const feedbackpopover = (
	<Popover id="popover-basic">
		<Popover.Header as="h3">Feedback</Popover.Header>
		<Popover.Body>
			<p>Here you can report bugs, request a custom prank, make feature requests or give a testimonial.</p>
		</Popover.Body>
	</Popover>
)
