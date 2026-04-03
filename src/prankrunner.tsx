import React, { useState, useEffect, useRef, useReducer } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ShowControlsContext } from './layouts/RootLayout'
import { log, ll } from './util'
import { getKeyBoardHandler, getClickTouchHandler } from './io'
import Button from 'react-bootstrap/Button'
import { Alert } from 'react-bootstrap'
import * as network from './network'
import { useWindowDimensions, useMousePosition } from './windowing'
import Popout from './popout'
import type { PageInfo } from './domtoobjects'
import type Phaser from 'phaser'
import { logDomTree } from './dom'
import { PrankForm } from './prankform'
import { effectModules } from './pageEffects/modulelist'

const effectModuleLoaders: Record<string, () => Promise<{ doPageEffect: (pageInfo: PageInfo) => unknown }>> = {
	'wreckingball': () => import('./pageEffects/wreckingball'),
	'allfalldown': () => import('./pageEffects/allfalldown'),
	'birthday': () => import('./pageEffects/birthday'),
	'btcinvaders/scenes/btcinvaders': () => import('./pageEffects/btcinvaders/scenes/btcinvaders'),
}

network.post({ ping: "ping" }, 'init')   //ping the server that will fetch the page, in case it needs to be woken up or started
const isMobile = typeof window !== 'undefined' && (Math.min(window.screen.width, window.screen.height) < 768 || navigator.userAgent.indexOf("Mobi") > -1);

let game: Phaser.Game
let lastLoadedUrl: string | null = null
type PrankRunnerProps = {
	prank: string | undefined
	url: string | undefined
	isRunning: string | undefined
	showControls?: boolean
	setShowControls?: (v: boolean) => void
};

import { Phase, phaseState, PhaseNext, PhaseTogglePause } from './phase'
export { Phase, PhaseNext, PhaseTogglePause }

function phaseReducer(oldPhase: Phase, newPhase: Phase | string): Phase {
	switch (newPhase) {
		case PhaseNext:
			phaseState.current = Phase.startingPrank;
			break
		case PhaseTogglePause:
			if (oldPhase === Phase.prankRunning)
				phaseState.current = Phase.prankPaused
			else if (oldPhase === Phase.prankPaused)
				phaseState.current = Phase.prankRunning
			else
				phaseState.current = oldPhase
			break

		case Phase.targetUrlEntered:
			if (oldPhase === Phase.startPrankAfterMouseOrKeyPress)
				phaseState.current = oldPhase
			else
				phaseState.current = newPhase
			break
		case Phase.targetUrlNotEntered:
		case Phase.startPrankAfterMouseOrKeyPress:
		case Phase.startingPrank:
		case Phase.prankRunning:
		case Phase.prankPaused:
			phaseState.current = newPhase
			break

		default:
			throw new Error();
	}
	return phaseState.current
}

/**
 * Calls server to get the page at URL,
 *  and then pranks the page by manipulating the display of the page
 */
