/* eslint-disable prefer-const */
import { log } from './util';

//nodeType
const nodeTypeNames = ["0", 'Element', 'Attribute', 'Text', 'Cdata Section', '5', '6', 'Processing Instruction', 'comment', 'Document', 'Document Type', 'Document Fragment'];
const nodeTypes = {
  element: 1,
  text: 3,
  cdataSection: 4,
  processingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
}
/*
Node.ELEMENT_NODE	1	An Element node such as <p> or <div>.
Node.TEXT_NODE	3	The actual Text of Element or Attr.
Node.CDATA_SECTION_NODE	4	A CDATASection.
Node.PROCESSING_INSTRUCTION_NODE	7	A ProcessingInstruction of an XML document such as <?xml-stylesheet ... ?> declaration.
Node.COMMENT_NODE	8	A Comment node.
Node.DOCUMENT_NODE	9	A Document node.
Node.DOCUMENT_TYPE_NODE	10	A DocumentType node e.g. <!DOCTYPE html> for HTML5 documents.
Node.DOCUMENT_FRAGMENT_NODE	11
*/

interface PositionInfo {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  savedStyles: any
}


export function expandBelow(nodeAbove: HTMLElement, nodeBelow: HTMLIFrameElement): void {
  const rectAbove = getOuterRect(nodeAbove);
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth;
  nodeBelow.style.position = 'fixed';
  //node.style.position  = 'absolute'; 
  nodeBelow.style.left = "0 px";
  nodeBelow.style.top = (rectAbove.bottom + 1).toString() + "px";
  nodeBelow.width = (viewportWidth - 1).toString()
  nodeBelow.height = (viewportHeight - rectAbove.bottom).toString()
  nodeBelow.style.right = (viewportWidth - 1).toString() + "px";
  nodeBelow.style.bottom = (viewportHeight - 1).toString() + "px";


}



///////////////////////////
export class PositionedElements {
  savedElementStyles = new Map<HTMLElement, PositionInfo>();
  window: (Window & typeof globalThis) | null
  document: Document

  constructor(startNode: HTMLElement) {
    this.document = startNode.ownerDocument;
    this.window = startNode.ownerDocument.defaultView

    this.walkDom2(startNode, this.savePositionStyles, 0);
    //this.setupPositioning(startNode);
    this.setFixedPosition();
  }

  restorePositionStyles(): void {
    //for (let [node,posInfo] of this.elementPositions) {
    this.savedElementStyles.forEach(function (posInfo: PositionInfo, node: HTMLElement) {
      node.style.position = '';
      node.style.left = '';
      node.style.top = '';
      node.style.boxSizing = '';
      node.style.width = '';
      node.style.height = '';
      node.style.margin = '';

      if (posInfo.savedStyles) {
        const keys = Object.keys(posInfo.savedStyles);
        for (const key of keys) {
          if (posInfo.savedStyles[key])
            node.style[key] = posInfo.savedStyles[key];
        }
      }
    })
  }
  /**
   * Change positioning of elements to fixed, set margin to 0
   */
  setFixedPosition(): void {
    const viewportHeight = this.window?.innerHeight;
    const viewportWidth = this.window?.innerWidth;
    const outerRect = getOuterRect(document.body);

    this.savedElementStyles.forEach(function (posInfo: PositionInfo, node: HTMLElement) {
      const computedStyle = window.getComputedStyle(node);

      node.style.position = 'fixed';
      node.style.setProperty("margin", "0px", "important");
      //node.style.margin = '0px !important';
      //node.style.position  = 'absolute';    
      node.style.left = (posInfo.left - window.scrollX).toString() + "px";  //-parseFloat(computedStyle.marginLeft)
      node.style.top = (posInfo.top - window.scrollY).toString() + "px";
      node.style.boxSizing = 'border-box'; //The width and height properties include the content, padding, and border, but do not include the margin.
      node.style.width = `${posInfo.width}px`;
      node.style.height = `${posInfo.height}px`;
      //if ((computedStyle.backgroundImage != 'none')) {  //( node.nodeName == 'IMG') ||
      //  node.style.backgroundSize = `${posInfo.contentRect.width}px ${posInfo.contentRect.height}px`;

      //}
      /*
      if (node.width)
        node.style.maxWidth = node.width.toString() + 'px';
      if (node.height)
        node.style.maxHeight = node.height.toString() + 'px';
*/
      //if (node.nodeName == 'IMG')
      //1 == 1;
    })
  }
  /**
   * save positioning style of element so it can be restored later and add it to collection of elements that can be moved
   * @param el element  
   * @param level depth into dom tree
   */
  savePositionStyles(el: HTMLElement, level: number): void {
    if (el.nodeType !== nodeTypes.element || el.nodeName === 'BODY' || el.nodeName === 'SCRIPT' || el.className === 'pos_ignore')
      return;

    //|| el.nodeName == 'BODY'
    //todo - put text nodes with no element parent into spans
    const style = el.style;
    const position = el.style.position;
    const top = el.style.top;
    const left = el.style.left;
    const width = el.style.width;
    const height = el.style.height;
    const boxSizing = el.style.boxSizing;
    const margin = el.style.margin;

    // if (el.nodeName == 'IMG')
    //  1 == 1;
    let savedStyles;
    if (position || top || left || width || height || boxSizing || margin) {
      savedStyles = { position, top, left, width, height, boxSizing, margin };
      //this.savedPositioningStyles.set(node, savedStyles);
    }
    //var rectCollection = el.getClientRects();
    const outerRect = el.getBoundingClientRect();

    //let outerRect =  getOuterRect(el); //  {left:contentRect.left,top:contentRect.top,right:contentRect.right,bottom:contentRect.bottom};

    const posInfo = { left: outerRect.left, top: outerRect.top, right: outerRect.right, bottom: outerRect.bottom, width: outerRect.width, height: outerRect.height, savedStyles };
    this.savedElementStyles.set(el, posInfo);
    //br = `bounding rect[${rect.left},${rect.top} ${rect.right},${rect.bottom}] `;

  }
  move(x: number, y: number): void {
    this.savedElementStyles.forEach(function (posInfo: PositionInfo, node: HTMLElement) {
      posInfo.left += x;
      posInfo.top += y;
      node.style.left = (posInfo.left - window.scrollX).toString() + "px";
      node.style.top = (posInfo.top - window.scrollY).toString() + "px";
    })
  }

