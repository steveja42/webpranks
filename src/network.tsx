import { log } from './util';

//const server = (window.location.hostname === "localhost") ? 'http://localhost:8080' : (process.env.NODE_ENV === "production")? 'https://www.resultlab.live': 'https://www.resultify.live'
const server = 'https://tdnode.onrender.com' //https://sj-td.herokuapp.com'  //'http://localhost:8080' // 'https://sj-td.herokuapp.com' 


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

/**
	 * Performs http post request to our node.js server
	 *
	 * @param {string} data json to be posted .
	 * @param {string} route route to use.
	 * @return [response in JSON(null if error), error object]
	 */
 export async function post(data:Record<string,unknown>, route='feedback') {
	
	try {
		const response = await fetch(`${server}/${route}`, { 
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