export function PrankRunner(props: PrankRunnerProps) {
	const { prank: prankParam, url: urlParam, isRunning: isRunningParam } = props
	const navigate = useNavigate()
	const location = useLocation()
	const { prank: paramPrank, url: paramUrl, isRunning: paramIsRunning } = useParams<{ prank?: string; url?: string; isRunning?: string }>()

	const { setShowControls: setNavbarVisible } = React.useContext(ShowControlsContext)
	const [showControls, setShowControlsRaw] = useState(true)
	function setShowControls(v: boolean) {
		setShowControlsRaw(v)
		setNavbarVisible(v)
		document.body.style.overflow = v ? '' : 'hidden'
	}
	const [phase, dispatchPhase] = useReducer(phaseReducer, Phase.targetUrlNotEntered)
	const [targetUrl, setTargetUrl] = useState("")
	const [inputURL, setInputURL] = useState("")
	const [whichPrank, setWhichPrank] = useState(0)
	const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
	const [pageImage, setPageImage] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState<Promise<void | PageInfo> | boolean | null>(null)
	const [showPopout, setShowPopout] = useState(false)
	const [noContinuePrompt, setNoContinuePrompt] = useState(false)
	const [currentScene, setCurrentScene] = useState<Phaser.Scene | undefined>()
	const [showFailure, setShowFailure] = useState("")
	const phaserParent = useRef<HTMLDivElement>(null)
	const debugPageImage = useRef<HTMLImageElement>(null)
	const debugImage = useRef<HTMLImageElement>(null)
	const bgDiv = useRef<HTMLDivElement>(null)
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const { x: xMouse, y: yMouse } = useMousePosition(window);
	const { x: worldX, y: worldY } = phaserParent?.current?.getBoundingClientRect() || {}

	const isRunning = (phase === Phase.prankRunning)

	useEffect(() => {    /** ------------------------------- effect run on component load ------------------------------------*/
		log(ll.info, `component load`)
		const dispatch = dispatchPhase as (phase: unknown) => void
		const handleKeyDown = getKeyBoardHandler(setShowControls, setShowPopout, dispatch)
		const handleClickOrTouch = getClickTouchHandler(dispatch)
		const handleUnload = () => { console.log('window unloading'); setShowPopout(false) }

		window.addEventListener('beforeunload', handleUnload)
		document.addEventListener("keydown", handleKeyDown, false)
		window.addEventListener("click", handleClickOrTouch, false)
		window.addEventListener("touchstart", handleClickOrTouch, false)

		let url = ""
		if (urlParam) {
			url = decodeURIComponent(urlParam)
			setInputURL(url)
			setTargetUrl(url)
		}
		let i: number | undefined
		if (prankParam) {
			const bySlug = effectModules.findIndex(m => m.slug === prankParam)
			const byIndex = parseInt(prankParam)
			if (bySlug > -1) {
				i = bySlug
			} else if (!isNaN(byIndex) && byIndex > -1 && byIndex < effectModules.length) {
				i = byIndex
			}
			if (i !== undefined) setWhichPrank(i)
		}
		if (i !== undefined || url)
			navigate(`/${effectModules[i ?? 0].slug}/${urlParam || ""}`, { replace: true })
		const shouldRun = isRunningParam === '1'
		if (shouldRun && urlParam && i !== undefined) {
			dispatchPhase(Phase.startPrankAfterMouseOrKeyPress)
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown, false);
			window.removeEventListener('beforeunload', handleUnload);
			window.removeEventListener("click", handleClickOrTouch, false)
			window.removeEventListener("touchstart", handleClickOrTouch, false)
		};
	}, []);

	useEffect(() => {
		log(ll.info, `--------->phase changed to ${Phase[phase]}`)
		const activePhases = [Phase.startPrankAfterMouseOrKeyPress, Phase.startingPrank, Phase.prankRunning, Phase.prankPaused]
		document.title = activePhases.includes(phase) && targetUrl
			? targetUrl
			: "Web Pranks - Prank Any Website with Funny Visual Effects"
		switch (phase) {
			case Phase.startPrankAfterMouseOrKeyPress:
				setShowControls(false);
				break
			case Phase.startingPrank:
				runPrank()
				break
			case Phase.prankRunning:
				if (!history.state?.prankRunning)
					history.pushState({ prankRunning: true }, '', window.location.pathname + '#running')
				else
					history.replaceState({ prankRunning: true }, '', window.location.pathname + '#running')
				if (currentScene?.scene?.isPaused()) {
					log(ll.info, `resuming scene`)
					setShowControls(false)
					currentScene.scene.resume()
					currentScene.sound.resumeAll()
					currentScene.matter?.world?.resume()
					currentScene.physics?.world?.resume()
				}
				break
			case Phase.prankPaused:
				history.replaceState({ prankRunning: true }, '', window.location.pathname)
				if (currentScene && !currentScene.scene.isPaused()) {
					log(ll.info, `pausing scene`)
					setShowControls(true)
					currentScene.scene.pause()
					currentScene.sound.pauseAll()
					currentScene.matter?.world?.pause()
					currentScene.physics?.world?.pause()
				}
				break
		}
	}, [phase, targetUrl])

	useEffect(() => {
		const handlePopState = () => {
			if (!targetUrl) return
			const prankPath = '/' + effectModules[whichPrank].slug + '/' + encodeURIComponent(targetUrl)
			if (window.location.pathname !== prankPath) return
			if (window.location.hash === '#running') {
				dispatchPhase(Phase.prankRunning)
			} else {
				dispatchPhase(Phase.prankPaused)
			}
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [targetUrl, whichPrank])

	useEffect(() => {
		if (location.pathname === '/') {
			setInputURL('')
			setTargetUrl('')
			lastLoadedUrl = null
			dispatchPhase(Phase.targetUrlNotEntered)
			setShowControls(true)
		}
	}, [location.pathname])

	useEffect(() => {
		log(ll.info, `new url: ${targetUrl} ${window.screen.width} x ${window.screen.height} ${navigator.userAgent} `);
		if (targetUrl) {
			const desired = `/${effectModules[whichPrank].slug}/${encodeURIComponent(targetUrl)}`
			if (location.pathname !== desired)
				navigate(desired, { replace: true })
		}

		if (!isLoading && targetUrl && lastLoadedUrl !== targetUrl) {
			lastLoadedUrl = targetUrl
			dispatchPhase(Phase.targetUrlEntered)

			let width: number | undefined
			let height: number | undefined
			if (isMobile) {
				log(ll.info, `is mobile`)
				width = window.screen.width
				height = window.screen.height
			}
			loadPage(targetUrl, width, height)
		}
	}, [targetUrl]);

	//load webpage when url changes
	function loadPage(url: string, width = windowWidth, height = windowHeight) {
		setPageImage(null)
		setPageInfo(null)
		log(ll.info, `fetching page at url ${url} with size ${width} x ${height}`)

		const phaseriPromise = import('./phaseri').then(({ setupWorld }) => {
			if (!game)
				game = setupWorld(phaserParent.current!, width, height)
		}).catch(err => log(ll.error, `phaseri setup failed: ${err.message}`))

		const loadingPromise = network.getImageandHtml(url, width, height)
			.then(async result => {
				setShowFailure("")
				setPageImage(result[0])
				const { domToObjects } = await import('./domtoobjects')
				return domToObjects(result[0], result[1], debugPageImage.current!, debugImage.current!, windowWidth, windowHeight, bgDiv.current!)
			},
				reason => {
					log(ll.error, `oh! an error occurred ${reason}`)
					setShowFailure(`Unable to find web page at ${url}`)
					setIsLoading(false)
					throw new Error(reason)
				}
			)
			.then(async newPageInfo => {
				await phaseriPromise
				const { resetAndLoadImagesForNewPageScene } = await import('./phaseri')
				return resetAndLoadImagesForNewPageScene(newPageInfo)
			}).then(newPageInfo => {
				setPageInfo(newPageInfo)
				setIsLoading(null)
				setCurrentScene(undefined)
				return newPageInfo
			})
			.catch(error => {
				log(ll.error, (error as Error).message)
				setPageInfo(null)
				setIsLoading(false)
			})
		setIsLoading(loadingPromise)
		return loadingPromise
	}

	useEffect(() => {
		if (inputURL)
			navigate(`/${effectModules[whichPrank].slug}/${encodeURIComponent(inputURL)}`, { replace: true })
	}, [whichPrank]);

	async function runPrank(iPrank = whichPrank, loadingPromise = isLoading) {
		try {
			let altPageInfo
			if (loadingPromise)
				altPageInfo = await loadingPromise
			else
				altPageInfo = pageInfo
			if (altPageInfo) {
				log(ll.info, `running prank ${effectModules[iPrank].title}`)
				const { setCurrentScene: setPhaseriScene } = await import('./phaseri')
				if (currentScene) {
					currentScene.scene.remove()
					setCurrentScene(undefined)
					setPhaseriScene(undefined)
				}
				effectModuleLoaders[effectModules[iPrank].fileName]()
					.then(module => {
						const scene = module.doPageEffect(altPageInfo as PageInfo) as Phaser.Scene
						setPhaseriScene(scene)
						setCurrentScene(scene)
						setShowControls(false);
						dispatchPhase(Phase.prankRunning)
						window.goatcounter?.count({ path: 'prank-start/' + effectModules[iPrank].slug, title: 'Prank Start: ' + effectModules[iPrank].title, event: true })
					})
					.catch(err => log(ll.error, err.message))
			}
		} catch (error) {
			log(ll.error, (error as Error).message)
			dispatchPhase(Phase.error)
			const { setCurrentScene: setPhaseriScene } = await import('./phaseri')
			setPhaseriScene(undefined)
			setCurrentScene(undefined)
		}
	}

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		dispatchPhase(Phase.startPrankAfterMouseOrKeyPress)
	}

	const pageLoaded = (!!pageInfo)
	const formProps = { isLoading, setTargetUrl, onSubmit, whichPrank, setWhichPrank, pageLoaded, inputURL, setInputURL, showPopout, setShowPopout, phase, noContinuePrompt, setNoContinuePrompt }

	return <div id="foo">

		<div id="bgDiv" ref={bgDiv} style={{ display: "none" }}></div>
		<Alert show={showFailure !== ""} transition={undefined} variant="danger" onClose={() => setShowFailure("")} dismissible>
			<Alert.Heading>Error. {showFailure}</Alert.Heading>
		</Alert>
		{showPopout ? getPopout() : null}
		{showControls ? <PrankForm {...formProps} /> : null}

		{(phase === Phase.startPrankAfterMouseOrKeyPress || phase === Phase.startingPrank) ?
			<div>
				<img id="pageImage" src={pageImage ?? undefined} className="Screenshot" alt="screen capture of the webpage at url" />
				{!noContinuePrompt && phase === Phase.startPrankAfterMouseOrKeyPress && <h2 id="prompt" className="prompt"> Tap, Click or Type <br></br>any key to continue ...</h2>}
			</div> : null}

		<div className="game" ref={phaserParent} style={{ visibility: phase === Phase.prankRunning || phase === Phase.prankPaused ? 'visible' : 'hidden' }} />
	</div>

	/** This returns the HTML for the popout debugging window*/
	function getPopout() {
		return (
			<Popout title='WebPranks Info' width={windowWidth} height={windowHeight} closeWindow={() => setShowPopout(false)}>
				<div>
					<p> Window size: {windowWidth}:{windowHeight} World Mouse position: {xMouse - (worldX ?? 0)}:{yMouse - (worldY ?? 0)} </p>
					<Button onClick={() => logDomTree(pageInfo!.doc.body)} disabled={!pageInfo?.doc?.body}>log dom</Button>
				</div>
				<img id="debugImage" ref={debugImage} className="Screenshot" alt="debug" />
				<img id="pageImage" ref={debugPageImage} className="Screenshot" alt="screen capture of the webpage at url" />
			</Popout>
		);
	}
}
