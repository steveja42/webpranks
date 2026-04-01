import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import './index.css'
import { startServerPing } from './network'

startServerPing()

// React Strict Mode disabled for Phaser singleton compatibility
ReactDOM.createRoot(document.getElementById('root')!).render(
	<Router>
		<App />
	</Router>
)
