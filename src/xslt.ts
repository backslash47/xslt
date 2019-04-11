import * as he from 'he';
import {
  domAppendChild,
  domCreateCDATASection,
  domCreateComment,
  domCreateDocumentFragment,
  domCreateElement,
  domCreateTextNode,
  domGetAttribute,
  domSetAttribute
} from './utils/dom';
import {
  isAttribute,
  isCData,
  isComment,
  isDocument,
  isElement,
  isFragment,
  isProcessingInstruction,
  isText
} from './utils/types';
import { xmlOwnerDocument, xmlValue } from './utils/xml';
import { convertResult, gatherNodes, isResultNodeSet, xpathSort, XPathSort } from './utils/xpath';
import { XSLTContext } from './xslt-context';

// tslint:disable:prefer-for-of

// The main entry point of the XSL-T processor, as explained above.
//
// @param input The input document root, as XPath ExprContext.
// @param template The stylesheet document root, as DOM node.
// @param the root of the generated output, as DOM node.

export function xsltProcessContext(input: XSLTContext, template: Node, output: Node) {
  const outputDocument = xmlOwnerDocument(output);

  const nodename = template.nodeName.split(/:/);
  if (nodename.length === 1 || nodename[0] !== 'xsl') {
    xsltPassThrough(input, template, output, outputDocument);
  } else {
    // let name: string;
    // let top: Element;
    // let nameexpr: string;
    // let node: Node;
    // let select: string;
    // let value: XPathResult;
    // let nodes: Node[];
    // let sortContext;
    // let mode: string;
    // let templates: Element[];
    // let paramContext;
    // let commentData: string;
    // let commentNode: Comment;
    // let test: string;
    // let match: string;
    // let text: string;

    switch (nodename[1]) {
      case 'apply-imports': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'apply-templates': {
        const select = xmlGetAttribute(template, 'select');
        let nodes: Node[];
        if (select) {
          nodes = gatherNodes(input.eval(select));
        } else {
          nodes = Array.from(input.node.childNodes);
        }

        const sortContext = input.clone(nodes[0], input.rootNode, 0, nodes);
        xsltWithParam(sortContext, template);
        xsltSort(sortContext, template);

        const mode = xmlGetAttribute(template, 'mode');
        const top = template.ownerDocument!.documentElement;
        const templates: Element[] = [];
        for (let i = 0; i < top.childNodes.length; ++i) {
          const c = top.childNodes[i];
          if (isElement(c) && c.nodeName === 'xsl:template' && (!mode || c.getAttribute('mode') === mode)) {
            templates.push(c);
          }
        }
        for (let j = 0; j < sortContext.contextSize(); ++j) {
          const nj = sortContext.nodeList[j];
          for (let i = 0; i < templates.length; ++i) {
            xsltProcessContext(sortContext.clone(nj, sortContext.rootNode, j), templates[i], output);
          }
        }
        break;
      }
      case 'attribute': {
        const nameexpr = xmlGetAttribute(template, 'name');
        const name = xsltAttributeValue(nameexpr, input);
        const node = domCreateDocumentFragment(outputDocument);
        xsltChildNodes(input, template, node);
        const v = xmlValue(node);

        if (isElement(output)) {
          domSetAttribute(output, name, v);
        } else {
          throw new Error('Can not set attribute on non-element node.');
        }

        break;
      }
      case 'attribute-set': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'call-template': {
        const name = xmlGetAttribute(template, 'name');
        const top = template.ownerDocument!.documentElement;

        const paramContext = input.clone();
        xsltWithParam(paramContext, template);

        for (let i = 0; i < top.childNodes.length; ++i) {
          const c = top.childNodes[i];
          if (isElement(c) && c.nodeName === 'xsl:template' && domGetAttribute(c, 'name') === name) {
            xsltChildNodes(paramContext, c, output);
            break;
          }
        }
        break;
      }
      case 'choose': {
        xsltChoose(input, template, output);
        break;
      }
      case 'comment': {
        const node = domCreateDocumentFragment(outputDocument);
        xsltChildNodes(input, template, node);
        const commentData = xmlValue(node);
        const commentNode = domCreateComment(outputDocument, commentData);
        output.appendChild(commentNode);
        break;
      }
      case 'copy': {
        const node = xsltCopy(output, input.node, outputDocument);
        if (node !== undefined) {
          xsltChildNodes(input, template, node);
        }
        break;
      }
      case 'copy-of': {
        const select = xmlGetAttribute(template, 'select');
        const value = input.eval(select);
        if (isResultNodeSet(value)) {
          const nodes = gatherNodes(value);
          for (let i = 0; i < nodes.length; ++i) {
            xsltCopyOf(output, nodes[i], outputDocument);
          }
        } else {
          const node = domCreateTextNode(outputDocument, value.stringValue);
          domAppendChild(output, node);
        }
        break;
      }
      case 'decimal-format': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'element': {
        const nameexpr = xmlGetAttribute(template, 'name');
        const name = xsltAttributeValue(nameexpr, input);
        const node = domCreateElement(outputDocument, name);
        domAppendChild(output, node);
        xsltChildNodes(input, template, node);
        break;
      }
      case 'fallback': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'for-each': {
        xsltForEach(input, template, output);
        break;
      }
      case 'if': {
        const test = xmlGetAttribute(template, 'test');
        if (input.eval(test).booleanValue) {
          xsltChildNodes(input, template, output);
        }
        break;
      }
      case 'import': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'include': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'key': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'message': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'namespace-alias': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'number': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'otherwise': {
        throw new Error(`error if here: ${nodename[1]}`);
      }
      case 'output': {
        // Ignored. -- Since we operate on the DOM, and all further use
        // of the output of the XSL transformation is determined by the
        // browser that we run in, this parameter is not applicable to
        // this implementation.
        break;
      }
      case 'preserve-space': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'processing-instruction': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'sort': {
        // just ignore -- was handled by xsltSort()
        break;
      }
      case 'strip-space': {
        throw new Error(`not implemented: ${nodename[1]}`);
      }
      case 'stylesheet':
      case 'transform': {
        xsltChildNodes(input, template, output);
        break;
      }
      case 'template': {
        const match = xmlGetAttribute(template, 'match');
        if (match && xsltMatch(match, input)) {
          xsltChildNodes(input, template, output);
        }
        break;
      }
      case 'text': {
        const text = xmlValue(template);
        const node = domCreateTextNode(outputDocument, text);
        output.appendChild(node);
        break;
      }
      case 'value-of': {
        const select = xmlGetAttribute(template, 'select');
        const value = input.eval(select);
        const node = domCreateTextNode(outputDocument, value.stringValue);
        output.appendChild(node);
        break;
      }
      case 'param': {
        xsltVariable(input, template, false);
        break;
      }
      case 'variable': {
        xsltVariable(input, template, true);
        break;
      }
      case 'when': {
        throw new Error(`error if here: ${nodename[1]}`);
      }
      case 'with-param': {
        throw new Error(`error if here: ${nodename[1]}`);
      }
      default: {
        throw new Error(`error if here: ${nodename[1]}`);
      }
    }
  }
}

