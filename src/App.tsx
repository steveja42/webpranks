import React, { useState, useEffect, useRef } from 'react'
import { log } from './util'
import './App.css'
//import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import { Form } from 'react-bootstrap'
import * as network from './network'
import { useWindowDimensions, useMousePosition } from './windowing'
import Popout from './popout'
import { addDomToWorld, scratchCanvas, modInfo } from './domtomatter'
import { santaImage } from './images'
import { doPageEffect } from './pageEffects/allfalldown'
export const version = .01
let prevKey = ""

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
  const [html, setHtml] = useState("")
  const [screenShot, setScreenshot] = useState("")
  const [debugImage, setDebugImage] = useState(santaImage)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setLoading] = useState(false)
  const [showPopout, setShowPopout] = useState(false)
  const canvasRef = useRef(null)
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { x: xMouse, y: yMouse } = useMousePosition(window);

  useEffect(() => {
    setShowPopout(true)

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
        setShowControls(prev => !prev)
      }
      else if (key === "2" && (event.altKey || event.ctrlKey) && prevKey === "4")
        setShowPopout(true)
      else
        if (event.altKey || event.ctrlKey)
          prevKey = key

    }

    const handleUnload = (e: BeforeUnloadEvent) => {
      //  e.preventDefault();
      console.log('window unloading')
      // if (showPopout)
      setShowPopout(false)
      //alert("HEY");
    }
    window.addEventListener('beforeunload', handleUnload)
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  async function getPage(targetUrl: string, windowWidth: number, windowHeight: number): Promise<[string, string]> {
    try {
      setLoading(true)
      const [imageURL, html] = await network.getImageandHtml(targetUrl, windowWidth, windowHeight)
      setLoading(false)
      setScreenshot(imageURL)
      return [imageURL, html]
    }
    catch (error) {
      log(`yo! an error occurred ${error}`);
      setLoading(false)
      setScreenshot(null)
      //return [null, null]
      throw (error)
    }
  }

  const onSubmit = async (event: React.FormEvent) => {

    try {
      event.preventDefault()
      const [imageURL, html] = await getPage(targetUrl, windowWidth, windowHeight)
      setShowControls(false)
      const modInfo: modInfo = await addDomToWorld(imageURL, html, setDebugImage, canvasRef.current, windowWidth, windowHeight)
      doPageEffect(modInfo)
    } catch {}
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
    }
  }

  //const handleChange=(e: React.ChangeEvent<HTMLInputElement>) => setUrl(url) 
  const { x: worldX, y: worldY } = canvasRef?.current?.getBoundingClientRect() || {}
  //worldX+= window.scrollX
  //worldY+= window.scrollY  

  return <div id="foo">
    <div>
      {getPopout()}
      {showControls ? <div id="togglediv">
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="formURL">

            <Form.Control name="targetUrl" type="url" value={targetUrl} onFocus={onFocus} onBlur={onBlur} onChange={(e) => setUrl(e.target.value)} className="foo" placeholder="Enter a URL" required />
            <Button type="submit" value="Submit" disabled={isLoading} >
              {isLoading ? 'Loading…' : 'Click to load'}

              {isLoading && <Spinner animation="border" role="status " size="sm">
                <span className="sr-only">Loading...</span>
              </Spinner>}
            </Button>
          </Form.Group>

        </Form>
        <Button onClick={e => setShowPopout(!showPopout)}>show pop up</Button>
      </div> : null}

      <canvas id="canvas" ref={canvasRef} className="world" > </canvas>
    </div>

  </div>
  // <URLForm url={targetUrl} isLoading={isLoading} onSubmit={onSubmit} handleChange={handleURLChange} />
  // <button onClick={() => setShowControls(!showControls)}>fuck</button>
  //<Button onClick={e => makeWorld(canvasRef.current as HTMLCanvasElement, windowWidth, 600)}>physics</Button>

  // This returns the HTML for the popout, or null if the popout isn't visible
  function getPopout() {
    if (!showPopout) {
      return null;
    }

    return (
      <Popout title='WebPranks Info' width={windowWidth} height={windowHeight} closeWindow={() => setShowPopout(false)}>
        <div>YOUR POPOUT CONTENT HERE</div>
        <p> Window size: {windowWidth}:{windowHeight} World Mouse position: {xMouse - worldX}:{yMouse - worldY} </p>
        <img id="debugImage" src={debugImage} className="Screenshot" alt="debug" />
        <img id="pageImage" src={screenShot} className="Screenshot" alt="screen capture of the webpage at url" />

      </Popout>
    );
  }
}
//sandbox="" srcDoc={html} {blobURL}


/**
 * Displays form to get a URL from the user
 * @param props 
 */

function URLForm(props: any): JSX.Element {
  const protocol = 'http://'
  let url = props.url
  const isLoading = props.isLoading

  const onFocus = () => {
    if (url.trim() === '') {
      url = protocol
      props.handleChange(protocol)
    }
  }
  const onBlur = () => {
    if (url.trim() === protocol) {
      props.handleChange('')
    }
  }
  return <div >
    <Form onSubmit={props.onSubmit}>
      <Form.Group controlId="formURL">

        <Form.Control name="targetUrl" type="url" value={url} onFocus={onFocus} onBlur={onBlur} onChange={(e) => props.handleChange(e.target.value)} className="foo" placeholder="Enter a URL" required />
        <Button type="submit" value="Submit" disabled={isLoading} >
          {isLoading ? 'Loading…' : 'Click to load'}

          {isLoading && <Spinner animation="border" role="status " size="sm">
            <span className="sr-only">Loading...</span>
          </Spinner>}
        </Button>
      </Form.Group>

    </Form>

  </div>


}

export default App;

