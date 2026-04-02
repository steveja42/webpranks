/**
 * logs to console, prepends date and name of calling function
 */

export const enum ll {
	trace = 1,
	debug = 2,
	info  = 3,
	warn  = 4,
	error = 5,
}

let LOG_THRESHOLD: ll = ll.debug

/** Change the minimum level that gets printed (e.g. call from browser console). */
export function setLogThreshold(level: ll): void {
	LOG_THRESHOLD = level
}

const LEVEL_PREFIX: Record<ll, string> = {
	[ll.trace]: '[TRACE] ',
	[ll.debug]: '[DEBUG] ',
	[ll.info]:  '[INFO]  ',
	[ll.warn]:  '[WARN]  ',
	[ll.error]: '[ERROR] ',
}

export function log(level: ll, x: string | unknown): void {
	if (level < LOG_THRESHOLD) return

	let prepend = ``
	const omitDate = false
	if (!omitDate) {
		prepend = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }).replace(",", "").replace("/20", "/").replace(/\s([AP])/, "$1")
	}
	if (x && typeof x === 'object')
		x = JSON.stringify(x);
	/*	if (x && typeof x === 'object') {
			x = Object.keys(x).reduce((accumulator, currentValue) => accumulator + `${currentValue}: ${JSON.stringify(x[currentValue])}`, "")
		} */
	console.log(`${LEVEL_PREFIX[level]}${prepend} ${getFunctionName()}: ${x}`);
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
		functionName = (error as Error).stack!.split('\n')[3].replace(replaced, '')
		functionName = functionName.replace(/\s\(.*\)/, '')
	}
	return functionName
}
