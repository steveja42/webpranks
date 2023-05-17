import { PageInfo } from "./domtoobjects";
import { log } from './util'
export type { PageInfo } from "./domtoobjects"
export { log } from './util'

export interface PrankSceneI {
	name: string
}

export type GameObjectwithMatterBody = Phaser.GameObjects.Image & Phaser.GameObjects.Rectangle & {
	body: MatterJS.BodyType
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
				const img = scene.physics.add.image(center(domElement.boundingRect.x, domElement.boundingRect.right), center(domElement.boundingRect.y, domElement.boundingRect.bottom), `dom${i}`, '__BASE')
				domArcadeImages.push(img)
			})
			domBackgroundRects.forEach((rect) => {
				domArcadeBackgroundRects.push(scene.physics.add.existing(rect) as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody)
			})
		}
		if (useMatter) {
			pageInfo.domElementsImages.forEach((domElement, i) => {
				const img = scene.matter.add.image(center(domElement.boundingRect.x, domElement.boundingRect.right), center(domElement.boundingRect.y, domElement.boundingRect.bottom), `dom${i}`, '__BASE', {
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
			domImages.push(scene.add.image(center(domElement.boundingRect.x, domElement.boundingRect.right), center(domElement.boundingRect.y, domElement.boundingRect.bottom), `dom${i}`, '__BASE'))
		})
	}

	return { domBackgroundRects, domArcadeBackgroundRects, domImages, domArcadeImages, domMatterImages }
}

type Rect = {
	x: number,
	y: number,
	width: number,
	height: number
}
/**
 * returns coordinates for the pieces that an object should be broken up into
 * @param width 
 * @param height 
 */
export function getSplits(width, height): Rect[] {
	const halfWidth = width / 2
	const halfHeight = height / 2
	let splits: Rect[] = [
		{ x: 0, y: 0, width: halfWidth, height: halfHeight },
		{ x: halfWidth, y: 0, width: halfWidth, height: halfHeight },
		{ x: 0, y: halfHeight, width: halfWidth, height: halfHeight },
		{ x: halfWidth, y: halfHeight, width: halfWidth, height: halfHeight },
	]
	if (width / height > 4 / 3) {
		splits = [
			{ x: 0, y: 0, width: halfWidth, height: height },
			{ x: halfWidth, y: 0, width: halfWidth, height: height }]
	}
	else if (height / width > 4 / 3) {
		splits = [
			{ x: 0, y: 0, width: width, height: halfHeight },
			{ x: 0, y: halfHeight, width: width, height: halfHeight }]
	}
	return splits
}

/**
 * Breaks up a gameObject into pieces and returns those pieces in an array of gameObjects. You should generally then destroy the original gameObject.
 * Currently works for Rectangles and Images.
 * @param xImpact 
 * @param yImpact 
 * @param gameObject 
 */
export function breakUp(xImpact, yImpact, gameObject: GameObjectwithMatterBody): Phaser.GameObjects.GameObject[] {

	const MinArea = 50
	if (gameObject.type !== 'Image' && gameObject.type !== 'Rectangle')
		return null
	const width = gameObject.displayWidth
	const height = gameObject.displayHeight
	if (width * height < MinArea)
		return null
	log(`breaking up ${gameObject.body.id} ${width} - ${height}`)
	const scene = gameObject.scene
	const x = gameObject.x
	const y = gameObject.y
	const newObjects: Phaser.GameObjects.GameObject[] = []
	const splits = getSplits(width, height)
	if (gameObject.type === 'Image') {
		const texture = gameObject.texture
		const baseName = texture.frameTotal
		const frameX = gameObject.frame?.cutX || 0
		const frameY = gameObject.frame?.cutY || 0
		splits.forEach((split, i) => {
			const frame = texture.add(baseName + i, 0, frameX + split.x, frameY + split.y, split.width, split.height)
		
				newObjects.push(scene.add.image(x + split.x, y + split.y, texture, frame.name))
		})
	} 
	else  {
		const fillColor = gameObject.fillColor
		splits.forEach((split, i) => {
		
				newObjects.push(scene.add.rectangle(x + split.x, y + split.y, split.width, split.height,fillColor))
			
		})
	} 
	
	return newObjects

}