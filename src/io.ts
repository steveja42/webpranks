
import { xphase, Phase, PhaseTogglePause } from './prankrunner'

export function getClickTouchHandler(dispatchPhase) {

	return function handleClickTouch(event) {
		if (xphase === Phase.startPrankAfterMouseOrKeyPress) {
			dispatchPhase(Phase.startingPrank)
			return
		} 
	}
}
export function getKeyBoardHandler(setShowControls, setShowPopout, dispatchPhase) {
	/**
	 * returns keydown handler that:
	 *    opens popout debugging info window if Ctrl or Alt + "42" is pressed. 
	 *    toggles display of controls if Ctrl+Space is pressed
	 *    toggles pause/resume of scene if "Esc" is pressed
	 * @param event 
	 */
	let prevKey = ""

	return function handleKeyDown(event: KeyboardEvent) {
		if (xphase === Phase.startPrankAfterMouseOrKeyPress) {
			dispatchPhase(Phase.startingPrank)
			return
		} 
		const key = event.key
		//log(`${key} ${event.altKey} ${event.ctrlKey} ${prevKey}`)
		if (key === "Alt" || key === "Control")
			return
		if (key === "Escape") {   //esc key
			dispatchPhase(PhaseTogglePause) 
		}
		else if (key === "Backspace" || key === "Cancel" || (key === " " && event.ctrlKey)) {
			setShowControls(prev => { return !prev })
			return false
		}
		else if (key === "2" && (event.altKey || event.ctrlKey) && prevKey === "4")
			setShowPopout(true)
		else
			if (event.altKey || event.ctrlKey)
				prevKey = key

	}
}
