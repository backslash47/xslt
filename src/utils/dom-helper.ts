// Wrapper around DOM methods so we can condense their invocations.
export function domGetAttribute(node: Element, name: string) {
  return node.getAttribute(name);
}

export function domSetAttribute(node: Element, name: string, value: string) {
  return node.setAttribute(name, value);
}

export function domAppendChild(node: Node, child: Node) {
  return node.appendChild(child);
}

export function domCreateTextNode(doc: Document, text: string) {
  return doc.createTextNode(text);
}

export function domCreateElement(doc: Document, name: string): Element {
  return doc.createElement(name);
}

export function domCreateCDATASection(doc: Document, data: string) {
  return doc.createCDATASection(data);
}

export function domCreateComment(doc: Document, text: string) {
  return doc.createComment(text);
}

export function domCreateDocumentFragment(doc: Document) {
  return doc.createDocumentFragment();
}
