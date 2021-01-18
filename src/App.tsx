import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { log } from './util';
import Form from 'react-bootstrap/Form'
import { getImage } from './network'

function App(): JSX.Element {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.

      </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React

        </a>
        <Puppet url="" />
      </header>

    </div>
  );
}

function Puppet(props: any) {
  const [targetUrl, setUrl] = useState(props.url)
  const [html, setHtml] = useState("")
  const [screenShot, setScreenshot] = useState("")
 
  const route = `puppet?url=${encodeURIComponent(targetUrl)}`;

  useEffect(() => {
    async function fetchData() {
      // You can await here
      const [response, error] = await getImage(route)
      if (response)
       {
        log(`got response ${response}`)
        setScreenshot(response)
      }
    }
    fetchData();
  }, [route])

  useEffect(() => {
    document.title = `URL: ${targetUrl} `;
  });

  return <div>
    <p>{targetUrl}</p>
    <MyUrl url={targetUrl} handleChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} />
    <img src={screenShot} className="Screenshot" alt="showing screen capture" />
    <p>{html}</p>

  </div>
}

function MyUrl(props: any): JSX.Element {

  //let url = props.url

  return <div>
  
    <label> targetUrl </label>
    <input name="targetUrl" type="url" value={props.url} onChange={(e) => props.handleChange(e)} size={30} className="form-control" placeholder="Enter targetUrl" required />
    <input type="submit" value="Do It"></input>
  
  </div>

}


export default App;