  walkDom2(startNode, func, level: number): void {
    //
    func.bind(this)(startNode, level);
    if (!startNode.hasChildNodes())
      return;
    //const children = []

    ++level;
    for (const child of startNode.childNodes) {
      this.walkDom2(child, func, level);
    }
  }
}  // end class

//returns rectangle whichs includes the border and padding of an element, but not the margin
//getBoundingClientRect - returned TextRectangle object includes the padding, scrollbar, and the border, but excludes the margin. In Internet Explorer, the coordinates of the bounding rectangle include the top and left borders of the client area.
function getOuterRect(el: HTMLElement) {

  const computedStyle = window.getComputedStyle(el);
  const contentRect = el.getBoundingClientRect();
  const outerRect = { left: contentRect.left, top: contentRect.top, right: contentRect.right, bottom: contentRect.bottom, };

  /* 
  outerRect.left -= parseFloat(computedStyle.marginLeft);
  outerRect.top -= parseFloat(computedStyle.marginTop);
  outerRect.right += parseFloat(computedStyle.marginRight);
  outerRect.bottom += parseFloat(computedStyle.marginBottom);

  if (computedStyle.boxSizing =='border-box'){
    outerRect.left -= parseFloat(computedStyle.borderLeft) + parseFloat(computedStyle.paddingLeft);
    outerRect.top -= parseFloat(computedStyle.borderTop) + parseFloat(computedStyle.paddingTop);
    outerRect.right += parseFloat(computedStyle.borderRight) + parseFloat(computedStyle.paddingRight);
    outerRect.bottom += parseFloat(computedStyle.borderBottom) + parseFloat(computedStyle.paddingBottom);

  }
  */
  //outerRect.width = outerRect.right - outerRect.left; // + 1;
  //outerRect.height = outerRect.bottom - outerRect.top ; //-  + 1;
  outerRect.left += window.scrollX;
  outerRect.right += window.scrollX;
  outerRect.top += window.scrollY;
  outerRect.bottom += window.scrollY;
  return outerRect;

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
  let background = ''

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
    let computedStyle = ownerWindow?.getComputedStyle(node)
    let clientRects
    let boundingRect = node.getBoundingClientRect()
    let paddingRect = { x: boundingRect.x + node.clientLeft, y: boundingRect.y + node.clientTop, width: node.clientWidth, height: node.clientHeight }
    if (usePosAttr) {
      const posAttr = node.getAttribute('__pos__')
      if (posAttr) {
        const pos = JSON.parse(posAttr)
          //computedStyle = pos?.computedStyle
          ; ({ clientRects, boundingRect, paddingRect } = pos)
      }
    }

    if (computedStyle) {
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

function walkDom(startNode, func, level, param = undefined) {
  func(startNode, level, param);
  if (!startNode.hasChildNodes())
    return;
  //const children = []

  ++level;
  for (const child of startNode.childNodes) {
    walkDom(child, func, level, param);
  }
}