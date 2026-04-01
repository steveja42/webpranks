import React, { useRef, useEffect } from 'react'
import { log } from './util'
//import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import { Form } from 'react-bootstrap'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { effectModules } from './pageEffects/modulelist'
import { Phase } from './phase'
const popinImage = '/jester-320.png'

const prankList = effectModules.map((effectModule, index) => <OverlayTrigger key={index} placement="auto" trigger={['hover', 'click', 'focus']} overlay={<Tooltip>Simple tooltip	</Tooltip>}>
	<option key={index} value={index}>{effectModule.title}</option>
</OverlayTrigger>)
//const prankListx = effectModules.map((effectModule, index) => <option key={index} value={index}>{effectModule.title}</option>)

let prankChosen = false

export function PrankForm(props: any) {
	const protocol = 'http://'

	const { isLoading, setTargetUrl, onSubmit, whichPrank, setWhichPrank, pageLoaded, inputURL, setInputURL, showPopout, setShowPopout, phase, noContinuePrompt, setNoContinuePrompt } = props

	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		const el = inputRef.current
		if (!el) return
		const handler = () => processURL(el.value)
		el.addEventListener('change', handler)
		return () => el.removeEventListener('change', handler)
	}, [])

	const onFocus = () => {
		if (inputURL.trim() === '') {
			setInputURL(protocol)
		}
	}

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputURL(e.target.value)
	}

	function processURL(value: string) {
		if ((value.trim() === protocol) || (value.trim() === ""))
			return
		let url = value
		if (! /^https?:\/\//i.test(value)) {
			url = "https://" + value
		}
		if (! /\./.test(value)) {
			url = url + ".com"
		}
		if (value !== url) {
			setInputURL(url)
		}
		setTargetUrl(url)
	}

	function onURLWasInput() {
		processURL(inputURL)
	}
	//const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
			<div className="d-flex align-items-end gap-2">
				{import.meta.env.DEV ? <Button onClick={()=> setShowPopout(!showPopout)}>show debug window</Button> : null}
				<div className="d-flex align-items-end gap-2 flex-grow-1 justify-content-center">
					<Form.Group controlId="url">
						<Form.Label className={(phase === Phase.targetUrlNotEntered) ? "do_me" : ""}>Which website?</Form.Label>
						<Form.Control ref={inputRef} name="targetUrl" type="url" value={inputURL} onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} onChange={onChange} onAnimationStart={onAnimationStart} placeholder="Enter a Website" required />
					</Form.Group>
					<Form.Group controlId="prank">
						<Form.Label className={(!prankChosen && phase === Phase.targetUrlEntered) ? "do_me" : ""}>Pick a prank</Form.Label>
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
					<Form.Check
						type="checkbox"
						id="noContinuePrompt"
						label="no continue prompt"
						checked={noContinuePrompt}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoContinuePrompt(e.target.checked)}
					/>
				</div>
			</div>
		</Form>
		{phase !== Phase.prankPaused ?<img id="popinimage" src={popinImage} alt="" /> :null}

	</div>
}





