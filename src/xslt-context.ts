import { convertValue, XPathEvaluator } from 'xpath-ts';

export type Variable = string | number | boolean | Node | Node[];

export interface Options {
  node: Node;
  rootNode: Node;
  position?: number;
  nodeList?: Node[];
  parent?: XSLTContext;
  returnOnFirstMatch?: boolean;
  caseInsensitive?: boolean;
  variables?: Map<string, Variable>;
}

export class XSLTContext {
  node: Node;
  rootNode: Node;
  nodeList: Node[];
  position: number;
  parent?: XSLTContext;
  variables: Map<string, Variable>;
  returnOnFirstMatch: boolean;
  caseInsensitive: boolean;

  constructor({
    node,
    rootNode,
    position = 0,
    nodeList = [node],
    parent,
    returnOnFirstMatch = false,
    caseInsensitive = false,
    variables = new Map()
  }: Options) {
    this.node = node;
    this.rootNode = rootNode;
    this.parent = parent;
    this.nodeList = nodeList;
    this.position = position;
    this.variables = variables;
    this.returnOnFirstMatch = returnOnFirstMatch;
    this.caseInsensitive = caseInsensitive;
  }

  clone(
    node: Node = this.node,
    rootNode: Node = this.rootNode,
    position: number = this.position,
    nodeList: Node[] = this.nodeList
  ) {
    return new XSLTContext({
      node,
      rootNode,
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

    const expression = evaluator.createExpression(select, null);
    expression.context.virtualRoot = this.rootNode;

    const result = expression.evaluate(this.node, type, null);
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
