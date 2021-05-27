/* eslint-disable prefer-const */
import { log } from './util';

//nodeType
const nodeTypeNames = ["0", 'Element', 'Attribute', 'Text', 'Cdata Section', '5', '6', 'Processing Instruction', 'comment', 'Document', 'Document Type', 'Document Fragment'];
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

interface PositionInfo {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  savedStyles: any
}


/**
 *  A class which, given a dom tree, saves the positioning styles of the nodes and converts the nodes to use fixed positioning. 
 * The nodes can then be moved using the move(x,y) method or restored to original state using  restorePositionStyles
 * 
 */

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

  /**
   *  restores the elements positioning info to what it originally was
   */
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
   * Save positioning style of element so it can be restored later and add it to collection of elements that can be moved
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


/*
let elems: PositionedElements

 <div>
      <iframe src="about:blank" srcDoc={html} title="page to be pranked" onLoad={onIFrameLoad} width={windowWidth} height={windowHeight}></iframe>
    </div>


  const onIFrameLoad = (e) => {
    log('frame loaded')
    if (childFrame && elems)
      elems.restorePositionStyles();
    if (e?.target?.contentDocument?.body) {
      //logDomTree(e.target.contentDocument.body)
      setChildFrame(e.target)
      elems = new PositionedElements(e.target.contentDocument.body)
    }
  }

  /**
 * Displays buttons to move elements
 * @param props 
 */
/*
 function MoveDom(props: any): JSX.Element {
  const [xToMove, setXToMove] = useState(0)
  const [yToMove, setYToMove] = useState(0)

  function move(x: number, y: number) {

    if (elems)
      elems.move(x, y)

  }
  return <div id="foo2">
    <input name="xToMove" type="number" value={xToMove} size={4} onChange={(e) => setXToMove(parseInt(e.target.value))} placeholder="Enter a number for X" />
    <input name="yToMove" type="number" value={yToMove} size={4} onChange={(e) => setYToMove(parseInt(e.target.value))} placeholder="Enter a number for Y" />
    <Button onClick={e => move(xToMove, yToMove)}>Move</Button>
  </div>

}
*/