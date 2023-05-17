import { log } from './util'
//import { Engine, Render, Bodies, World, Body, Runner } from "matter-js"
import { walkDom2, nodeTypes } from './dom'
import * as Phaser from 'phaser';
import html2canvas from 'html2canvas'

type BackGroundRect = {
	boundingRect: DOMRect,
	bgColor: number
}
type DomElementImage = {
	boundingRect: DOMRect,
	imageURL: string
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
export interface PageInfo {
	pageImage: HTMLImageElement,
	domElementsImages: DomElementImage[],
	backgroundRects: BackGroundRect[],
	debugImage: HTMLImageElement,
	doc: HTMLDocument,
	bgColor: number,
	game: Phaser.Game,
}

let fooWidth = 0
let fooHeight = 0

let divForBackgroundScreenshot

export async function domToObjects(imageURL: string, html: string, debugPageImage: HTMLImageElement, debugImage: HTMLImageElement, width: number, height: number, bgDiv: HTMLDivElement): Promise<PageInfo> {
	//scratchCanvas = canvas
	log(`start ${imageURL}`)
	const pageImage = debugPageImage || new Image()
	const imageLoaded = setImage(pageImage, imageURL)
	const parser = new DOMParser();
	const doc: HTMLDocument = parser.parseFromString(html, "text/html")
	const bgColor = JSON.parse(doc.body?.getAttribute('__pos__'))?.bgColor
	fooWidth = width
	fooHeight = height
	await imageLoaded
	//logDomTree(doc.body, true)
	const color = bgColor ? Phaser.Display.Color.RGBStringToColor(bgColor).color : undefined
	if (bgColor)
		log(`page background color is ${bgColor} -${color}`)
	const pageInfo: PageInfo = {
		pageImage,
		domElementsImages: [],
		backgroundRects: [],
		debugImage,
		doc,
		bgColor: color,
		game: undefined,
	}
	divForBackgroundScreenshot = bgDiv
	await walkDom2(doc.body, domNodeToObjects, 0, pageInfo)
	log(`done ${imageURL} ${pageInfo.domElementsImages.length} dom elements and ${pageInfo.backgroundRects.length} background objects added`)
	return pageInfo
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
 *  Creates image from a DOM node if it one that should be displayed and creates a backgroundRect for objects that have a background color. 
 *  
 * @param node 
 * @param level - how many levels deep are we in the dom tree
 * @param pageInfo -info used by prank modules
 * @param parentAdded - true if a dom ancestor added a sprite, otherwise false
 */
async function domNodeToObjects(node: HTMLElement, level: number, pageInfo: PageInfo, parentAdded) {

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

	type attrs = { boundingRect: DOMRect, bgColor: string, bgImage: string }
	const { boundingRect, bgColor, bgImage }: attrs = getAttributes(attrNode) || { boundingRect: null, bgColor: null, bgImage: null }

	if (!isOnScreen(boundingRect))
		return parentAdded

	const color = bgColor ? Phaser.Display.Color.RGBStringToColor(bgColor).color : null

	if (!isTextNode && bgColor && color !== pageInfo.bgColor) {    //create a rectangle to fill in the background, 
		/*const ctx = stuff.canvas.getContext('2d')
		ctx.fillStyle = bgColor
		ctx.fillRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height) */

		if (debugThis)
			log(`adding background ${bgColor} for ${node.id ? "#" + node.id : " "} ${node.parentNode.nodeName}->${node.nodeName} at (${boundingRect.x}, ${boundingRect.y})  ${boundingRect.width} x ${boundingRect.height} "${node.textContent.slice(0, 30)}"`)

		pageInfo.backgroundRects.push({ boundingRect, bgColor: color })
	}
	if (parentAdded) {
		//log(`ignoring ${node.id ? "#" +node.id : " "} ${node.parentNode.nodeName}->${node.nodeName} at ${boundingRect.x},${boundingRect.y}`)
		return true
	}

	if (bgImage) {
	const canvas = await html2canvas(divForBackgroundScreenshot, {
			width: boundingRect.width, height: boundingRect.height, onclone: function (clonedDoc) {
				const xDiv = clonedDoc.getElementById(divForBackgroundScreenshot.id)
				xDiv.style.display = 'block';
				xDiv.style.width = `${boundingRect.width}px`
				xDiv.style.height = `${boundingRect.height}px`
				xDiv.style.backgroundImage = bgImage   
				xDiv.style.background = bgImage   // background: linear-gradient(90deg, rgb(7, 106, 255) 0%, rgb(199, 225, 255) 100%);
		
			}
		})
		const imageURL = canvas.toDataURL()

		if (pageInfo.debugImage) {
			const imageLoaded = setImage(pageInfo.debugImage, imageURL)
			await imageLoaded
		}
		log(`---adding background image "${bgImage}"" ${pageInfo.domElementsImages.length}  ${node.id ? "#" + node.id : " "} ${node.parentNode.nodeName}->${node.nodeName} at (${boundingRect.x}, ${boundingRect.y})  ${boundingRect.width} x ${boundingRect.height} "${node.textContent.slice(0, 30)}"`)

		pageInfo.domElementsImages.push({ boundingRect, imageURL })

		//div.clientWidth = boundingRect.width
	}

	if (isTextNode || spriteAbleElements.includes(node.nodeName)) {
		const imageURL = getImagePortion(pageInfo.pageImage, boundingRect)
		if (debugThis) {
			log(`adding image${pageInfo.domElementsImages.length}${isTextNode ? "textnode <- " : ""}  ${node.id ? "#" + node.id : " "} ${node.parentNode.nodeName}->${node.nodeName} at (${boundingRect.x}, ${boundingRect.y})  ${boundingRect.width} x ${boundingRect.height} "${node.textContent.slice(0, 30)}"`)
			if (pageInfo.debugImage) {
				const imageLoaded = setImage(pageInfo.debugImage, imageURL)
				await imageLoaded
			}
		}

		//if (debugThis) 
		//options.collisionFilter.group = -2
		//const body = Bodies.rectangle(boundingRect.x + boundingRect.width / 2, boundingRect.y + boundingRect.height / 2, boundingRect.width, boundingRect.height, options)
		pageInfo.domElementsImages.push({ boundingRect, imageURL })
		return true
	}
	else
		return false

}

function findParentNodeWithAttributes(node): HTMLElement {
	if (node && node.tagName === "DIV") {
		const { boundingRect } = getAttributes(node) || { boundingRect: null }
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
function isOnScreen(boundingRect) {
	return (boundingRect && boundingRect.width && boundingRect.height && boundingRect.x <= fooWidth && boundingRect.y <= fooHeight && boundingRect.x >= 0 && boundingRect.y >= 0)
}

export const scratchCanvas = document.createElement('canvas')
function getImagePortion(image, rect) {
	scratchCanvas.width = rect.width;
	scratchCanvas.height = rect.height;
	scratchCanvas.getContext('2d').drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height,)
	return scratchCanvas.toDataURL()
}

/**
 * sets image.src to imageURL and returns promise that resolves when image has been loaded with imageURL 
 * @param imageElement 
 * @param imageURL 
 */
function setImage(imageElement: HTMLImageElement, imageURL: string): Promise<unknown> {
	let resolveImageLoaded
	imageElement.onload = function () {
		resolveImageLoaded(imageElement.src)
	}
	const imageLoaded = new Promise((resolve) => resolveImageLoaded = resolve)
	imageElement.src = imageURL;
	return imageLoaded
}
