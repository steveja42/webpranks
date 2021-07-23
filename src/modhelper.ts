/** returns center of start and end */
export function center(start, end) {

	return start + (end - start) / 2
}

/**
 * returns promise that resolves in time given by milliSeconds
 * @param milliSeconds 
 * bla bla
 * more
 */
export async function ms(milliSeconds: number) {

	return new Promise<void>(resolve => {
		setTimeout(() => {
			resolve();
		}, milliSeconds);
	});
}

export function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