// Sets parameters defined by xsl:with-param child nodes of the
// current template node, in the current input context. This happens
// before the operation specified by the current template node is
// executed.

function xsltWithParam(input: XSLTContext, template: Node) {
  for (const c of Array.from(template.childNodes)) {
    if (isElement(c) && c.nodeName === 'xsl:with-param') {
      xsltVariable(input, c, true);
    }
  }
}

// Orders the current node list in the input context according to the
// sort order specified by xsl:sort child nodes of the current
// template node. This happens before the operation specified by the
// current template node is executed.
//
// TODO(mesch): case-order is not implemented.

function xsltSort(input: XSLTContext, template: Node) {
  const sort: XPathSort[] = [];

  for (const c of Array.from(template.childNodes)) {
    if (isElement(c) && c.nodeName === 'xsl:sort') {
      const select = xmlGetAttribute(c, 'select');
      const type = xmlGetAttribute(c, 'data-type') || 'text';
      const order = xmlGetAttribute(c, 'order') || 'ascending';

      sort.push({
        expr: select,
        type,
        order
      });
    }
  }

  xpathSort(input, sort);
}

// Evaluates a variable or parameter and set it in the current input
// context. Implements xsl:variable, xsl:param, and xsl:with-param.
//
// @param override flag that defines if the value computed here
// overrides the one already in the input context if that is the
// case. I.e. decides if this is a default value or a local
// value. xsl:variable and xsl:with-param override; xsl:param doesn't.

