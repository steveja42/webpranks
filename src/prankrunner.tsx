import React, { useState, useEffect, useRef, useReducer } from 'react'
import { log } from './util'
import { getKeyBoardHandler, getClickTouchHandler } from './io'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import { Form, Alert } from 'react-bootstrap'
import * as network from './network'
import { useWindowDimensions, useMousePosition } from './windowing'
import Popout from './popout'
import { domToObjects, scratchCanvas, PageInfo } from './domtoobjects'
import { logDomTree } from './dom'
import { PrankForm } from './prankform'
import { effectModules } from './pageEffects/modulelist'
import { setupWorld, resetScene, resetAndLoadImagesForNewPageScene } from './phaseri'
import { useParams, useNavigate ,useNavigationType, useLocation } from "react-router-dom";

network.post({ ping: "ping" }, 'init')   //ping the server that will fetch the page, in case it needs to be woken up or started
const isMobile = Math.min(window.screen.width, window.screen.height) < 768 || navigator.userAgent.indexOf("Mobi") > -1;


let game: Phaser.Game
type PrankUIParams = {
	prank: string
	url: string
	isRunning: string
};

export enum Phase {
	targetUrlNotEntered,
	targetUrlEntered,
	startPrankAfterMouseOrKeyPress,
	startingPrank,
	prankRunning,
	prankPaused,
	error
}
export let globalPhase = Phase.targetUrlNotEntered   //keep phase in global for io handlers to access
export const PhaseNext = "next"
export const PhaseTogglePause = "togglepause"

function phaseReducer(oldPhase, newPhase): Phase {
	switch (newPhase) {
		case PhaseNext:
			globalPhase = Phase.startingPrank;
			break
		case PhaseTogglePause:
			if (oldPhase === Phase.prankRunning)
				globalPhase = Phase.prankPaused
			else if (oldPhase === Phase.prankPaused)
				globalPhase = Phase.prankRunning
			else
				globalPhase = oldPhase
			break

		case Phase.targetUrlEntered:
			if (oldPhase === Phase.startPrankAfterMouseOrKeyPress)
				globalPhase = oldPhase
			else
				globalPhase = newPhase
			break
		case Phase.targetUrlNotEntered:
		case Phase.startPrankAfterMouseOrKeyPress:
		case Phase.startingPrank:
		case Phase.prankRunning:
		case Phase.prankPaused:
			globalPhase = newPhase
			break

		default:
			throw new Error();
	}
	return globalPhase
}

/**
 * Calls server to get the page at URL,
 *  and then pranks the page by manipulating the display of the page
 * @param props 
 */

