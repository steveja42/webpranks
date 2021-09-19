/**
  * logs to console, prepends version, date and name of calling function
  *
  */

export function log(x: string | unknown): void {
	let prepend = ``
	const omitDate = false
	if (!omitDate) {
		prepend = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }).replace(",", "").replace("/20", "/").replace(/\s([AP])/, "$1")
	}

/*	if (x && typeof x === 'object') {
		x = Object.keys(x).reduce((accumulator, currentValue) => accumulator + `${currentValue}: ${JSON.stringify(x[currentValue])}`, "")
	} */
	console.log(`${prepend} ${getFunctionName()}: ${x}`);
}

/**
 * Returns the name of the calling function
 * doesn't work for async functions
 */
function getFunctionName() {

	let functionName = ''
	try {

		throw new Error('Throw error to get stack trace');

	} catch (error) {
		const replaced = /^\s*at\s*/
		// The calling function we're interested in is up a few levels
		functionName = error.stack.split('\n')[3].replace(replaced, '')
		functionName = functionName.replace(/\s\(.*\)/, '')
	}
	return functionName
}

export function keyBoardHandler(setTogglePauseScene, setShowControls, setShowPopout) {
	/**
	 * returns keydown handler that:
	 *    opens popout debugging info window if Ctrl or Alt + "42" is pressed. 
	 *    toggles display of controls if Ctrl+Space is pressed
	 *    toggles pause/resume of scene if "Esc" is pressed
	 * @param event 
	 */
	let prevKey = ""

	return function handleKeyDown (event: KeyboardEvent){
		const key = event.key
		//log(`${key} ${event.altKey} ${event.ctrlKey} ${prevKey}`)
		if (key === "Alt" || key === "Control")
			return
		if (key === "Escape") {   //esc key
			setTogglePauseScene(prev => !prev)
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