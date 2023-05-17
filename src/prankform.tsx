import React from 'react'
import { log } from './util'
//import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import { Form } from 'react-bootstrap'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { effectModules } from './pageEffects/modulelist'
import { Phase } from './prankrunner'
import popinImage from './images/jester-320.png'

const prankList = effectModules.map((effectModule, index) => <OverlayTrigger key={index} placement="auto" trigger={['hover', 'click', 'focus']} overlay={<Tooltip>Simple tooltip	</Tooltip>}>
	<option key={index} value={index}>{effectModule.title}</option>
</OverlayTrigger>)
//const prankListx = effectModules.map((effectModule, index) => <option key={index} value={index}>{effectModule.title}</option>)

let prankChosen = false

export function PrankForm(props: any) {
	const protocol = 'http://'

	const { isLoading, setTargetUrl, onSubmit, whichPrank, setWhichPrank, pageLoaded, inputURL, setInputURL, showPopout, setShowPopout, phase} = props

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
		let url = inputURL
		if (! /^https?:\/\//i.test(inputURL)) {
			url = "https://" + inputURL
		}
		if (! /\./.test(inputURL)) {
			url = url + ".com"
		}

		if (inputURL !== url) {
			setInputURL(url)
		}
		setTargetUrl(url)

	}
	//const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
	const onKeyDown = (e) => {
		if (e.key === 'Enter') {
			onURLWasInput()
			e.preventDefault();
		}
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

	return <div id="togglediv">

		<Form onSubmit={onSubmit} className="myform" >

			<Form.Group controlId="url">
				<Form.Label className={(phase === Phase.targetUrlNotEntered) ? "do_me" : ""}>Choose a website to prank</Form.Label>
				<Form.Control name="targetUrl" type="url" value={inputURL} onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} onChange={onChange} onAnimationStart={onAnimationStart} placeholder="Enter a Website" required />
			</Form.Group>
			<Form.Group controlId="prank">
				<Form.Label className={(!prankChosen && phase === Phase.targetUrlEntered) ? "do_me" : ""}>Choose a prank</Form.Label>
				<Form.Control
					as="select"
					value={whichPrank}
					onChange={e => {
						const x = parseInt(e.target.value)
						setWhichPrank(x)
					}}
					onClick={() => {
						prankChosen = true
					}}
				>
					{prankList}
				</Form.Control>
			</Form.Group>
			<Button type="submit" value="Submit" disabled={isLoading || !pageLoaded} className={(prankChosen && pageLoaded && phase === Phase.targetUrlEntered) ? "push_me" : ""} >
				{isLoading ? 'Loading…' : 'Prank It'}
				{isLoading && <Spinner animation="border" role="status " size="sm">
					<span className="visually-hidden">Loading...</span>
				</Spinner>}
			</Button>
		</Form>
		{process.env.NODE_ENV === 'development' ? <Button onClick={()=> setShowPopout(!showPopout)}>show debug window</Button> : null}
		{phase !== Phase.prankPaused ?<img id="popinimage" src={popinImage} alt="" /> :null}

	</div>
}





