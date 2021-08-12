import { PageInfo } from "./domtoobjects";
export type { PageInfo}  from "./domtoobjects"
export { log } from './util'

export interface PrankSceneI {
	name:string
}

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

export function displayDomObjects(scene:Phaser.Scene, page:PageInfo) {
	if (page.bgColor)
		scene.cameras.main.setBackgroundColor(page.bgColor)
	for (const backgroundRect of page.backgroundRects) {
		//const url = URL.createObjectURL(domElement.imageURL)
		scene.add.rectangle(center(backgroundRect.boundingRect.x, backgroundRect.boundingRect.right), center(backgroundRect.boundingRect.y, backgroundRect.boundingRect.bottom), backgroundRect.boundingRect.width, backgroundRect.boundingRect.height, backgroundRect.bgColor)
	}
	page.domElementsImages.forEach((domElement, i) => {
		scene.add.image(center(domElement.boundingRect.x, domElement.boundingRect.right), center(domElement.boundingRect.y, domElement.boundingRect.top), `dom${i}`)
	})
}