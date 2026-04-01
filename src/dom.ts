import { log } from './util'

export const nodeTypes = {
	element: 1, //An Element node such as <p> or <div>.
	text: 3,        //The actual Text of Element or Attr.
	cdataSection: 4,  //A CDATASection.
	processingInstruction: 7,
	comment: 8,
	document: 9,
	documentType: 10,   //A DocumentType node e.g. <!DOCTYPE html> for HTML5 documents.
	documentFragment: 11,
}

/**
 * Walks a dom tree starting with startNode, calling func(level, param) on each node,
 * where level is the level of the tree and param is an optional paramater. 
 * @param startNode node to start with 
 * @param func callback function
 * @param level is incremented on recursive calls
 * @param param parameter passed to the callback function
 *  
 */
export function walkDom(startNode: Node, func: (node: Node, level: number, param?: unknown) => void, level = 0, param: unknown = undefined) {
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
 * Walks a dom tree starting with startNode, calling func(level, param) on each node,
 * where level is the level of the tree and param is an optional paramater. 
 * @param startNode node to start with 
 * @param func callback function
 * @param level is incremented on recursive calls
 * @param param parameter passed to the callback function
 * @param parentReturn what the parent returned is passed to the callback function
 *  
 */
export async function walkDom2(startNode: Node, func: (node: Node, level: number, param?: unknown, parentReturn?: unknown) => Promise<unknown> | unknown, level = 0, param: unknown = undefined, parentReturn: unknown = undefined) {
	let ret = func(startNode, level, param, parentReturn)
	if (ret && typeof ret === 'object' && 'then' in ret)
		ret = await ret
	if (!startNode.hasChildNodes())
		return;

	++level;
	for (const child of startNode.childNodes) {
		await walkDom2(child, func, level, param, ret);
	}
}


/**
 * logs information about a DOM node, with indentation based on level
 * @param node 
 * @param level 
 */
function logNode(node: Node, level: number, usePosAttr: unknown = false) {

	let value = (node as Text).nodeValue?.trim()
	if (node.nodeType === nodeTypes.text && !value) // skip blank text nodes
		return;
	const indentDelta = '   ';
	const indent = indentDelta.repeat(level);

	const ownerWindow = node.ownerDocument?.defaultView
	value = value ? `"${value}"` : "";

	//The Element.clientHeight read-only property is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels. It includes padding but excludes borders, margins, and horizontal scrollbars (if present).
	//clientHeight can be calculated as: CSS height + CSS padding - height of horizontal scrollbar (if present).
	// boundingclientrect smallest rectangle which contains the entire element, including its padding and border-width
	if (node.nodeType === nodeTypes.element) {
		const el = node as HTMLElement

		let id = el.getAttribute('name') ? ` ${el.getAttribute('name')}` : " ";
		id += el.id ? `#${el.id}` : "";
		id += el.className ? `.${el.className}` : "";

		let positioning = ' ';
		const parent = (level === 0) ? ` parent:${el.parentNode}` : ''
		const computedStyle = ownerWindow?.getComputedStyle(el)
		let clientRects
		let boundingRect = el.getBoundingClientRect()
		let paddingRect = { x: boundingRect.x + el.clientLeft, y: boundingRect.y + el.clientTop, width: el.clientWidth, height: el.clientHeight }
		let bgColor
		let bgImage
		let background = ''

		if (usePosAttr) {
			const posAttr = el.getAttribute('__pos__')
			if (posAttr) {
				({ clientRects, boundingRect, paddingRect, bgColor, bgImage } = JSON.parse(posAttr))
				if (bgColor)
					background += ` ${bgColor}`
				if (bgImage)
					background += ` ${bgImage}`
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

		const imgEl = el as HTMLImageElement
		const size = (imgEl.width || imgEl.height) ? `size: ${imgEl.width} x ${imgEl.height} ` : ' ';
		//  ${nodeTypeNames[node.nodeType]}
		let br = ' ';
		if (boundingRect) {
			br = `boundingClientRect[${boundingRect.left},${boundingRect.top} ${boundingRect.right},${boundingRect.bottom}] `;
		}

		log(`${indent}${el.nodeName}${id}${positioning}${size} ${br}${parent} ${value} ${background}`);
	}
	else if (node.nodeType === nodeTypes.text) {
		log(`${indent} "${(node as Text).wholeText}"`);

	}

}

export function logDomTree(startNode: HTMLElement, usePosAttr = true): void {

	const ownerWindow = startNode.ownerDocument.defaultView
	const doc = startNode.ownerDocument
	const body = doc.body;
	const docEl = document.documentElement;

	const scrollTop = ownerWindow?.pageYOffset || docEl.scrollTop || body.scrollTop;
	const scrollLeft = ownerWindow?.pageXOffset || docEl.scrollLeft || body.scrollLeft;

	const clientTop = docEl.clientTop || body.clientTop || 0;
	const clientLeft = docEl.clientLeft || body.clientLeft || 0;

	log(`logDomTree in document ${doc} window ${ownerWindow} clientTop ${clientTop} clientLeft ${clientLeft} scrollLeft ${scrollLeft} scrollTop ${scrollTop}`)
	walkDom(startNode, logNode, 0, usePosAttr);
}


