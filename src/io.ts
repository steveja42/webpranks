
import { phaseState, Phase, PhaseTogglePause } from './phase'

export function getClickTouchHandler(dispatchPhase: (phase: unknown) => void) {

	return function handleClickTouch(_event: Event) {
		if (phaseState.current === Phase.startPrankAfterMouseOrKeyPress) {
			dispatchPhase(Phase.startingPrank)
			return
		} 
	}
}
export function getKeyBoardHandler(setShowControls: (v: boolean) => void, setShowPopout: (v: boolean) => void, dispatchPhase: (phase: unknown) => void) {
	/**
	 * returns keydown handler that:
	 *    opens popout debugging info window if Ctrl or Alt + "42" is pressed. 
	 *    toggles display of controls if Ctrl+Space is pressed
	 *    toggles pause/resume of scene if "Esc" is pressed
	 * @param event 
	 */
	let prevKey = ""
	let controlsVisible = true

	return function handleKeyDown(event: KeyboardEvent) {
		if (phaseState.current === Phase.startPrankAfterMouseOrKeyPress) {
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
			controlsVisible = !controlsVisible
			setShowControls(controlsVisible)
			return false
		}
		else if (key === "2" && (event.altKey || event.ctrlKey) && prevKey === "4")
			setShowPopout(true)
		else
			if (event.altKey || event.ctrlKey)
				prevKey = key

	}
}
