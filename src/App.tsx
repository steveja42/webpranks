import React, { useState, useEffect, useRef } from 'react'
import { log } from './util'
import {PrankForm} from './prankform'
import './App.css'
export const version = .01

log(`version ${version} starting`)
//className="App-header"
function App(): JSX.Element {
  return (
    <div className="App">
      <header >

        <PrankForm url="" />
      </header>

    </div>
  );
}

export default App;

