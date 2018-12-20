import { XPathEvaluator, convertValue } from 'xpath-ts';

// tslint:disable:prefer-for-of

export type Variable = string | number | boolean | Node | Node[];

export interface Options {
  node: Node;
  position?: number;
  nodeList?: Node[];
  parent?: XSLTContext;
  returnOnFirstMatch?: boolean;
  caseInsensitive?: boolean;
}

export class XSLTContext {
  node: Node;
  nodeList: Node[];
  position: number;
  parent?: XSLTContext;
  variables: Map<string, Variable>;
  returnOnFirstMatch: boolean;
  caseInsensitive: boolean;

  constructor({
    node,
    position = 0,
    nodeList = [node],
    parent,
    returnOnFirstMatch = false,
    caseInsensitive = false
  }: Options) {
    this.node = node;
    this.parent = parent;
    this.nodeList = nodeList;
    this.position = position;
    this.variables = new Map();
    this.returnOnFirstMatch = returnOnFirstMatch;
    this.caseInsensitive = caseInsensitive;
  }

  clone(node: Node = this.node, position: number = this.position, nodeList: Node[] = this.nodeList) {
    return new XSLTContext({
      node,
      position,
      nodeList,
      parent: this
    });
  }

  contextSize() {
    return this.nodeList.length;
  }

  setVariable(name: string, value: Variable) {
    this.variables.set(name, value);
  }

  getVariable(name: string): Variable | undefined {
    const value = this.variables.get(name);

    if (value !== undefined) {
      return value;
    } else if (this.parent !== undefined) {
      return this.parent.getVariable(name);
    } else {
      return undefined;
    }
  }

  eval(select: string, type: number = 0) {
    const evaluator = new XPathEvaluator({
      vr: {
        getVariable: (ln) => {
          const val = this.getVariable(ln);

          if (val === undefined) {
            return null;
          } else {
            return convertValue(val);
          }
        }
      }
    });

    const result = evaluator.evaluate(select, this.node, null, type, null);

    return result;
  }

  setNode(position: number) {
    this.node = this.nodeList[position];
    this.position = position;
  }

  setReturnOnFirstMatch(returnOnFirstMatch: boolean) {
    this.returnOnFirstMatch = returnOnFirstMatch;
  }

  setCaseInsensitive(caseInsensitive: boolean) {
    this.caseInsensitive = caseInsensitive;
  }
}

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

export interface XSLTSort {
  expr: string;
  type: string;
  order: string;
}

interface XSLTSortItem {
  node: Node;
  key: XSLTSortItemKey[];
}

interface XSLTSortItemKey {
  value: string | number;
  order: string;
}

// Utility function to sort a list of nodes. Used by xsltSort() and
// nxslSelect().
export function xpathSort(input: XSLTContext, sort: XSLTSort[]) {
  if (sort.length === 0) {
    return;
  }

  const sortlist = [];

  for (let i = 0; i < input.contextSize(); ++i) {
    const node = input.nodeList[i];
    const sortitem: XSLTSortItem = {
      node,
      key: []
    };
    const context = input.clone(node, 0, [node]);

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
function xpathSortByKey(v1: XSLTSortItem, v2: XSLTSortItem) {
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