function xsltVariable(input: XSLTContext, template: Node, override: boolean) {
  const name = xmlGetAttribute(template, 'name');
  const select = xmlGetAttribute(template, 'select');

  let value: string | number | boolean | Node[];

  if (template.childNodes.length > 0) {
    const root = domCreateDocumentFragment(template.ownerDocument!);
    xsltChildNodes(input, template, root);
    value = [root];
  } else if (select) {
    value = convertResult(input.eval(select));
  } else {
    value = '';
  }

  if (override || !input.getVariable(name)) {
    input.setVariable(name, value);
  }
}

// Implements xsl:chose and its child nodes xsl:when and
// xsl:otherwise.

function xsltChoose(input: XSLTContext, template: Node, output: Node) {
  for (const childNode of Array.from(template.childNodes)) {
    if (!isElement(childNode)) {
      continue;
    } else if (childNode.nodeName === 'xsl:when') {
      const test = xmlGetAttribute(childNode, 'test');
      if (input.eval(test).booleanValue) {
        xsltChildNodes(input, childNode, output);
        break;
      }
    } else if (childNode.nodeName === 'xsl:otherwise') {
      xsltChildNodes(input, childNode, output);
      break;
    }
  }
}

// Implements xsl:for-each.

function xsltForEach(input: XSLTContext, template: Node, output: Node) {
  const select = xmlGetAttribute(template, 'select');
  const nodes = gatherNodes(input.eval(select));
  const sortContext = input.clone(nodes[0], input.rootNode, 0, nodes);
  xsltSort(sortContext, template);
  for (let i = 0; i < sortContext.contextSize(); ++i) {
    const ni = sortContext.nodeList[i];
    xsltChildNodes(sortContext.clone(ni, input.rootNode, i), template, output);
  }
}

// Traverses the template node tree. Calls the main processing
// function with the current input context for every child node of the
// current template node.

function xsltChildNodes(input: XSLTContext, template: Node, output: Node) {
  // Clone input context to keep variables declared here local to the
  // siblings of the children.
  const context = input.clone();
  for (let i = 0; i < template.childNodes.length; ++i) {
    if (isXmlDeclaration(template.childNodes[i])) {
      continue;
    }
    xsltProcessContext(context, template.childNodes[i], output);
  }
}

// Passes template text to the output. The current template node does
// not specify an XSL-T operation and therefore is appended to the
// output with all its attributes. Then continues traversing the
// template node tree.

function xsltPassThrough(input: XSLTContext, template: Node, output: Node, outputDocument: Document) {
  if (isText(template)) {
    if (xsltPassText(template)) {
      const node = domCreateTextNode(outputDocument, template.nodeValue!);
      domAppendChild(output, node);
    }
  } else if (isElement(template)) {
    const node = domCreateElement(outputDocument, template.nodeName);

    for (const a of Array.from(template.attributes)) {
      if (a) {
        const name = a.nodeName;
        const value = xsltAttributeValue(a.nodeValue!, input);
        domSetAttribute(node, name, value);
      }
    }

    domAppendChild(output, node);
    xsltChildNodes(input, template, node);
  } else {
    // This applies also to the DOCUMENT_NODE of the XSL stylesheet,
    // so we don't have to treat it specially.
    xsltChildNodes(input, template, output);
  }
}

// Determines if a text node in the XSLT template document is to be
// stripped according to XSLT whitespace stipping rules.
//
// See [XSLT], section 3.4.
//
// TODO(mesch): Whitespace stripping on the input document is
// currently not implemented.

function xsltPassText(template: Node) {
  if (!template.nodeValue!.match(/^\s*$/)) {
    return true;
  }

  let element = template.parentNode!;
  if (element.nodeName === 'xsl:text') {
    return true;
  }

  while (element && isElement(element)) {
    const xmlspace = domGetAttribute(element, 'xml:space');
    if (xmlspace) {
      if (xmlspace === 'default') {
        return false;
      } else if (xmlspace === 'preserve') {
        return true;
      }
    }

    element = element.parentNode!;
  }

  return false;
}