export function PrankRunner(props: any) {
	const {showControls, setShowControls} = props

	const location = useLocation();
	const navigate = useNavigate ();
	const navType = useNavigationType()
	const params = useParams<PrankUIParams>();
	const [phase, dispatchPhase] = useReducer(phaseReducer, Phase.targetUrlNotEntered)
	const [targetUrl, setTargetUrl] = useState("")
	const [inputURL, setInputURL] = useState("")
	const [whichPrank, setWhichPrank] = useState(0)
	const [pageInfo, setPageInfo] = useState<PageInfo>(null)
	const [pageImage, setPageImage] = useState(null)
	const [isLoading, setIsLoading] = useState(null)
	const [showPopout, setShowPopout] = useState(false)
	const [currentScene, setCurrentScene] = useState<Phaser.Scene>()
	const [showFailure, setShowFailure] = useState("")
	const phaserParent = useRef(null)
	const debugPageImage = useRef(null)
	const debugImage = useRef(null)
	const bgDiv = useRef(null)
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const { x: xMouse, y: yMouse } = useMousePosition(window);
	const { x: worldX, y: worldY } = phaserParent?.current?.getBoundingClientRect() || {}

	const isRunning = (phase === Phase.prankRunning)

	useEffect(() => {    /** ------------------------------- effect run on component load ------------------------------------*/
		log(`component load`)
		//setShowPopout(true)
		const handleKeyDown = getKeyBoardHandler(setShowControls, setShowPopout, dispatchPhase)
		const handleClickOrTouch = getClickTouchHandler(dispatchPhase)
		const handleUnload = (e: BeforeUnloadEvent) => { console.log('window unloading'); setShowPopout(false) }

		window.addEventListener('beforeunload', handleUnload)
		document.addEventListener("keydown", handleKeyDown, false)
		window.addEventListener("click", handleClickOrTouch, false)
		window.addEventListener("touchstart", handleClickOrTouch, false)
		//
		let url = ""
		if (params.url) {
			url = decodeURIComponent(params.url)
			setInputURL(url)
			setTargetUrl(url)
			//loadingPromise = loadPage(url)
		}
		let i
		if (params.prank && !isNaN(i = parseInt(params.prank)) && i > -1 && i < effectModules.length) {
			setWhichPrank(i)
		}
		if (i !== undefined || url)
			navigate(`/${i}/${params.url || ""}/0`,{ replace: true, state: { whichPrank: i, inputURL: url, isRunning: false }})
		const shouldRun = params.isRunning === '1'
		if (shouldRun && params.url && i !== undefined) {
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
		log(`--------->phase changed to ${Phase[phase]}`)
		switch (phase) {
			case Phase.startPrankAfterMouseOrKeyPress:
				setShowControls(false);
				break
			case Phase.startingPrank:
				runPrank()
				break
			case Phase.prankRunning:
				if (currentScene?.scene?.isPaused()) {
					log(`resuming scene`)
					setShowControls(false)
					currentScene.scene.resume()
					currentScene.sound.resumeAll()
					currentScene.matter?.world?.resume()
					navigate(`/${whichPrank}/${encodeURIComponent(inputURL)}/${isRunning ? 1 : 0}`, { replace: true, state: { whichPrank, inputURL, isRunning }})
				}
				break
			case Phase.prankPaused:
				if (currentScene && !currentScene.scene.isPaused()) {
					log(`pausing scene`)
					setShowControls(true)
					currentScene.scene.pause()
					currentScene.sound.pauseAll()
					currentScene.matter?.world?.pause()
					navigate(`/${whichPrank}/${encodeURIComponent(inputURL)}/${isRunning ? 1 : 0}`, { replace: true, state:{ whichPrank, inputURL, isRunning }})
				}
				break
		}
	}, [phase])

	useEffect(() => {
		log(`path changed: ${location.pathname}`);
		if ( navType === "POP") {
			dispatchPhase(PhaseTogglePause)
		}
		//ga.send(["pageview", location.pathname]);
	}, [location])

	useEffect(() => {
		log(`new url: ${targetUrl} ${window.screen.width} x ${window.screen.height} ${navigator.userAgent} `);
		document.title = `${targetUrl}` || "Web Pranks";
		navigate(`/${whichPrank}/${encodeURIComponent(targetUrl)}/${isRunning ? 1 : 0}`, { replace: true, state:{ whichPrank, targetUrl, isRunning} })

		if (!isLoading && targetUrl) {
			dispatchPhase(Phase.targetUrlEntered)

			let width
			let height
			if (isMobile) {
				log(`is mobile`)
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

		const loadingPromise = network.getImageandHtml(url, width, height)
			.then(result => {
				setShowFailure("")
				setPageImage(result[0])
				return domToObjects(result[0], result[1], debugPageImage.current, debugImage.current, windowWidth, windowHeight, bgDiv.current)
			},
				reason => {
					log(`oh! an error occurred ${reason}`)
					setShowFailure(`Unable to find web page at ${url}`)
					setIsLoading(false)
					throw new Error(reason)
				}
			)
			.then(newPageInfo => {
				if (!game)
					game = setupWorld(phaserParent.current, width, height)

				return resetAndLoadImagesForNewPageScene(newPageInfo, currentScene)
			}).then(newPageInfo => {
				setPageInfo(newPageInfo)
				setIsLoading(null)
				setCurrentScene(null)
				return newPageInfo
			})
			.catch(error => {
				log(error.message)
				setPageInfo(null)
			})
		setIsLoading(loadingPromise)
		return loadingPromise
	}


	useEffect(() => {
		navigate(`/${whichPrank}/${encodeURIComponent(inputURL)}/${isRunning ? 1 : 0}`, { replace: true, state:{ whichPrank, inputURL, isRunning} })
	}, [whichPrank]);


	async function runPrank(iPrank = whichPrank, loadingPromise = isLoading) {
		//xphase = Phase.startingPrank  //use global so keyboard handler sees it right away
		//dispatchPhase("next")
		try {
			let altPageInfo
			if (loadingPromise)
				altPageInfo = await loadingPromise
			else
				altPageInfo = pageInfo
			if (altPageInfo) {
				log(`running prank ${effectModules[iPrank].title}`)
				if (currentScene) {
					currentScene.scene.remove()
					setCurrentScene(null)
				}
				import('./pageEffects/' + effectModules[iPrank].fileName)
					.then(module => {
						setShowControls(false);
						dispatchPhase(Phase.prankRunning)
						navigate(`/${iPrank}/${encodeURIComponent(inputURL)}/1`, {state:{whichPrank: iPrank, inputURL, isRunning: true }})
						return setCurrentScene(module.doPageEffect(altPageInfo))
					})
					.catch(err => log(err.message))
			}
		} catch (error) {
			log(error.message)
			dispatchPhase(Phase.error)
			setCurrentScene(null)
		}

	}
	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		dispatchPhase(Phase.startPrankAfterMouseOrKeyPress)
	}

	const pageLoaded = (!!pageInfo)
	const formProps = { isLoading, setTargetUrl, onSubmit, whichPrank, setWhichPrank, pageLoaded, inputURL, setInputURL, showPopout, setShowPopout, phase, dispatchPhase }

	return <div id="foo">

		<div id="bgDiv" ref={bgDiv} style={{ display: "none" }}></div>
		<Alert show={showFailure !== ""} transition={null} variant="danger" onClose={() => setShowFailure("")} dismissible>
			<Alert.Heading>Error. {showFailure}</Alert.Heading>
		</Alert>
		{showPopout ? getPopout() : null}
		{showControls ? <PrankForm {...formProps} /> : null}

		{(phase === Phase.startPrankAfterMouseOrKeyPress) ?
			<div>
				<img id="pageImage" src={pageImage} className="Screenshot" alt="screen capture of the webpage at url" />
				<h2 id="prompt" className="prompt"> Tap, Click or Type <br></br>any key to continue ...</h2>
			</div> : null}

		<div className="game" ref={phaserParent} />
	</div>

	/** This returns the HTML for the popout debugging window*/
	function getPopout() {

		return (
			<Popout title='WebPranks Info' width={windowWidth} height={windowHeight} closeWindow={() => setShowPopout(false)}>
				<div>
					<p> Window size: {windowWidth}:{windowHeight} World Mouse position: {xMouse - worldX}:{yMouse - worldY} </p>
					<Button onClick={e => logDomTree(pageInfo.doc.body)} disabled={!pageInfo?.doc?.body}>log dom</Button>
				</div>
				<img id="debugImage" ref={debugImage} className="Screenshot" alt="debug" />
				<img id="pageImage" ref={debugPageImage} className="Screenshot" alt="screen capture of the webpage at url" />
			</Popout>
		);
	}
}


