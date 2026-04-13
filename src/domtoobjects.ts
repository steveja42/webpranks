import { log, ll } from './util'
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
	game?: Phaser.Game,
}

let fooWidth = 0
let fooHeight = 0

let divForBackgroundScreenshot: HTMLDivElement

export async function domToObjects(imageURL: string, html: string, debugPageImage: HTMLImageElement, debugImage: HTMLImageElement, width: number, height: number, bgDiv: HTMLDivElement): Promise<PageInfo> {
	//scratchCanvas = canvas
	log(ll.info, `start ${imageURL}`)
	const pageImage = debugPageImage || new Image()
	const imageLoaded = setImage(pageImage, imageURL)
	const parser = new DOMParser();
	const doc: HTMLDocument = parser.parseFromString(html, "text/html")
	const bgColor = JSON.parse(doc.body?.getAttribute('__pos__') ?? 'null')?.bgColor
	fooWidth = width
	fooHeight = height
	await imageLoaded
	await pageImage.decode().catch(() => {}) // ensure full pixel decode before any drawImage calls
	//logDomTree(doc.body, true)
	const color = bgColor ? Phaser.Display.Color.RGBStringToColor(bgColor).color : undefined
	if (bgColor)
		log(ll.debug, `page background color is ${bgColor} -${color}`)
	const pageInfo: PageInfo = {
		pageImage,
		domElementsImages: [],
		backgroundRects: [],
		debugImage,
		doc,
		bgColor: color ?? 0,
		game: undefined,
	}
	divForBackgroundScreenshot = bgDiv
	await walkDom2(doc.body, domNodeToObjects as Parameters<typeof walkDom2>[1], 0, pageInfo)
	log(ll.info, `done ${imageURL} ${pageInfo.domElementsImages.length} dom elements and ${pageInfo.backgroundRects.length} background objects added`)
	return pageInfo
}

function getAttributes(node: Element) {
	const posAttr = node.getAttribute('__pos__')
	if (!posAttr)
		return null
	const pos = JSON.parse(posAttr)
	//const { clientRects, boundingRect, paddingRect, bgColor } = pos
	return pos
}




/**
 *  Creates image from a DOM node if it is one that should be displayed and creates a backgroundRect for objects that have a background color.
 *
 * @param node
 * @param level - how many levels deep are we in the dom tree
 * @param pageInfo -info used by prank modules
 * @param parentAdded - true if a dom ancestor added a sprite, otherwise false
 */
