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
import {doPageEffect} from './pageEffects/allfalldown'
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
     * opens popout info window if Ctrl or Alt + "42" is pressed. Toggle display of controls if "Esc" is pressed
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

    const handleUnload = (e:BeforeUnloadEvent) => {
    //  e.preventDefault();
     console.log('window unloading')
    // if (showPopout)
        setShowPopout(false)
     //alert("HEY");
    }
    window.addEventListener('beforeunload',handleUnload )
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const onSubmit = async (event: React.FormEvent) => {

    try {
      event.preventDefault()
      setLoading(true)
      const [imageURL, html] = await network.getImageandHtml(targetUrl, windowWidth, windowHeight)
      setLoading(false)
      setScreenshot(imageURL)
      setShowControls(false)
      const modInfo:modInfo = await addDomToWorld(imageURL, html, setDebugImage, canvasRef.current, windowWidth, windowHeight)
      //modInfo.
      doPageEffect(modInfo)
    }
    catch (error) {
      log(`yo! an error occurred ${error}`);
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = `Pranking: ${targetUrl} `;
  }, [targetUrl]);

  //const handleChange=(e: React.ChangeEvent<HTMLInputElement>) => setUrl(url) 
  const handleURLChange = (url: string) => setUrl(url)
  const { x: worldX, y: worldY } = canvasRef?.current?.getBoundingClientRect() || {}
  //worldX+= window.scrollX
  //worldY+= window.scrollY  

  return <div id="foo">
    <div>
      {getPopout()}
      {showControls ? <div id="togglediv">
        <URLForm url={targetUrl} isLoading={isLoading} onSubmit={onSubmit} handleChange={handleURLChange} />
        <Button onClick={e => setShowPopout(!showPopout)}>show pop up</Button>
      </div> : null}

      <canvas id="canvas" ref={canvasRef} className="world" > </canvas>
    </div>

  </div>

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

const santaImage = "data:image/png;base64,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"