// Evaluates an XSL-T attribute value template. Attribute value
// templates are attributes on XSL-T elements that contain XPath
// expressions in braces {}. The XSL-T expressions are evaluated in
// the current input context.

function xsltAttributeValue(value: string, context: XSLTContext) {
  const parts = value.split('{');
  if (parts.length === 1) {
    return value;
  }

  let ret = '';
  for (let i = 0; i < parts.length; ++i) {
    const rp = parts[i].split('}');
    if (rp.length !== 2) {
      // first literal part of the value
      ret += parts[i];
      continue;
    }

    const val = context.eval(rp[0]).stringValue;
    ret += val + rp[1];
  }

  return ret;
}

// Wrapper function to access attribute values of template element
// nodes. Currently this calls he.decode because in some DOM
// implementations the return value of node.getAttributeValue()
// contains unresolved XML entities, although the DOM spec requires
// that entity references are resolved by te DOM.
function xmlGetAttribute(node: Node, name: string) {
  // TODO(mesch): This should not be necessary if the DOM is working
  // correctly. The DOM is responsible for resolving entities, not the
  // application.
  if (isElement(node)) {
    const value = domGetAttribute(node, name);
    if (value != null) {
      return he.decode(value);
    } else {
      return '';
    }
  } else {
    throw new Error('Can not get attribute from non-Element node');
  }
}

/**
 * Implements xsl:copy-of for node-set values of the select
 * expression. Recurses down the source node tree, which is part of
 * the input document.
 * @param dst the node being copied to, part of output document,
 * @param src the node being copied, part in input document,
 * @param dstDocument
 */
function xsltCopyOf(dst: Node, src: Node, dstDocument: Document) {
  if (isFragment(src) || isDocument(src)) {
    for (let i = 0; i < src.childNodes.length; ++i) {
      xsltCopyOf(dst, src.childNodes[i], dstDocument);
    }
  } else if (isElement(src)) {
    const node = xsltCopy(dst, src, dstDocument);
    if (node !== undefined) {
      // This was an element node -- recurse to attributes and
      // children.
      for (let i = 0; i < src.attributes.length; ++i) {
        xsltCopyOf(node, src.attributes[i], dstDocument);
      }

      for (let i = 0; i < src.childNodes.length; ++i) {
        xsltCopyOf(node, src.childNodes[i], dstDocument);
      }
    }
  }
}

/**
 * Implements xsl:copy for all node types.
 * @param dst the node being copied to, part of output document,
 * @param src the node being copied, part in input document,
 * @param dstDocument
 * @return If an element node was created, the element
 * node. Otherwise undefined.
 */
function xsltCopy(dst: Node, src: Node, dstDocument: Document) {
  if (isElement(src)) {
    const node = domCreateElement(dstDocument, src.nodeName);
    domAppendChild(dst, node);
    return node;
  }

  if (isText(src)) {
    const node = domCreateTextNode(dstDocument, src.nodeValue!);
    domAppendChild(dst, node);
  } else if (isCData(src)) {
    const node = domCreateCDATASection(dstDocument, src.nodeValue!);
    domAppendChild(dst, node);
  } else if (isComment(src)) {
    const node = domCreateComment(dstDocument, src.nodeValue!);
    domAppendChild(dst, node);
  } else if (isAttribute(src)) {
    if (isElement(dst)) {
      domSetAttribute(dst, src.nodeName, src.nodeValue!);
    } else {
      throw new Error('Can not set attribute to non-element node.');
    }
  }

  return undefined;
}

// Evaluates an XPath expression in the current input context as a
// match (see [XSLT] section 5.2, paragraph 1).
function xsltMatch(match: string, context: XSLTContext) {
  let ret;

  ret = false;
  let node: Node | null = context.node;

  while (!ret && node) {
    const cloned = context.clone(node, context.rootNode, 0, [node]);
    const result = gatherNodes(cloned.eval(match));
    for (let i = 0; i < result.length; ++i) {
      if (result[i] === context.node) {
        ret = true;
        break;
      }
    }
    node = node.parentNode;
  }

  return ret;
}

function isXmlDeclaration(node: Node) {
  if (isProcessingInstruction(node)) {
    return node.target.startsWith('xml');
  } else {
    return false;
  }
}
