export const version = .01


/**
  * logs to console, prepends version, date and name of calling function
  *
  */

export function log(x: string | unknown): void {
	let prepend = `v${version} `
	const omitDate = false
	if (!omitDate) {
		prepend += new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
	}

	if (x && typeof x === 'object')
		x = JSON.stringify(x);
	console.log(`${prepend} ${getFunctionName()}:${x}`);
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
		functionName = error.stack.split('\n')[3].replace(replaced, '');
	}
	return functionName
}