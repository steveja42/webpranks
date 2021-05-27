import { log } from './util'
import { Engine, Render, Bodies, World } from "matter-js"

const nodeTypes = {
	element: 1, //An Element node such as <p> or <div>.
	text: 3,        //The actual Text of Element or Attr.
	cdataSection: 4,  //A CDATASection.
	processingInstruction: 7,
	comment: 8,
	document: 9,
	documentType: 10,   //A DocumentType node e.g. <!DOCTYPE html> for HTML5 documents.
	documentFragment: 11,
}

export function addDomToWorld(world: World, doc: HTMLDocument, pageImage: HTMLImageElement, setDebugImage, canvas) {
	//scratchCanvas = canvas
	logDomTree(doc.body, true)
	const stuff = {
		pageImage,
		bodies: [],
		setDebugImage
	}
	walkDom(doc.body, domNodeToSprites, 0, stuff)
	if (stuff.bodies.length)
		World.add(world, stuff.bodies)
}

/**
 * Walks a dom tree starting with startNode, calling func(level, param) on each node,
 * where level is the level of the tree and param is an optional paramater. 
 * @param startNode node to start with 
 * @param func callback function
 * @param level initial level
 * @param param parameter to pass to the callback function
 *  
 */
function walkDom(startNode, func, level = 0, param = undefined) {
	func(startNode, level, param);
	if (!startNode.hasChildNodes())
		return;
	//const children = []

	++level;
	for (const child of startNode.childNodes) {
		walkDom(child, func, level, param);
	}
}

/**
 *  Creates sprite(s) from a DOM node
 * @param node 
 * @param level - how many levels deep are we in the dom tree
 */
function domNodeToSprites(node: HTMLElement, level: number, stuff) {

	const basicElements = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P']

	//The Element.clientHeight read-only property is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels. It includes padding but excludes borders, margins, and horizontal scrollbars (if present).
	//clientHeight can be calculated as: CSS height + CSS padding - height of horizontal scrollbar (if present).
	// boundingclientrect smallest rectangle which contains the entire element, including its padding and border-width
	if (node.nodeType !== nodeTypes.element || !basicElements.includes(node.nodeName))
		return

	//const parent = (level === 0) ? ` parent:${node.parentNode}` : ''
	//	const computedStyle = ownerWindow?.getComputedStyle(node)
	let clientRects
	let boundingRect = node.getBoundingClientRect()
	let paddingRect = { x: boundingRect.x + node.clientLeft, y: boundingRect.y + node.clientTop, width: node.clientWidth, height: node.clientHeight }
	const posAttr = node.getAttribute('__pos__')
	if (posAttr) {
		const pos = JSON.parse(posAttr)
			//computedStyle = pos?.computedStyle
			; ({ clientRects, boundingRect, paddingRect } = pos)
	}

	if (boundingRect) {

		const foo = stuff.pageImage
		const image = getImagePortion(stuff.pageImage, boundingRect)
		stuff.setDebugImage(image)
		const options = { render: { sprite: { texture: image, xScale: 1, yScale: 1 } } }
		const body = Bodies.rectangle(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height, options)
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

/**
 * logs information about a DOM node, with indentation based on level
 * @param node 
 * @param level 
 */
function logNode(node, level: number, usePosAttr = false) {

	let value = node.nodeValue?.trim()
	if (node.nodeType === nodeTypes.text && !value) // skip blank text nodes
		return;
	const indentDelta = '   ';
	const indent = indentDelta.repeat(level);

	const ownerWindow = node.ownerDocument.defaultView
	value = value ? `"${value}"` : "";

	let id = node.name ? ` ${node.name}` : " ";
	id += node.id ? `#${node.id}` : "";
	id += node.className ? `.${node.className}` : "";


	//The Element.clientHeight read-only property is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels. It includes padding but excludes borders, margins, and horizontal scrollbars (if present).
	//clientHeight can be calculated as: CSS height + CSS padding - height of horizontal scrollbar (if present).
	// boundingclientrect smallest rectangle which contains the entire element, including its padding and border-width
	if (node.nodeType === nodeTypes.element) {

		let positioning = ' ';
		const parent = (level === 0) ? ` parent:${node.parentNode}` : ''
		const computedStyle = ownerWindow?.getComputedStyle(node)
		let clientRects
		let boundingRect = node.getBoundingClientRect()
		let paddingRect = { x: boundingRect.x + node.clientLeft, y: boundingRect.y + node.clientTop, width: node.clientWidth, height: node.clientHeight }
		let bgColor
		let background = ''

		if (usePosAttr) {
			const posAttr = node.getAttribute('__pos__')
			if (posAttr) {
				const pos = JSON.parse(posAttr)
					//computedStyle = pos?.computedStyle
					; ({ clientRects, boundingRect, paddingRect, bgColor } = pos)
					if (bgColor)
						background+= ` ${bgColor}`
			}
		} else if (computedStyle) {
			if (computedStyle.position !== 'static') {
				positioning = `<${computedStyle.position}>`;
			}

			if (computedStyle.lineHeight)
				positioning = positioning + ` lh:${computedStyle.lineHeight}`;
			if (computedStyle.backgroundImage !== 'none') {
				background = computedStyle.background
			}
		}

		const size = (node.width || node.height) ? `size: ${node.width} x ${node.height} ` : ' ';
		//  ${nodeTypeNames[node.nodeType]}
		let br = ' ';
		if (boundingRect) {
			br = `boundingClientRect[${boundingRect.left},${boundingRect.top} ${boundingRect.right},${boundingRect.bottom}] `;
		}

		log(`${indent}${node.nodeName}${id}${positioning}${size} ${br}${parent} ${value} ${background}`);
	}
	else if (node.nodeType === nodeTypes.text) {
		log(`${indent} "${node.wholeText}"`);

	}

}

export function logDomTree(startNode: HTMLElement, usePosAttr = false): void {

	const ownerWindow = startNode.ownerDocument.defaultView
	const doc = startNode.ownerDocument
	const body = doc.body;
	const box = startNode.getBoundingClientRect();
	const docEl = document.documentElement;

	const scrollTop = ownerWindow?.pageYOffset || docEl.scrollTop || body.scrollTop;
	const scrollLeft = ownerWindow?.pageXOffset || docEl.scrollLeft || body.scrollLeft;

	const clientTop = docEl.clientTop || body.clientTop || 0;
	const clientLeft = docEl.clientLeft || body.clientLeft || 0;

	const top = box.top + scrollTop - clientTop;
	const left = box.left + scrollLeft - clientLeft;
	log(`logDomTree in document ${doc} window ${ownerWindow} clientTop ${clientTop} clientLeft ${clientLeft} scrollLeft ${scrollLeft} scrollTop ${scrollTop}`)
	walkDom(startNode, logNode, 0, usePosAttr);
}


