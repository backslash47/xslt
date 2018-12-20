export function isElement(e: Node | undefined | null): e is Element {
  return e != null && e.nodeType === 1; // Node.ELEMENT_NODE;
}

export function isAttribute(e: Node | undefined | null): e is Attr {
  return e != null && (e.nodeType === 2 || (e as Attr).specified); // Node.ATTRIBUTE_NODE; // DOM4 support
}

export function isText(e: Node | undefined | null): e is Text {
  return e != null && e.nodeType === 3; // Node.TEXT_NODE;
}

export function isCData(e: Node | undefined | null): e is CDATASection {
  return e != null && e.nodeType === 4; // Node.CDATA_SECTION_NODE;
}

export function isDocument(e: Node | undefined | null): e is Document {
  return e != null && e.nodeType === 9; // Node.DOCUMENT_NODE;
}

export function isFragment(e: Node | undefined | null): e is DocumentFragment {
  return e != null && e.nodeType === 11; // Node.DOCUMENT_FRAGMENT;
}

export function isProcessingInstruction(e: Node | undefined | null): e is ProcessingInstruction {
  return e != null && e.nodeType === 7; // Node.PROCESSING_INSTRUCTION_NODE;
}

export function isComment(e: Node | undefined | null): e is Comment {
  return e != null && e.nodeType === 8; // Node.COMMENT_NODE;
}

export function isNamespaceNode(e: Node | undefined | null): e is Attr {
  if (isAttribute(e)) {
    return e.localName === 'xmlns' || e.prefix === 'xmlns';
  } else {
    return false;
  }
}

export function isNSResolver(r: any): r is XPathNSResolver {
  return r != null && r.lookupNamespaceURI !== undefined;
}
