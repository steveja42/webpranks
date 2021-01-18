import { log } from './util';

const server = (window.location.hostname === "localhost") ? 'http://localhost:8080' : 'https://www.resultlab.live'

/**
	 * Performs http get request from our node.js server
	 *
	 * @param {string} route the url .
	 * @return [url of image blob ("" if error), error object]
	 */
export async function getImage(route: string): Promise<[string, string]> {
	const url = `${server}/${route}`
	try {
		const response = await fetch(url, {
			method: 'GET', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			headers: {
				'Content-Type': 'image/jpeg'
			}
		})
		if (!response.ok)
			throw (await response.text()) 
		const blob = await response.blob()
		return [URL.createObjectURL(blob), ""];
	}
	catch (error) {
		log(`error occurred ${error}`);
		return ["", error]
	}
}

/**
	 * Performs http get request from our node.js server
	 *
	 * @param {string} route the url .
	 * @return [response in JSON("" if error), error object]
	 */
export async function getJSON(route: string): Promise<[string, string]> {

	try {
		const rawResponse = await fetch(`${server}/${route}`);
		const json = await rawResponse.json()
		return [json, ""]
	}
	catch (error) {
		console.error(`get: error occurred ${error}`);
		return [
			"", error]
	}
}


/**
 * Performs http post request to our node.js server
 *
 * @param {string} data json to be posted .
 * @return [response in JSON(null if error), error object]
 */
export async function post(data: Record<string, unknown>) {

	try {
		const response = await fetch(`${server}/feedback`, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},

		});
		if (response.ok)
			return [true];
		const text = await response.text()
		return [false, `error: status ${response.status} ${response.statusText} ${text}`]
	}

	catch (error) {
		console.error(`post: error occurred with fetch ${error}`);
		return [false, error]
	}
}