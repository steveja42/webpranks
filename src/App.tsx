import React, { useState, useEffect } from 'react'
import { log } from './util'
import './App.css'
//import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import * as network from './network'
import { useWindowDimensions, useMousePosition } from './windowing'
import { logDomTree, PositionedElements } from './dom'

log(`starting`)

function App(): JSX.Element {
  return (
    <div className="App">
      <header className="App-header">

        <PrankUI url="" />
      </header>

    </div>
  );
}

function encode(url) {
  return url.replace(/\?.*/i, function (m) {
    return encodeURIComponent(m);
  });
}
let elems :PositionedElements

/**
 * Calls server to get the html for the page at URL, display it in an iframe, 
 *  and then pranks the page by manipulating the display of the html objects
 * @param props 
 */

function PrankUI(props: any) {
  const [targetUrl, setUrl] = useState(props.url)
  const [html, setHtml] = useState("")
  const [screenShot, setScreenshot] = useState("")
  const [isLoading, setLoading] = useState(false)
  const [childFrame, setChildFrame] = useState(null)
  const [xToMove, setXToMove] = useState(0)
  const [yToMove, setYToMove] = useState(0)
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { x: xMouse, y: yMouse } = useMousePosition(window);
  const { x: xMouse2, y: yMouse2 } = useMousePosition(childFrame?.contentWindow);


  const getPage = (event: React.FormEvent) => {
    const route = `puppet?url=${encodeURIComponent(targetUrl)}&width=${windowWidth}&height=${windowHeight}`;

    event.preventDefault()
    async function fetchData() {
      const [response, error] = await network.getString(route)  //const [response, error] = await getImage(route)
      setLoading(false)
      if (response) {
        log(`got response ${response}`)
        setHtml(response)         //setScreenshot(response)
      }
    }
    setLoading(true)
    setChildFrame(null)
    fetchData()
  }

  useEffect(() => {
    document.title = `URL: ${targetUrl} `;
  }, [targetUrl]);



  const onLoad = (e) => {
    log('frame loaded')
    setChildFrame(e.target)
    logDomTree(e.target.contentDocument.body)
    if (childFrame && elems)
      elems.restorePositionStyles();
    elems = new PositionedElements(e.target.contentDocument.body);
  }

  //const handleChange=(e: React.ChangeEvent<HTMLInputElement>) => setUrl(url) 
  const handleURLChange = (url: string) => setUrl(url)
  function move(x:number, y:number) {
    elems.move(x,y)

  }


  return <div>
    <p> Window size: {windowWidth}:{windowHeight} Mouse position1: {xMouse}:{yMouse} Mouse position2: {xMouse2}:{yMouse2} </p>
    <MyUrl url={targetUrl} isLoading={isLoading} onSubmit={getPage} handleChange={handleURLChange} />
    <input name="xToMove" type="number" value={xToMove} size={4} onChange={(e) =>setXToMove(parseInt(e.target.value))} placeholder="Enter a number for X"  />
    <input name="yToMove" type="number" value={yToMove} size={4} onChange={(e) =>setYToMove(parseInt(e.target.value))} placeholder="Enter a number for Y"  />
    <Button onClick={e=>move(xToMove,yToMove)}>Move</Button>
    {//<img src={screenShot} className="Screenshot" alt="screen capture of the webpage at url" />
    }
    <iframe src="about:blank" title="page to be pranked" onLoad={onLoad} srcDoc={html} width={windowWidth} height={windowHeight}></iframe>
    <p>{html}</p>

  </div>
}

/**
 * Displays form to get a URL from the user
 * @param props 
 */

function MyUrl(props: any): JSX.Element {
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
  return <div>
    <form onSubmit={props.onSubmit}>
      <label> targetUrl </label>
      <input name="targetUrl" type="url" value={url} onFocus={onFocus} onBlur={onBlur} onChange={(e) => props.handleChange(e.target.value)} size={30} className="form-control" placeholder="Enter a URL" required />

      <Button type="submit" value="Submit" disabled={isLoading} >
        {isLoading ? 'Loading…' : 'Click to load'}

        {isLoading && <Spinner animation="border" role="status " size="sm">
          <span className="sr-only">Loading...</span>
        </Spinner>}
      </Button>
    </form>

  </div>

}




export default App;

