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
import { useParams, useHistory } from "react-router-dom";

network.post({ ping: "ping" }, 'init')   //ping the server that will fetch the page, in case it needs to be woken up or started
let game: Phaser.Game
const prankList = effectModules.map((effectModule, index) => <option key={index} value={index}>{effectModule.title}</option>)

/**
 * Calls server to get the page at URL,
 *  and then pranks the page by manipulating the display of the page
 * @param props 
 */

export function PrankForm(props: any) {

	const history = useHistory();
	const params = useParams();
	const [inputURL, setInputURL] = useState("")
	const [whichPrank, setWhichPrank] = useState(0)
	const [pageInfo, setPageInfo] = useState<PageInfo>(null)
	const [showControls, setShowControls] = useState(true)
	const [isLoading, setLoading] = useState(null)
	const [showPopout, setShowPopout] = useState(false)
	const [toggleScenePause, setTogglePauseScene] = useState(false)
	const [currentScene, setCurrentScene] = useState<Phaser.Scene>()
	const [showFailure, setShowFailure] = useState("")
	const phaserParent = useRef(null)
	const debugPageImage = useRef(null)
	const debugImage = useRef(null)
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const { x: xMouse, y: yMouse } = useMousePosition(window);
	const protocol = 'http://'
	const { x: worldX, y: worldY } = phaserParent?.current?.getBoundingClientRect() || {}

	useEffect(() => {    /** effect run on component load */
		log(`component load`)
		game = setupWorld(phaserParent.current, windowWidth, windowHeight)
		// setShowPopout(true)
		const handleKeyDown = keyBoardHandler(setTogglePauseScene, setShowControls, setShowPopout)
		const handleUnload = (e: BeforeUnloadEvent) => { console.log('window unloading'); setShowPopout(false) }

		window.addEventListener('beforeunload', handleUnload)
		document.addEventListener("keydown", handleKeyDown, false)
		let loadingPromise
		if (params.url) {
			const url = decodeURIComponent(params.url)
			setInputURL(url)
			loadingPromise = loadPage(url)
		}
		let i
		if (params.prank && !isNaN(i = parseInt(params.prank)) && i > -1 && i < effectModules.length) {
			setWhichPrank(i)
			if (params.url)
				runPrank(i, loadingPromise)
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown, false);
			window.removeEventListener('beforeunload', handleUnload);
		};
	}, []);

	useEffect(() => {
		if (currentScene) {
			if (currentScene.scene.isPaused()) {
				currentScene.scene.resume()
			}
			else {
				currentScene.scene.pause()
			}
		}
	}, [toggleScenePause])

	//load webpage when url changes
	function loadPage(url: string) {
		const loadingPromise = network.getImageandHtml(url, windowWidth, windowHeight)
			.then(result => {
				setShowFailure("")
				return domToObjects(result[0], result[1], debugPageImage.current, debugImage.current, windowWidth, windowHeight)
			},
				reason => {
					log(`oh! an error occurred ${reason}`)
					setShowFailure(`Unable to get web page at ${url}`)
					setLoading(false)
					throw new Error(reason)
				}
			)
			.then(newPageInfo => {
				newPageInfo.game = game
				return resetAndLoadImagesForNewPageScene(newPageInfo, currentScene)
			}).then(newPageInfo => {
				setPageInfo(newPageInfo)
				setLoading(null)
				setCurrentScene(null)
				return newPageInfo
			})
			.catch(error => {
				log(error.message)
				setPageInfo(null)
			})
		setLoading(loadingPromise)
		return loadingPromise
	}

	useEffect(() => {
		document.title = `Pranking: ${inputURL} `;
	}, [inputURL]);


	async function runPrank(iPrank = whichPrank, loadingPromise = isLoading) {
		try {
			let pi
			if (loadingPromise)
				pi = await loadingPromise
			else
				pi = pageInfo
			if (pi) {
				setShowControls(false)
				log(`running prank ${effectModules[iPrank].title}`)
				if (currentScene)
					currentScene.scene.remove()
				import(`./pageEffects/${effectModules[iPrank].fileName}`)
					.then(module => setCurrentScene(module.doPageEffect(pi)))
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
	const onBlur = () => {
		if (inputURL.trim() === protocol) {
			setInputURL('')
		} else if (inputURL.trim() !== "") {
			loadPage(inputURL)
			history.push(`/${whichPrank}/${encodeURIComponent(inputURL)}`)
		}
	}

	return <div id="foo">
		{showPopout ? getPopout() : null}
		{showControls ? <div id="togglediv">
			<Form onSubmit={onSubmit} className="myform" >
				<Alert show={showFailure !== ""} transition={null} variant="danger" onClose={() => setShowFailure("")} dismissible>
					<Alert.Heading>Error. {showFailure}</Alert.Heading>
				</Alert>
				<Form.Group controlId="url">
					<Form.Label>Choose a website</Form.Label>
					<Form.Control name="targetUrl" type="url" value={inputURL} autoFocus onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }} onFocus={onFocus} onBlur={onBlur} onChange={onChange} placeholder="Enter a URL" required />
				</Form.Group>
				<Form.Group controlId="prank">
					<Form.Label>Choose a prank</Form.Label>
					<Form.Control
						as="select"
						value={whichPrank}
						onChange={e => {
							const x = parseInt(e.target.value)
							setWhichPrank(x)
							history.push(`/${x}/${encodeURIComponent(inputURL)}`)

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

