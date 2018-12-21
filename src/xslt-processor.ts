import { getDom } from './install';
import { domCreateDocumentFragment } from './utils/dom';
import { xsltProcessContext } from './xslt';
import { Variable, XSLTContext } from './xslt-context';

export class XSLTProcessorImpl implements XSLTProcessor {
  variables: Map<string, Variable>;
  stylesheet?: Node;

  constructor() {
    this.variables = new Map();
  }

  clearParameters() {
    this.variables.clear();
  }
  getParameter(_namespaceURI: string, localName: string) {
    return this.variables.get(localName);
  }
  importStylesheet(style: Node): void {
    this.stylesheet = style;
  }
  removeParameter(_namespaceURI: string, localName: string): void {
    this.variables.delete(localName);
  }
  reset(): void {
    this.stylesheet = undefined;
  }
  setParameter(_namespaceURI: string, localName: string, value: any) {
    this.variables.set(localName, value);
  }
  transformToDocument(source: Node): Document {
    if (this.stylesheet === undefined) {
      throw new Error('No XSL stylesheet was given');
    }

    const output = getDom().createDocument(null, null, null);
    const fragment = domCreateDocumentFragment(output);
    const context = new XSLTContext({ node: source, variables: this.variables });
    xsltProcessContext(context, this.stylesheet, fragment);

    return output;
  }
  transformToFragment(source: Node, document: Document): DocumentFragment {
    if (this.stylesheet === undefined) {
      throw new Error('No XSL stylesheet was given');
    }

    const output = domCreateDocumentFragment(document);
    const context = new XSLTContext({ node: source, variables: this.variables });
    xsltProcessContext(context, this.stylesheet, output);

    return output;
  }
}