async function domNodeToObjects(node: HTMLElement, level: number, pageInfo: PageInfo, parentAdded: boolean) {

	const debugThis = true
	const spriteAbleElements = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'IMG', 'LI', 'TD', 'TH', 'BUTTON', 'INPUT', 'LABEL', 'LEGEND', 'SELECT', 'TEXTAREA', 'A', 'SPAN', 'HR'] //, 'IFRAME'
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
		attrNode = findParentNodeWithAttributes(node.parentNode)!
		if (!attrNode)
			return parentAdded
	}

	type attrs = { boundingRect: DOMRect, bgColor: string, bgImage: string }
	const { boundingRect, bgColor, bgImage }: attrs = getAttributes(attrNode) || { boundingRect: null, bgColor: null, bgImage: null }

	if (!isOnScreen(boundingRect))
		return parentAdded

	const color = bgColor ? Phaser.Display.Color.RGBStringToColor(bgColor).color : null

	const willBeSprited = !isTextNode && (spriteAbleElements.includes(node.nodeName)) && !isLargeBackgroundElement(boundingRect)
	if (!isTextNode && bgColor && color !== pageInfo.bgColor && !isLargeBackgroundElement(boundingRect) && !willBeSprited) {    //create a rectangle to fill in the background,
		if (debugThis)
			log(ll.trace, `adding background ${bgColor} for ${node.id ? "#" + node.id : " "} ${node.parentNode?.nodeName}->${node.nodeName} at (${boundingRect.x}, ${boundingRect.y})  ${boundingRect.width} x ${boundingRect.height} "${node.textContent.slice(0, 30)}"`)

		pageInfo.backgroundRects.push({ boundingRect, bgColor: color ?? 0 })
	}
	if (parentAdded) {
		//log(`ignoring ${node.id ? "#" +node.id : " "} ${node.parentNode.nodeName}->${node.nodeName} at ${boundingRect.x},${boundingRect.y}`)
		return true
	}

	if (bgImage && !isLargeBackgroundElement(boundingRect)) {
		if (boundingRect.width < 1 || boundingRect.height < 1)
			return parentAdded
		const canvas = await html2canvas(divForBackgroundScreenshot, {
			width: boundingRect.width, height: boundingRect.height, onclone: function (clonedDoc) {
				const xDiv = clonedDoc.getElementById(divForBackgroundScreenshot.id)
				if (xDiv) {
					xDiv.style.display = 'block';
					xDiv.style.width = `${boundingRect.width}px`
					xDiv.style.height = `${boundingRect.height}px`
					xDiv.style.backgroundImage = bgImage
					xDiv.style.background = bgImage   // background: linear-gradient(90deg, rgb(7, 106, 255) 0%, rgb(199, 225, 255) 100%);
				}

			}
		})
		const imageURL = canvas.toDataURL()

		if (pageInfo.debugImage) {
			const imageLoaded = setImage(pageInfo.debugImage, imageURL)
			await imageLoaded
		}
		log(ll.trace, `---adding background image "${bgImage}"" ${pageInfo.domElementsImages.length}  ${node.id ? "#" + node.id : " "} ${node.parentNode?.nodeName}->${node.nodeName} at (${boundingRect.x}, ${boundingRect.y})  ${boundingRect.width} x ${boundingRect.height} "${node.textContent.slice(0, 30)}"`)

		pageInfo.domElementsImages.push({ boundingRect, imageURL })

		//div.clientWidth = boundingRect.width
	}

	// If an <A> directly wraps any other spriteable element (heading, img, etc.),
	// skip the A as a sprite leaf so the child is captured with its own bounding rect.
	if (!isTextNode && node.nodeName === 'A' && Array.from(node.children).some(c => spriteAbleElements.includes(c.nodeName)))
		return false

	if ((isTextNode || spriteAbleElements.includes(node.nodeName)) && !isLargeBackgroundElement(boundingRect)) {
		const { dataURL: imageURL, rect: trimmedRect } = getImagePortion(pageInfo.pageImage, boundingRect, pageInfo.bgColor)
		if (!imageURL) return false
		if (debugThis) {
			log(ll.trace, `adding image${pageInfo.domElementsImages.length}${isTextNode ? "textnode <- " : ""}  ${node.id ? "#" + node.id : " "} ${node.parentNode?.nodeName}->${node.nodeName} at (${trimmedRect.x}, ${trimmedRect.y})  ${trimmedRect.width} x ${trimmedRect.height} "${node.textContent.slice(0, 30)}"`)
			if (pageInfo.debugImage) {
				const imageLoaded = setImage(pageInfo.debugImage, imageURL)
				await imageLoaded
			}
		}
		pageInfo.domElementsImages.push({ boundingRect: trimmedRect, imageURL })
		return true
	}
	else
		return false

}

