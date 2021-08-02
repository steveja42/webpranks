import React, { useState, useEffect, useRef } from 'react'
import { log } from './util'
import './App.css'
//import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import { Form, Alert } from 'react-bootstrap'
import * as network from './network'
import { useWindowDimensions, useMousePosition } from './windowing'
import Popout from './popout'
import { domToObjects, scratchCanvas, PageGraphics } from './domtoobjects'
//import * as allfalldown from './pageEffects/birthday'
import { logDomTree } from './dom'
import {effectModules} from './pageEffects/modulelist'
import { PhaserGame } from './phaser'
import { setupWorld,resetWorld,resetAndLoadImagesForNewPageScene } from './phaseri'
import {PrankSceneI } from './modhelper'

export const version = .01
let prevKey = ""
let urlUsed = ""
let game:Phaser.Game
const prankList = effectModules.map((effectModule, index) => <option key={index} value={index}>{effectModule.title}</option>)

log(`version ${version} starting`)
//className="App-header"
function App(): JSX.Element {
  return (
    <div className="App">
      <header >

        <PrankUI url="" />
      </header>

    </div>
  );
}

/**
 * Calls server to get the page at URL,
 *  and then pranks the page by manipulating the display of the page
 * @param props 
 */

function PrankUI(props: any) {
  const [targetUrl, setUrl] = useState(props.url)
  const [whichPrank, setWhichPrank] = useState(0)
  const [html, setHtml] = useState("")
  const [screenShot, setScreenshot] = useState("")
  const [pageGraphics, setPageGraphics] = useState<PageGraphics>(null)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setLoading] = useState(false)
  const [showPopout, setShowPopout] = useState(false)
  const [shouldWorldUpdate, setShouldWorldUpdate] = useState(false)
  const [currentScene, setCurrentScene] = useState<PrankSceneI>()
  const [showFailure, setShowFailure] = useState("")
  const phaserParent = useRef(null)
  const debugPageImage = useRef(null)
  const debugImage = useRef(null)
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { x: xMouse, y: yMouse } = useMousePosition(window);

  /** effect run on component load */
  useEffect(() => {
    network.post({ ping: "ping" }, 'init')   //ping the server that will fetch the page, in case it needs to be woken up or started
    game = setupWorld(phaserParent.current, windowWidth, windowHeight)

    // setShowPopout(true)

    /**
     * keydown handler that:
     *    opens popout debugging info window if Ctrl or Alt + "42" is pressed. 
     *    toggles display of controls if "Esc" is pressed
     * @param event 
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key
      //log(`${key} ${event.altKey} ${event.ctrlKey} ${prevKey}`)
      if (key === "Alt" || key === "Control")
        return
      if (key === "Escape") {   //esc key
        setShouldWorldUpdate(true)
        setShowControls(prev => !prev)
      }
      else if (key === "2" && (event.altKey || event.ctrlKey) && prevKey === "4")
        setShowPopout(true)
      else
        if (event.altKey || event.ctrlKey)
          prevKey = key

    }

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
    if (shouldWorldUpdate && pageGraphics) {
      resetWorld(pageGraphics)
      domToObjects(screenShot, html, debugPageImage.current, debugImage.current, windowWidth, windowHeight)
        .then(result => setPageGraphics(result))
        .catch(error => { log(error); setPageGraphics(null) })
      setShouldWorldUpdate(false)
    }
  }, [shouldWorldUpdate])

  /**
   * getPage gets the screenshot and html of page at targetUrl
   * @param url 
   * @param windowWidth 
   * @param windowHeight 
   */
  async function getPageScreenshotAndHTML(url: string, windowWidth: number, windowHeight: number): Promise<[string, string]> {
    try {
      log(`start ${url} `)
      setLoading(true)
      const [imageURL, html] = await network.getImageandHtml(url, windowWidth, windowHeight)
      setLoading(false)
      setScreenshot(imageURL)
      setHtml(html)
      log(`done ${url} `)
      return [imageURL, html]
    }
    catch (error) {
      log(`yo! an error occurred ${error}`)
      setShowFailure(`Unable to get web page at ${url}`)
      setLoading(false)
      setScreenshot("")
      setHtml("")
      //return [null, null]
      throw (error)
    }
  }

  const onSubmit = async (event: React.FormEvent) => {
    try {
      event.preventDefault()
      //const [imageURL, html] = await getPage(targetUrl, windowWidth, windowHeight)
      if (screenShot && pageGraphics) {
        setShowControls(false)
        log(`running prank ${effectModules[whichPrank].title}`)
        import(`./pageEffects/${effectModules[whichPrank].fileName}`)
          .then(module => setCurrentScene(module.doPageEffect(pageGraphics)))
          .catch(err => log(err.message))
      }
    } catch { }
  }

  useEffect(() => {
    document.title = `Pranking: ${targetUrl} `;
  }, [targetUrl]);

  const protocol = 'http://'

  const onFocus = () => {
    if (targetUrl.trim() === '') {
      setUrl(protocol)
    }
  }
  const onBlur = () => {
    if (targetUrl.trim() === protocol) {
      setUrl('')
    } else if (targetUrl.trim() !== "" && urlUsed !== targetUrl) {
      urlUsed = targetUrl
      getPageScreenshotAndHTML(targetUrl, windowWidth, windowHeight)
        .then(result => domToObjects(result[0], result[1], debugPageImage.current, debugImage.current, windowWidth, windowHeight))
        .then(pageGraphics => {
          setShowFailure("")
          pageGraphics.game = game
          return resetAndLoadImagesForNewPageScene(pageGraphics, currentScene)
        }).then(pageGraphics=>setPageGraphics(pageGraphics))
        .catch(error => {
          log(error.message)
          //urlUsed = ""
          setPageGraphics(null)
        })
    }
  }

  //const handleChange=(e: React.ChangeEvent<HTMLInputElement>) => setUrl(url) 
  const { x: worldX, y: worldY } = phaserParent?.current?.getBoundingClientRect() || {}
  //worldX+= window.scrollX
  //worldY+= window.scrollY  

  return <div id="foo">
    <div>
      {getPopout()}
      {showControls ? <div id="togglediv">
        <Form onSubmit={onSubmit} className="myform" >
        <Alert show={showFailure!==""}  transition={null} variant="danger" onClose={() => setShowFailure("")} dismissible>
            <Alert.Heading>Error. {showFailure}</Alert.Heading>
          </Alert>
          <Form.Group controlId="url">
            <Form.Label>Choose a website</Form.Label>
            <Form.Control name="targetUrl" type="url" value={targetUrl} onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }} onFocus={onFocus} onBlur={onBlur} onChange={(e) => setUrl(e.target.value)} placeholder="Enter a URL" required />
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
          <Button type="submit" value="Submit" disabled={isLoading || !(screenShot && pageGraphics)} >
            {isLoading ? 'Loading…' : 'Prank It'}
            {isLoading && <Spinner animation="border" role="status " size="sm">
              <span className="sr-only">Loading...</span>
            </Spinner>}
          </Button>


        </Form>
        {process.env.NODE_ENV === 'development' ? <Button onClick={e => setShowPopout(!showPopout)}>show pop up</Button> : null}
      </div> : null}
      <div ref={phaserParent} />        
      <canvas id="canvas"  className="world" > </canvas>
    </div >
     
  </div>

  /** This returns the HTML for the popout, or null if the popout isn't visible */
  function getPopout() {
    if (!showPopout) {
      return null;
    }

    return (
      <Popout title='WebPranks Info' width={windowWidth} height={windowHeight} closeWindow={() => setShowPopout(false)}>
        <div>
          <p> Window size: {windowWidth}:{windowHeight} World Mouse position: {xMouse - worldX}:{yMouse - worldY} </p>
          <Button onClick={e => logDomTree(pageGraphics.doc.body)} disabled={!pageGraphics?.doc?.body}>log dom</Button>
        </div>
        <img id="debugImage" ref={debugImage} className="Screenshot" alt="debug" />
        <img id="pageImage" ref={debugPageImage} className="Screenshot" alt="screen capture of the webpage at url" />

      </Popout>
    );
  }
}
//src={screenShot}
export default App;

