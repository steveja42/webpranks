import { log } from './util'
import { Engine, Render, Bodies, World, Body,Runner } from "matter-js"
import { setupWorld } from './physics'
import { walkDom, logDomTree, nodeTypes } from './dom'
import {CollisionCategory} from './physics'

/**
 * sets image.src to imageURL and returns promise that resolves when image has been loaded with imageURL 
 * @param image 
 * @param imageURL 
 */
function loadImage(image: HTMLImageElement, imageURL: string): Promise<unknown> {
	let resolveImageLoaded
	image.onload = function () {
		resolveImageLoaded(image.src)
	}
	const imageLoaded = new Promise((resolve) => resolveImageLoaded = resolve)
	image.src = imageURL;
	return imageLoaded
}

/** image snapshot of the whole page */
/** image snapshot of the whole page */
/** list of bodies that can be manipulated */


/** info passed to modules that create page effects 
 * canvas
 * pageImage image snapshot of the whole page
 * bodies: Body[],	
 * backgroundBodies: Body[],
 * setDebugImage: any,
 * doc:HTMLDocument,
 * world: World
 */
export interface ModInfo {
	pageImage: HTMLImageElement,
	bodies: Body[],
	backgroundBodies: Body[],
	setDebugImage: any,
	doc: HTMLDocument,
	world: World,
	render: Render,
	engine: Engine
}


export async function resetWorld(modInfo:ModInfo) {
	Render.stop(modInfo.render)
	//Runner.stop(modInfo.engine)
}
export async function createWorldFromDOM(imageURL: string, html: string, setDebugImage, canvas: HTMLCanvasElement, width: number, height: number): Promise<ModInfo> {
	//scratchCanvas = canvas
	log(`start ${imageURL}`)
	const pageImage = new Image()
	const imageLoaded = loadImage(pageImage, imageURL)
	const parser = new DOMParser();
	const doc: HTMLDocument = parser.parseFromString(html, "text/html")
	const bgColor = JSON.parse(doc.body?.getAttribute('__pos__'))?.bgColor
	await imageLoaded
	//logDomTree(doc.body, true)
	const {world, render, engine} = setupWorld(canvas, width, height, bgColor)

	const modInfo: ModInfo = {
		pageImage,
		bodies: [],
		backgroundBodies: [],
		setDebugImage,
		doc,
		world,
		render,
		engine
	}
	walkDom(doc.body, domNodeToSprites, 0, modInfo)

	if (modInfo.backgroundBodies.length)
		World.add(world, modInfo.backgroundBodies)
	if (modInfo.bodies.length)
		World.add(world, modInfo.bodies)
	log(`done ${imageURL}`)

	return { ...modInfo, doc, world }
}

/**
 *  Creates sprite(s) from a DOM node
 * @param node 
 * @param level - how many levels deep are we in the dom tree
 */
function domNodeToSprites(node: HTMLElement, level: number, stuff: ModInfo) {

	const spriteAbleElements = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P']

	//The Element.clientHeight read-only property is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels. It includes padding but excludes borders, margins, and horizontal scrollbars (if present).
	//clientHeight can be calculated as: CSS height + CSS padding - height of horizontal scrollbar (if present).
	// boundingclientrect smallest rectangle which contains the entire element, including its padding and border-width
	if (node.nodeType !== nodeTypes.element)
		return

	const posAttr = node.getAttribute('__pos__')
	if (!posAttr)
		return
	const pos = JSON.parse(posAttr)
	const { clientRects, boundingRect, paddingRect, bgColor } = pos

	if (!boundingRect || !boundingRect.width || !boundingRect.height)
		return

	if (bgColor) {    //create a body to fill in the background, but not collide with anything
		/*const ctx = stuff.canvas.getContext('2d')
		ctx.fillStyle = bgColor
		ctx.fillRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height) */
		const options = {
			render: { fillStyle: bgColor },
			collisionFilter: {
				group: -2,
				category: 0
			}
		}
		const body = Bodies.rectangle(boundingRect.x + boundingRect.width / 2, boundingRect.y + boundingRect.height / 2, boundingRect.width, boundingRect.height, options)
		stuff.backgroundBodies.push(body)
	}

	if (spriteAbleElements.includes(node.nodeName)) {

		const foo = stuff.pageImage
		const image = getImagePortion(stuff.pageImage, boundingRect)
		stuff.setDebugImage(image)
		const options = { 
			render: { sprite: { texture: image, xScale: 1, yScale: 1 } },
		collisionFilter: {
			mask: CollisionCategory.default | CollisionCategory.ground
		} }
		const body = Bodies.rectangle(boundingRect.x + boundingRect.width / 2, boundingRect.y + boundingRect.height / 2, boundingRect.width, boundingRect.height, options)
		stuff.bodies.push(body)
	}
}

export const scratchCanvas = document.createElement('canvas')
function getImagePortion(image, rect) {
	scratchCanvas.width = rect.width;
	scratchCanvas.height = rect.height;
	scratchCanvas.getContext('2d').drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height,)
	return scratchCanvas.toDataURL()
}

