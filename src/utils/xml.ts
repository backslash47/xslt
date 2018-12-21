import { isAttribute, isCData, isComment, isDocument, isElement, isFragment, isText } from './types';

// tslint:disable:prefer-for-of

// Returns the text value of a node; for nodes without children this
// is the nodeValue, for nodes with children this is the concatenation
// of the value of all children. Browser-specific optimizations are used by
// default; they can be disabled by passing "true" in as the second parameter.
export function xmlValue(node: Node, disallowBrowserSpecificOptimization: boolean = false): string {
  if (!node) {
    return '';
  }

  let ret = '';
  if (isText(node) || isCData(node)) {
    ret += node.nodeValue;
  } else if (isAttribute(node)) {
    ret += node.nodeValue;
  } else if (isElement(node) || isDocument(node) || isFragment(node)) {
    if (!disallowBrowserSpecificOptimization) {
      // IE, Safari, Opera, and friends
      const innerText = (node as any).innerText;
      if (innerText != null) {
        return innerText;
      }
      // Firefox
      const textContent = node.textContent;
      if (textContent != null) {
        return textContent || '';
      }
    }
    // pobrecito!
    const len = node.childNodes.length;
    for (let i = 0; i < len; ++i) {
      ret += xmlValue(node.childNodes[i]);
    }
  }
  return ret;
}

// Returns the representation of a node as XML text.
export function xmlText(node: Node, optCdata: boolean = false) {
  const buf: string[] = [];
  xmlTextR(node, buf, optCdata);
  return buf.join('');
}

function xmlTextR(node: Node, buf: string[], cdata: boolean) {
  if (isText(node)) {
    buf.push(xmlEscapeText(node.nodeValue!));
  } else if (isCData(node)) {
    if (cdata) {
      buf.push(node.nodeValue!);
    } else {
      buf.push(`<![CDATA[${node.nodeValue}]]>`);
    }
  } else if (isComment(node)) {
    buf.push(`<!--${node.nodeValue}-->`);
  } else if (isElement(node)) {
    buf.push(`<${xmlFullNodeName(node)}`);
    for (let i = 0; i < node.attributes.length; ++i) {
      const a = node.attributes[i];
      if (a && a.nodeName && a.nodeValue) {
        buf.push(` ${xmlFullNodeName(a)}="${xmlEscapeAttr(a.nodeValue)}"`);
      }
    }

    if (node.childNodes.length === 0) {
      buf.push('/>');
    } else {
      buf.push('>');
      for (let i = 0; i < node.childNodes.length; ++i) {
        xmlTextR(node.childNodes[i], buf, cdata);
      }
      buf.push(`</${xmlFullNodeName(node)}>`);
    }
  } else if (isDocument(node) || isFragment(node)) {
    for (let i = 0; i < node.childNodes.length; ++i) {
      xmlTextR(node.childNodes[i], buf, cdata);
    }
  }
}

function xmlFullNodeName(n: Element | Attr) {
  if (n.prefix && n.nodeName.indexOf(`${n.prefix}:`) !== 0) {
    return `${n.prefix}:${n.nodeName}`;
  } else {
    return n.nodeName;
  }
}

// Escape XML special markup chracters: tag delimiter < > and entity
// reference start delimiter &. The escaped string can be used in XML
// text portions (i.e. between tags).
export function xmlEscapeText(s: string) {
  return `${s}`
    .replace(/&/g, '&amp;')
    .replace(/&amp;amp;/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Escape XML special markup characters: tag delimiter < > entity
// reference start delimiter & and quotes ". The escaped string can be
// used in double quoted XML attribute value portions (i.e. in
// attributes within start tags).
function xmlEscapeAttr(s: string) {
  return xmlEscapeText(s).replace(/"/g, '&quot;');
}

/**
 * Wrapper function to access the owner document uniformly for document
 * and other nodes: for the document node, the owner document is the
 * node itself, for all others it's the ownerDocument property.
 *
 */
export function xmlOwnerDocument(node: Node) {
  if (isDocument(node)) {
    return node;
  } else {
    return node.ownerDocument!;
  }
}
