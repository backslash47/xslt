let _dom: DOMImplementation;
let _parser: DOMParser;
let _serializer: XMLSerializer;

export function getParser() {
  if (_parser === undefined) {
    throw new Error('No DOM implementation was provided.');
  }

  return _parser;
}

export function getSerializer() {
  if (_serializer === undefined) {
    throw new Error('No DOM implementation was provided.');
  }

  return _serializer;
}

export function getDom() {
  if (_dom === undefined) {
    throw new Error('No DOM implementation was provided.');
  }

  return _dom;
}

export function install(parser: DOMParser, serializer: XMLSerializer, dom: DOMImplementation) {
  _parser = parser;
  _serializer = serializer;
  _dom = dom;
}
