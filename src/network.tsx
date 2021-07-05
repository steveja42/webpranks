import { log } from './util';

//const server = (window.location.hostname === "localhost") ? 'http://localhost:8080' : (process.env.NODE_ENV === "production")? 'https://www.resultlab.live': 'https://www.resultify.live'
const server = 'http://localhost:8080' // 'https://sj-td.herokuapp.com'  //'https://resultify.live'


export async function getImageandHtml(targetUrl:string, windowWidth:number, windowHeight: number) : Promise<[string, string]>{
	let route = `puppet?url=${encodeURIComponent(targetUrl)}&action=snapshot&width=${windowWidth}&height=${windowHeight}`;
	const imagePromise = getImage(route)
	route = `puppet?url=${encodeURIComponent(targetUrl)}&action=render&width=${windowWidth}&height=${windowHeight}`;
	const htmlPromise = getString(route)
	return Promise.all([imagePromise, htmlPromise])
 }


/**
	 * Performs http get request from our node.js server
	 *
	 * @param {string} route the url .
	 * @return [url of image blob ("" if error), error object]
	 */
export async function getImage(route: string): Promise<string> {
	const url = `${server}/${route}`
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
	return URL.createObjectURL(blob)
}

/**
	 * Performs http get request from our node.js server
	 *
	 * @param {string} route the url .
	 * @return [response in JSON, ""]  or if error- ["", error object]
	 */
export async function getString(route: string): Promise<string> {

		const response = await fetch(`${server}/${route}`);
		return await response.text()
}

/**
	 * Performs http get request from our node.js server
	 *
	 * @param {string} route the url .
	 * @return [response in JSON, ""]  or if error- ["", error object]
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
