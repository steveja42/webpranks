import { PageInfo } from "./domtoobjects";
export type { PageInfo } from "./domtoobjects"
export { log } from './util'

export interface PrankSceneI {
	name: string
}

type GameObjectwithArcadeBody = Phaser.GameObjects.Image & Phaser.GameObjects.Rectangle & {
	body: Phaser.Physics.Arcade.Body
};

export enum CollisonGroup {
	Dom = -2
}
export enum CollisionCategory {
	none = 0,
	default = 1,
	ground = 2,
	domBackground = 4,
	dom = 8,
	movingDom = 16
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

type DomObjects = {
	domBackgroundRects: Phaser.GameObjects.Rectangle[]
	domArcadeBackgroundRects: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[]
	domImages: Phaser.GameObjects.Image[]
	domArcadeImages: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[]
	domMatterImages: Phaser.Physics.Matter.Image[]
}

/**
		Sets background color of scene to match that of the web page,
		Adds rectangles to the scene to match the web page elements that had different background colors than the whole page, 
		Adds an image for each visible web page element to the scene as an image game object,optionally using Arcade and/or Matter images instead.

 * 
 * @param scene 
 * 
 * @param pageInfo 
 */
export function setBackgroundAndCreateDomObjects(scene: Phaser.Scene, pageInfo: PageInfo, useArcade = true, useMatter = false): DomObjects {
	const domBackgroundRects: Phaser.GameObjects.Rectangle[] = []
	const domArcadeBackgroundRects: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody[] = []
	const domImages: Phaser.GameObjects.Image[] = []
	const domArcadeImages: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = []
	const domMatterImages: Phaser.Physics.Matter.Image[] = []

	if (pageInfo.bgColor)
		scene.cameras.main.setBackgroundColor(pageInfo.bgColor)

	for (const backgroundRect of pageInfo.backgroundRects) {
		domBackgroundRects.push(scene.add.rectangle(center(backgroundRect.boundingRect.x, backgroundRect.boundingRect.right), center(backgroundRect.boundingRect.y, backgroundRect.boundingRect.bottom), backgroundRect.boundingRect.width, backgroundRect.boundingRect.height, backgroundRect.bgColor))
	}

	if (useArcade || useMatter) {
		if (useArcade) {
			pageInfo.domElementsImages.forEach((domElement, i) => {
				const img = scene.physics.add.image(center(domElement.boundingRect.x, domElement.boundingRect.right), center(domElement.boundingRect.y, domElement.boundingRect.bottom), `dom${i}`)
				domArcadeImages.push(img)
			})
			domBackgroundRects.forEach((rect) => {
				domArcadeBackgroundRects.push(scene.physics.add.existing(rect) as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody)
			})
		}
		if (useMatter) {
			pageInfo.domElementsImages.forEach((domElement, i) => {
				const img = scene.matter.add.image(center(domElement.boundingRect.x, domElement.boundingRect.right), center(domElement.boundingRect.y, domElement.boundingRect.bottom), `dom${i}`, null, {
					ignoreGravity: true, collisionFilter: {
						group: CollisonGroup.Dom,
						mask: CollisionCategory.ground | CollisionCategory.movingDom | CollisionCategory.default,
						category: CollisionCategory.dom
					}
				})
				domMatterImages.push(img)
			})

		}
	}
	else {
		pageInfo.domElementsImages.forEach((domElement, i) => {
			domImages.push(scene.add.image(center(domElement.boundingRect.x, domElement.boundingRect.right), center(domElement.boundingRect.y, domElement.boundingRect.bottom), `dom${i}`))
		})
	}

	return { domBackgroundRects, domArcadeBackgroundRects, domImages, domArcadeImages, domMatterImages }
}