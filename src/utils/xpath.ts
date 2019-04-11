import { XSLTContext } from '../xslt-context';

// tslint:disable:prefer-for-of

export function convertResult(result: XPathResult) {
  const type = result.resultType;

  if (type === result.STRING_TYPE) {
    return result.stringValue;
  } else if (type === result.NUMBER_TYPE) {
    return result.numberValue;
  } else if (type === result.BOOLEAN_TYPE) {
    return result.booleanValue;
  } else if (type === result.UNORDERED_NODE_ITERATOR_TYPE || type === result.ORDERED_NODE_ITERATOR_TYPE) {
    return gatherNodes(result);
  } else {
    throw new Error('Unsupported result type');
  }
}

export function isResultNodeSet(result: XPathResult) {
  const type = result.resultType;

  return type === result.UNORDERED_NODE_ITERATOR_TYPE || type === result.ORDERED_NODE_ITERATOR_TYPE;
}

export function gatherNodes(result: XPathResult) {
  if (result.resultType === result.ANY_UNORDERED_NODE_TYPE || result.resultType === result.FIRST_ORDERED_NODE_TYPE) {
    const node = result.singleNodeValue;

    if (node != null) {
      return [node];
    } else {
      return [];
    }
  }

  const nodes: Node[] = [];
  for (let node = result.iterateNext(); node != null; node = result.iterateNext()) {
    nodes.push(node);
  }

  return nodes;
}

export interface XPathSort {
  expr: string;
  type: string;
  order: string;
}

interface XPathSortItem {
  node: Node;
  key: XPathSortItemKey[];
}

interface XPathSortItemKey {
  value: string | number;
  order: string;
}

// Utility function to sort a list of nodes. Used by xsltSort() and
// nxslSelect().
export function xpathSort(input: XSLTContext, sort: XPathSort[]) {
  if (sort.length === 0) {
    return;
  }

  const sortlist = [];

  for (let i = 0; i < input.contextSize(); ++i) {
    const node = input.nodeList[i];
    const sortitem: XPathSortItem = {
      node,
      key: []
    };
    const context = input.clone(node, input.rootNode, 0, [node]);

    for (const s of sort) {
      const value = context.eval(s.expr);

      let evalue;
      if (s.type === 'text') {
        evalue = value.stringValue;
      } else if (s.type === 'number') {
        evalue = value.numberValue;
      } else {
        throw new Error('Unsupport sort type');
      }

      sortitem.key.push({
        value: evalue,
        order: s.order
      });
    }

    // Make the sort stable by adding a lowest priority sort by
    // id. This is very convenient and furthermore required by the
    // spec ([XSLT] - Section 10 Sorting).
    sortitem.key.push({
      value: i,
      order: 'ascending'
    });

    sortlist.push(sortitem);
  }

  sortlist.sort(xpathSortByKey);

  const nodes = [];
  for (let i = 0; i < sortlist.length; ++i) {
    nodes.push(sortlist[i].node);
  }
  input.nodeList = nodes;
  input.setNode(0);
}

// Sorts by all order criteria defined. According to the JavaScript
// spec ([ECMA] Section 11.8.5), the compare operators compare strings
// as strings and numbers as numbers.
//
// NOTE: In browsers which do not follow the spec, this breaks only in
// the case that numbers should be sorted as strings, which is very
// uncommon.
function xpathSortByKey(v1: XPathSortItem, v2: XPathSortItem) {
  // NOTE: Sort key vectors of different length never occur in
  // xsltSort.

  for (let i = 0; i < v1.key.length; ++i) {
    const o = v1.key[i].order === 'descending' ? -1 : 1;
    if (v1.key[i].value > v2.key[i].value) {
      return +1 * o;
    } else if (v1.key[i].value < v2.key[i].value) {
      return -1 * o;
    }
  }

  return 0;
}
