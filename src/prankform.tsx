import React, { useState, useEffect, useRef, useReducer } from 'react'
import { log, keyBoardHandler } from './util'
//import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import { Form, Alert } from 'react-bootstrap'
import * as network from './network'
import { useWindowDimensions, useMousePosition } from './windowing'
import Popout from './popout'
import { domToObjects, scratchCanvas, PageInfo } from './domtoobjects'
import { logDomTree } from './dom'
import { effectModules } from './pageEffects/modulelist'
import { setupWorld, resetScene, resetAndLoadImagesForNewPageScene } from './phaseri'
import { useParams, useHistory, useLocation } from "react-router-dom";

network.post({ ping: "ping" }, 'init')   //ping the server that will fetch the page, in case it needs to be woken up or started
let game: Phaser.Game
const prankList = effectModules.map((effectModule, index) => <option key={index} value={index}>{effectModule.title}</option>)
let prevUrl
type PrankUIParams = {
	prank: string
	url: string
	isRunning: string
};
/**
 * Calls server to get the page at URL,
 *  and then pranks the page by manipulating the display of the page
 * @param props 
 */

export function PrankForm(props: any) {

	const location = useLocation();
	const history = useHistory();
	const params = useParams<PrankUIParams>();
	const [inputURL, setInputURL] = useState("")
	const [whichPrank, setWhichPrank] = useState(0)
	const [pageInfo, setPageInfo] = useState<PageInfo>(null)
	const [showControls, setShowControls] = useState(true)
	const [isLoading, setIsLoading] = useState(null)
	const [isRunning, setIsRunning] = useState(false)
	const [showPopout, setShowPopout] = useState(false)
	const [toggleScenePause, setTogglePauseScene] = useState(false)
	const [currentScene, setCurrentScene] = useState<Phaser.Scene>()
	const [showFailure, setShowFailure] = useState("")
	const phaserParent = useRef(null)
	const debugPageImage = useRef(null)
	const debugImage = useRef(null)
	const bgDiv = useRef(null)
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const { x: xMouse, y: yMouse } = useMousePosition(window);
	const protocol = 'http://'
	const { x: worldX, y: worldY } = phaserParent?.current?.getBoundingClientRect() || {}

	useEffect(() => {    /** effect run on component load */
		log(`component load`)
		//game = setupWorld(phaserParent.current, windowWidth, windowHeight)

		//setShowPopout(true)
		const handleKeyDown = keyBoardHandler(setTogglePauseScene, setShowControls, setShowPopout)
		const handleUnload = (e: BeforeUnloadEvent) => { console.log('window unloading'); setShowPopout(false) }

		window.addEventListener('beforeunload', handleUnload)
		document.addEventListener("keydown", handleKeyDown, false)
		let loadingPromise
		let url = ""
		if (params.url) {
			url = decodeURIComponent(params.url)
			setInputURL(url)
			prevUrl = url
			loadingPromise = loadPage(url)
		}
		let i 
		if (params.prank && !isNaN(i = parseInt(params.prank)) && i > -1 && i < effectModules.length) {
			setWhichPrank(i)
		}
		const shouldRun = params.isRunning === '1' 
		if (shouldRun && params.url && i !== undefined) {
			runPrank(i, loadingPromise)
		}
		else if (i !== undefined || url)
			history.replace(`/${i}/${params.url || ""}/0`, { whichPrank: i, inputURL: url, isRunning: false })

		const unlisten = history.listen((location, action) => {
			// location is an object like window.location
			console.log(action, location.pathname, location.state)
			if (action === "POP") {
				setTogglePauseScene(prev => !prev)
				setShowControls(prev => { return !prev })
			}
		})

		return () => {
			document.removeEventListener("keydown", handleKeyDown, false);
			window.removeEventListener('beforeunload', handleUnload);
			unlisten()
		};
	}, []);

	useEffect(() => {
		log(`path changed: ${location.pathname}`);
		//ga.send(["pageview", location.pathname]);
	}, [location]);

	useEffect(() => {
		if (currentScene) {
			if (currentScene.scene.isPaused()) {
				log(`resuming scene`)
				setIsRunning(true)
				currentScene.scene.resume()
				currentScene.matter?.world?.resume()
			}
			else {
				log(`pausing scene`)
				setIsRunning(false)
				currentScene.scene.pause()
				currentScene.matter?.world?.pause()
			}
		}
	}, [toggleScenePause])

	//load webpage when url changes
	function loadPage(url: string) {
		const loadingPromise = network.getImageandHtml(url, windowWidth, windowHeight)
			.then(result => {
				setShowFailure("")
				return domToObjects(result[0], result[1], debugPageImage.current, debugImage.current, windowWidth, windowHeight, bgDiv.current)
			},
				reason => {
					log(`oh! an error occurred ${reason}`)
					setShowFailure(`Unable to get web page at ${url}`)
					setIsLoading(false)
					throw new Error(reason)
				}
			)
			.then(newPageInfo => {
				if (!game)
					game = setupWorld(phaserParent.current, windowWidth, windowHeight)

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
		document.title = `Pranking: ${inputURL} `;
	}, [inputURL]);


	async function runPrank(iPrank = whichPrank, loadingPromise = isLoading) {
		try {
			let altPageInfo
			if (loadingPromise)
				altPageInfo = await loadingPromise
			else
				altPageInfo = pageInfo
			if (altPageInfo) {
				log(`running prank ${effectModules[iPrank].title}`)
				if (currentScene)
					currentScene.scene.remove()
				//phaserParent.current.focus()
				import('./pageEffects/' + effectModules[iPrank].fileName)
					.then(module => {
						setShowControls(false);
						setIsRunning(true)
						history.push(`/${iPrank}/${encodeURIComponent(inputURL)}/1`, { whichPrank: iPrank, inputURL, isRunning: true })
						return setCurrentScene(module.doPageEffect(altPageInfo))
					})
					.catch(err => log(err.message))
			}
		} catch (error) {
			log(error.message)
			setCurrentScene(null)
		}

	}

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		runPrank()
	}

	const onFocus = () => {
		if (inputURL.trim() === '') {
			setInputURL(protocol)
		}
	}
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputURL(e.target.value)
	}

	function onURLWasInput() {
		if ((inputURL.trim() === protocol) || (inputURL.trim() === ""))
			return
		if (inputURL !== prevUrl) {
			prevUrl = inputURL
			document.getElementById("prank").focus()   //change focus to remove mobile onscreen keyboard before loading
			loadPage(inputURL)
			history.replace(`/${whichPrank}/${encodeURIComponent(inputURL)}/${isRunning ? 1 : 0}`, { whichPrank, inputURL, isRunning })
		}
	}
	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter')
			e.preventDefault();
		if (e.key === "Backspace")
			e.stopPropagation()
	}
	const onBlur = () => {
		if (inputURL.trim() === protocol) {
			setInputURL('')
		} else {
			onURLWasInput()
		}
	}

	const onAnimationStart = (animEvent: React.AnimationEvent<HTMLInputElement>) => {
		log(`anim start ${animEvent.animationName}`)
		if (animEvent.animationName === 'AutoFillStart')
			onURLWasInput()
	}

	return <div id="foo">
		<div id="bgDiv" ref={bgDiv} style={{ display: "none" }}></div>
		{showPopout ? getPopout() : null}
		{showControls ? <div id="togglediv">

			<Form onSubmit={onSubmit} className="myform" >

				<Alert show={showFailure !== ""} transition={null} variant="danger" onClose={() => setShowFailure("")} dismissible>
					<Alert.Heading>Error. {showFailure}</Alert.Heading>
				</Alert>
				<Form.Group controlId="url">
					<Form.Label>Choose a website</Form.Label>
					<Form.Control name="targetUrl" type="url" value={inputURL} onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} onChange={onChange} onAnimationStart={onAnimationStart} placeholder="Enter a URL" required />
				</Form.Group>
				<Form.Group controlId="prank">
					<Form.Label>Choose a prank</Form.Label>
					<Form.Control
						as="select"
						value={whichPrank}
						onChange={e => {
							const x = parseInt(e.target.value)
							setWhichPrank(x)
							history.replace(`/${x}/${encodeURIComponent(inputURL)}/${isRunning ? 1 : 0}`, { whichPrank: x, inputURL, isRunning })
						}}
					>
						{prankList}
					</Form.Control>
				</Form.Group>
				<Button type="submit" value="Submit" disabled={isLoading || !pageInfo} >
					{isLoading ? 'Loading…' : 'Prank It'}
					{isLoading && <Spinner animation="border" role="status " size="sm">
						<span className="sr-only">Loading...</span>
					</Spinner>}
				</Button>
			</Form>
			{process.env.NODE_ENV === 'development' ? <Button onClick={e => setShowPopout(!showPopout)}>show pop up</Button> : null}
		</div> : null}
		<div className="game" ref={phaserParent} />
	</div>

	/** This returns the HTML for the popout*/
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


