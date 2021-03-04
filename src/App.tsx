import React, { useState, useEffect } from 'react'
import { log } from './util'
import './App.css'
//import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import { Form } from 'react-bootstrap'
import * as network from './network'
import { useWindowDimensions, useMousePosition } from './windowing'
import { logDomTree, PositionedElements } from './dom'
export const version = .01

log(`version ${version} starting`)

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
let elems: PositionedElements

const getBlobURL = (code, type) => {
  const blob = new Blob([code], { type })
  return URL.createObjectURL(blob)
}

/**
 * Calls server to get the html for the page at URL, display it in an iframe, 
 *  and then pranks the page by manipulating the display of the html objects
 * @param props 
 */

function PrankUI(props: any) {
  const [targetUrl, setUrl] = useState(props.url)
  const [html, setHtml] = useState("")
  const [screenShot, setScreenshot] = useState("")
  const [blobURL, setBlobURL] = useState("about:blank")
  const [isLoading, setLoading] = useState(false)
  const [childFrame, setChildFrame] = useState(null)
  //  const [elems, setElems] = useState(null)
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { x: xMouse, y: yMouse } = useMousePosition(window);
  const { x: xMouse2, y: yMouse2 } = useMousePosition(childFrame?.contentWindow);


  const getPage = (event: React.FormEvent) => {
    event.preventDefault()

    async function fetchData() {
      let route = `puppet?url=status`
     // log(await network.getString(route))
      route = `puppet?url=${encodeURIComponent(targetUrl)}&action=snapshot&width=${windowWidth}&height=${windowHeight}`;
      const imagePromise = network.getImage(route)
      route = `puppet?url=${encodeURIComponent(targetUrl)}&action=render&width=${windowWidth}&height=${windowHeight}`;
      const htmlPromise = network.getString(route)

      Promise.all([imagePromise, htmlPromise])
        .then(values => {
          const x = values

          setLoading(false)

          const [imageURL, html] = values
          setScreenshot(imageURL)
          const parser = new DOMParser();
          const doc: HTMLDocument = parser.parseFromString(html, "text/html")
          //setHtml(html)
        //  logDomTree(doc.body, true)

        })
        .catch(reason => {
          log(`yo! an error occurred ${reason}`);
          setLoading(false)


        })
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
    if (childFrame && elems)
      elems.restorePositionStyles();
    if (e?.target?.contentDocument?.body) {
      //logDomTree(e.target.contentDocument.body)
      setChildFrame(e.target)
      elems = new PositionedElements(e.target.contentDocument.body)
    }
  }

  //const handleChange=(e: React.ChangeEvent<HTMLInputElement>) => setUrl(url) 
  const handleURLChange = (url: string) => setUrl(url)

  return <div id="foo">
    <div>
      <p> Window size: {windowWidth}:{windowHeight} Mouse position1: {xMouse}:{yMouse} Mouse position2: {xMouse2}:{yMouse2} </p>
      <MyUrl url={targetUrl} isLoading={isLoading} onSubmit={getPage} handleChange={handleURLChange} />
      <MoveDom />
      <img src={screenShot} className="Screenshot" alt="screen capture of the webpage at url" />
    </div>
    <div>
      <iframe src="about:blank" srcDoc={html} title="page to be pranked" onLoad={onLoad} width={windowWidth} height={windowHeight}></iframe>
    </div>
  </div>
}
//sandbox="" srcDoc={html} {blobURL}

/**
 * Displays form to get a URL from the user
 * @param props 
 */

function MoveDom(props: any): JSX.Element {
  const [xToMove, setXToMove] = useState(0)
  const [yToMove, setYToMove] = useState(0)

  function move(x: number, y: number) {

    if (elems)
      elems.move(x, y)

  }
  return <div id="foo2">
    <input name="xToMove" type="number" value={xToMove} size={4} onChange={(e) => setXToMove(parseInt(e.target.value))} placeholder="Enter a number for X" />
    <input name="yToMove" type="number" value={yToMove} size={4} onChange={(e) => setYToMove(parseInt(e.target.value))} placeholder="Enter a number for Y" />
    <Button onClick={e => move(xToMove, yToMove)}>Move</Button>
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
  return <div className="foo">
    <Form onSubmit={props.onSubmit}>
      <Form.Group controlId="formURL">
        <Form.Label>URL</Form.Label>
        <Form.Control name="targetUrl" type="url" value={url} onFocus={onFocus} onBlur={onBlur} onChange={(e) => props.handleChange(e.target.value)} className="foo" placeholder="Enter a URL" required />
      </Form.Group>
      <Button type="submit" value="Submit" disabled={isLoading} >
        {isLoading ? 'Loading…' : 'Click to load'}

        {isLoading && <Spinner animation="border" role="status " size="sm">
          <span className="sr-only">Loading...</span>
        </Spinner>}
      </Button>
    </Form>

  </div>

}




export default App;