function findParentNodeWithAttributes(node: Node | null): HTMLElement | null {
	if (node && (node as Element).tagName === "DIV") {
		const { boundingRect } = getAttributes(node as Element) || { boundingRect: null }
		if (isOnScreen(boundingRect))
			if (boundingRect?.width && boundingRect?.height)
				return node as HTMLElement
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
function isOnScreen(boundingRect: DOMRect | null) {
	return (boundingRect && boundingRect.width && boundingRect.height && boundingRect.x <= fooWidth && boundingRect.y <= fooHeight && boundingRect.x >= 0 && boundingRect.y >= 0)
}

function isLargeBackgroundElement(boundingRect: DOMRect): boolean {
	const viewportArea = fooWidth * fooHeight
	const elementArea = boundingRect.width * boundingRect.height
	return elementArea > viewportArea * 0.5
}

/**
 * Finds the right and bottom crop boundaries by scanning inward from each edge,
 * removing only trailing columns/rows that are entirely background-colored.
 * Left and top edges are never moved (glyph anti-aliasing makes them unreliable).
 *
 * A column is kept if ANY pixel in it differs from the background by more than
 * `threshold` in at least one RGB channel. Scanning stops at the first kept column,
 * so a partially-transparent glyph edge always protects everything to its left.
 *
 * @returns { right, bottom } — exclusive pixel counts from the origin
 */
function trimBounds(
	data: Uint8ClampedArray, w: number, h: number,
	bgR: number, bgG: number, bgB: number,
	threshold = 4, pad = 16
): { right: number, bottom: number } {
	const isBackground = (i: number) =>
		data[i + 3] < 10 ||
		(Math.abs(data[i]   - bgR) <= threshold &&
		 Math.abs(data[i+1] - bgG) <= threshold &&
		 Math.abs(data[i+2] - bgB) <= threshold)

	// Scan inward from the right: stop at the first column containing any non-background pixel
	let right = w
	outer: for (let x = w - 1; x >= 0; x--) {
		for (let y = 0; y < h; y++) {
			if (!isBackground((y * w + x) * 4)) { right = x + 1; break outer }
		}
	}

	// Scan inward from the bottom: stop at the first row containing any non-background pixel
	let bottom = h
	outer: for (let y = h - 1; y >= 0; y--) {
		for (let x = 0; x < w; x++) {
			if (!isBackground((y * w + x) * 4)) { bottom = y + 1; break outer }
		}
	}

	return { right: Math.min(w, right + pad), bottom: Math.min(h, bottom + pad) }
}

export const scratchCanvas = document.createElement('canvas')
function getImagePortion(image: HTMLImageElement, rect: DOMRect, bgColor?: number): { dataURL: string, rect: DOMRect } {
	const w = Math.round(rect.width), h = Math.round(rect.height)
	if (w < 1 || h < 1) return { dataURL: '', rect }
	// Scale source coords if screenshot dimensions differ from viewport (e.g. retina/DPR mismatch)
	const scaleX = image.naturalWidth / fooWidth
	const scaleY = image.naturalHeight / fooHeight
	// Draw extra pixels on the right to capture glyph overhang past the layout box.
	// trimBounds will remove any trailing blank columns, so this never enlarges the final sprite.
	const overhangPx = 16
	const sx = rect.x * scaleX, sy = rect.y * scaleY
	const sw = (w + overhangPx) * scaleX, sh = h * scaleY
	const canvasW = w + overhangPx
	scratchCanvas.width = canvasW
	scratchCanvas.height = h
	const ctx = scratchCanvas.getContext('2d', { willReadFrequently: true })!
	ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvasW, h)
	log(ll.trace, `getImagePortion: crop src=(${sx.toFixed(1)},${sy.toFixed(1)}) ${sw.toFixed(1)}x${sh.toFixed(1)} → canvas ${canvasW}x${h} scale=${scaleX.toFixed(3)}x${scaleY.toFixed(3)} imgNatural=${image.naturalWidth}x${image.naturalHeight} viewport=${fooWidth}x${fooHeight}`)
	if (bgColor !== undefined) {
		const bgR = (bgColor >> 16) & 0xff, bgG = (bgColor >> 8) & 0xff, bgB = bgColor & 0xff
		const data = ctx.getImageData(0, 0, canvasW, h).data
		const { right, bottom } = trimBounds(data, canvasW, h, bgR, bgG, bgB)
		if (right === 0 || bottom === 0) {
			log(ll.debug, `getImagePortion: all pixels match bgColor (${bgR},${bgG},${bgB}) at (${rect.x},${rect.y}) ${w}x${h} scale=${scaleX.toFixed(2)}x${scaleY.toFixed(2)}`)
		} else if (right < canvasW || bottom < h) {
			const trimmed = ctx.getImageData(0, 0, right, bottom)  // read BEFORE resizing (resize clears canvas)
			scratchCanvas.width = right
			scratchCanvas.height = bottom
			ctx.putImageData(trimmed, 0, 0)
			return { dataURL: scratchCanvas.toDataURL(), rect: new DOMRect(rect.x, rect.y, right, bottom) }
		}
	}
	return { dataURL: scratchCanvas.toDataURL(), rect }
}

/**
 * sets image.src to imageURL and returns promise that resolves when image has been loaded with imageURL
 * @param imageElement
 * @param imageURL
 */
function setImage(imageElement: HTMLImageElement, imageURL: string): Promise<unknown> {
	const imageLoaded = new Promise((resolve, reject) => {
		imageElement.onload = () => resolve(imageElement.src)
		imageElement.onerror = (e) => reject(new Error(`Failed to load image: ${imageURL} ${e}`))
	})
	imageElement.src = imageURL;
	return imageLoaded
}
