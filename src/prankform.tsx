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

network.post({ ping: "ping" }, 'init')   //ping the server that will fetch the page, in case it needs to be woken up or started
let urlUsed = ""
let game: Phaser.Game
const prankList = effectModules.map((effectModule, index) => <option key={index} value={index}>{effectModule.title}</option>)

/**
 * Calls server to get the page at URL,
 *  and then pranks the page by manipulating the display of the page
 * @param props 
 */

export function PrankForm(props: any) {

	const [targetUrl, setUrl] = useState(props.url)
	const [whichPrank, setWhichPrank] = useState(0)
	const [pageInfo, setPageInfo] = useState<PageInfo>(null)
	const [showControls, setShowControls] = useState(true)
	const [isLoading, setLoading] = useState(false)
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
		game = setupWorld(phaserParent.current, windowWidth, windowHeight)
		// setShowPopout(true)
		const handleKeyDown = keyBoardHandler(setTogglePauseScene, setShowControls, setShowPopout)
		const handleUnload = (e: BeforeUnloadEvent) => {
			console.log('window unloading')
			setShowPopout(false)
		}
		window.addEventListener('beforeunload', handleUnload)
		document.addEventListener("keydown", handleKeyDown, false);

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

	useEffect(() => {
		document.title = `Pranking: ${targetUrl} `;
	}, [targetUrl]);
	
	const onSubmit = async (event: React.FormEvent) => {
		try {
			event.preventDefault()
			if (pageInfo) {
				setShowControls(false)
				log(`running prank ${effectModules[whichPrank].title}`)
				if (currentScene)
					currentScene.scene.remove()
				import(`./pageEffects/${effectModules[whichPrank].fileName}`)
					.then(module => setCurrentScene(module.doPageEffect(pageInfo)))
					.catch(err => log(err.message))
			}
		} catch (error) {
			log(error.message)
			setCurrentScene(null)
		}
	}

	const onFocus = () => {
		if (targetUrl.trim() === '') {
			setUrl(protocol)
		}
	}
	const onChange = (e:React.ChangeEvent<HTMLInputElement>) => {
		setUrl(e.target.value)
	}
	const onBlur = () => {
		if (targetUrl.trim() === protocol) {
			setUrl('')
		} else if (targetUrl.trim() !== "" && urlUsed !== targetUrl) {
			urlUsed = targetUrl
			setLoading(true)
			network.getImageandHtml(targetUrl, windowWidth, windowHeight)
				.then(result => {
					setLoading(false)
					setShowFailure("")
					return domToObjects(result[0], result[1], debugPageImage.current, debugImage.current, windowWidth, windowHeight)
				},
					reason => {
						log(`oh! an error occurred ${reason}`)
						setShowFailure(`Unable to get web page at ${targetUrl}`)
						setLoading(false)
						throw new Error(reason)
					}
				)
				.then(newPageInfo => {
					newPageInfo.game = game
					return resetAndLoadImagesForNewPageScene(newPageInfo, currentScene)
				}).then(newPageInfo => {
					setPageInfo(newPageInfo)
					setCurrentScene(null)
				})
				.catch(error => {
					log(error.message)
					setPageInfo(null)
				})
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
					<Form.Control name="targetUrl" type="url" value={targetUrl} autoFocus onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }} onFocus={onFocus} onBlur={onBlur} onChange={onChange} placeholder="Enter a URL" required />
				</Form.Group>
				<Form.Group controlId="prank">
					<Form.Label>Choose a prank</Form.Label>
					<Form.Control
						as="select"
						value={whichPrank}
						onChange={e => {
							console.log("e.target.value", e.target.value);
							setWhichPrank(parseInt(e.target.value))
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


