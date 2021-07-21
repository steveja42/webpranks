import { log } from './util'
import { Engine, Render, Bodies, World, Body, Runner } from "matter-js"
import { setupWorld } from './physics'
import { walkDom2, logDomTree, nodeTypes } from './dom'
import { CollisionCategory } from './physics'

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
	debugImage: HTMLImageElement,
	doc: HTMLDocument,
	world: World,
	render: Render,
	engine: Engine
}

export async function resetWorld(modInfo: ModInfo) {
	Render.stop(modInfo.render)
	//Runner.stop(modInfo.engine)
}
export async function createWorldFromDOM(imageURL: string, html: string, debugPageImage: HTMLImageElement, debugImage: HTMLImageElement, canvas: HTMLCanvasElement, width: number, height: number): Promise<ModInfo> {
	//scratchCanvas = canvas
	log(`start ${imageURL}`)
	const pageImage = debugPageImage || new Image()
	const imageLoaded = loadImage(pageImage, imageURL)
	const parser = new DOMParser();
	const doc: HTMLDocument = parser.parseFromString(html, "text/html")
	const bgColor = JSON.parse(doc.body?.getAttribute('__pos__'))?.bgColor
	await imageLoaded
	//logDomTree(doc.body, true)
	const { world, render, engine } = setupWorld(canvas, width, height, bgColor)

	const modInfo: ModInfo = {
		pageImage,
		bodies: [],
		backgroundBodies: [],
		debugImage,
		doc,
		world,
		render,
		engine
	}
	await walkDom2(doc.body, domNodeToSprites, 0, modInfo)

	if (modInfo.backgroundBodies.length)
		World.add(world, modInfo.backgroundBodies)
	if (modInfo.bodies.length)
		World.add(world, modInfo.bodies)
	log(`done ${imageURL}`)

	return { ...modInfo, doc, world }
}

function getAttributes(node) {
	const posAttr = node.getAttribute('__pos__')
	if (!posAttr)
		return null
	const pos = JSON.parse(posAttr)
	//const { clientRects, boundingRect, paddingRect, bgColor } = pos
	return pos
}




/**
 *  Creates sprite(s) from a DOM node
 * @param node 
 * @param level - how many levels deep are we in the dom tree
 * @param modInfo -info used by prank modules
 * @param parentAdded - true if a dom ancestor added a sprite, otherwise false
 */
async function domNodeToSprites(node: HTMLElement, level: number, modInfo: ModInfo, parentAdded) {

	const debugThis = true
	const spriteAbleElements = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'IMG', 'LI', 'TD', 'TH', 'BUTTON', 'INPUT', 'LABEL', 'LEGEND', 'SELECT', 'TEXTAREA', 'A'] //, 'IFRAME'
	const isTextNode = node.nodeType === nodeTypes.text
	//The Element.clientHeight read-only property is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels. It includes padding but excludes borders, margins, and horizontal scrollbars (if present).
	//clientHeight can be calculated as: CSS height + CSS padding - height of horizontal scrollbar (if present).
	// boundingclientrect smallest rectangle which contains the entire element, including its padding and border-width
	if (node.nodeName === "NOSCRIPT")
		return true
	if (node.nodeType !== nodeTypes.element) // && (! (isTextNode && !parentAdded && node.nodeValue?.trim())))
		return parentAdded
	let attrNode = node
	if (isTextNode) {
		attrNode = findParentNodeWithAttributes(node.parentNode)
		if (!attrNode)
			return parentAdded
	}

	const { boundingRect, bgColor } = getAttributes(attrNode) || {boundingRect:null, bgColor:null}
	
	function findParentNodeWithAttributes(node): HTMLElement {
		if (node && node.tagName === "DIV") {
			const { boundingRect } = getAttributes(node) || {boundingRect:null}
		if (isOnScreen(boundingRect))
		if (boundingRect?.width && boundingRect?.height)
				return node
		}
		/*
		
			while (node && node.tagName === "DIV") { //!== "BODY") {
				const { boundingRect } = getAttributes(node)
				if (!boundingRect || !boundingRect.width || !boundingRect.height)
					node = node.parentNode
				else
					return node
			} */
		return null
	}
	function isOnScreen(boundingRect){
		return (boundingRect && boundingRect.width && boundingRect.height && boundingRect.x <= modInfo.render.bounds.max.x && boundingRect.y <= modInfo.render.bounds.max.y &&boundingRect.x >= 0 && boundingRect.y >= 0)
	}

	if (!isOnScreen(boundingRect))
		return parentAdded

	if (!isTextNode && bgColor) {    //create a body to fill in the background, but not collide with anything
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
		modInfo.backgroundBodies.push(body)
	}
	if (parentAdded) {
		//log(`ignoring ${node.id ? "#" +node.id : " "} ${node.parentNode.nodeName}->${node.nodeName} at ${boundingRect.x},${boundingRect.y}`)
		return true
	}
	if (isTextNode || spriteAbleElements.includes(node.nodeName)) {
		const image = getImagePortion(modInfo.pageImage, boundingRect)
		if (debugThis) {
			log(`adding ${isTextNode ? "textnode <- " : ""}  ${node.id ? "#" + node.id : " "} ${node.parentNode.nodeName}->${node.nodeName} at ${boundingRect.x}, ${boundingRect.y}  ${boundingRect.width} x ${boundingRect.height}`)
			if (modInfo.debugImage) {
				const imageLoaded = loadImage(modInfo.debugImage, image)
				await imageLoaded
			}
		}
		const options = {
			render: { sprite: { texture: image, xScale: 1, yScale: 1 } },
			collisionFilter: {
				mask: CollisionCategory.default | CollisionCategory.ground,
				group: 1
			}
		}
		if (debugThis) 
			options.collisionFilter.group = -2
		const body = Bodies.rectangle(boundingRect.x + boundingRect.width / 2, boundingRect.y + boundingRect.height / 2, boundingRect.width, boundingRect.height, options)
		modInfo.bodies.push(body)
		return true
	}
	else
		return false

}

export const scratchCanvas = document.createElement('canvas')
function getImagePortion(image, rect) {
	scratchCanvas.width = rect.width;
	scratchCanvas.height = rect.height;
	scratchCanvas.getContext('2d').drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height,)
	return scratchCanvas.toDataURL()
}

