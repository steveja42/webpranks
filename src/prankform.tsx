import React, { useState, useEffect, useRef, useReducer } from 'react'
import { log} from './util'
//import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import { Form, Alert } from 'react-bootstrap'
import { effectModules } from './pageEffects/modulelist'
import { Phase } from './prankrunner'

const prankList = effectModules.map((effectModule, index) => <option key={index} value={index}>{effectModule.title}</option>)
type PrankUIParams = {
	prank: string
	url: string
	isRunning: string
};

let prankChosen = false

export function PrankForm(props: any) {
	const protocol = 'http://'

	const { isLoading, setTargetUrl, onSubmit, whichPrank, setWhichPrank, pageLoaded,inputURL,setInputURL, showPopout, setShowPopout,phase, dispatchPhase } = props

	const onFocus = () => {
		if (inputURL.trim() === '') {
			setInputURL(protocol)
		}
	}

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputURL(e.target.value)
	}

	function onURLWasInput() {
		if ((inputURL.trim() === protocol) || (inputURL.trim() === ""))
			return
	/*	if (inputURL !== prevUrl) {
			prevUrl = inputURL
			//document.getElementById("prank").focus()   //change focus to remove mobile onscreen keyboard before loading
		} 
		*/
		setTargetUrl(inputURL)

	}
	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter')
			e.preventDefault();
		if (e.key === "Backspace")
			e.stopPropagation()
	}
	const onBlur = () => {
		if (inputURL.trim() === protocol) {
			setInputURL('')
		} else {
			onURLWasInput()
		}
	}

	const onAnimationStart = (animEvent: React.AnimationEvent<HTMLInputElement>) => {
		log(`anim start ${animEvent.animationName}  - ${inputURL}`)
		if (animEvent.animationName === 'AutoFillStart')
			onURLWasInput()
	}

	return  <div id="togglediv">

		<Form onSubmit={onSubmit} className="myform" >

		
			<Form.Group controlId="url">
				<Form.Label className={(phase === Phase.targetUrlNotEntered)? "do_me": ""}>Choose a website to prank</Form.Label>
				<Form.Control name="targetUrl" type="url" value={inputURL} onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} onChange={onChange} onAnimationStart={onAnimationStart} placeholder="Enter a URL" required />
			</Form.Group>
			<Form.Group controlId="prank">
				<Form.Label className={(!prankChosen && phase === Phase.targetUrlEntered)? "do_me": ""}>Choose a prank</Form.Label>
				<Form.Control
					as="select"
					value={whichPrank}
					onChange={e => {
						const x = parseInt(e.target.value)
						setWhichPrank(x)
					}}
					onClick={e => {
						prankChosen = true
					}}
				>
					{prankList}
				</Form.Control>
			</Form.Group>
			<Button type="submit" value="Submit" disabled={isLoading || !pageLoaded} className={(prankChosen && pageLoaded && phase === Phase.targetUrlEntered)? "push_me": ""} >
				{isLoading ? 'Loading…' : 'Prank It'}
				{isLoading && <Spinner animation="border" role="status " size="sm">
					<span className="sr-only">Loading...</span>
				</Spinner>}
			</Button>
		</Form>
		{process.env.NODE_ENV === 'development' ? <Button onClick={e => setShowPopout(!showPopout)}>show pop up</Button> : null}

	</div> 
}





