# XSLT library

XSLT 1.0 implementation for browser and Node.js environment based on [xpath-ts](https://github.com/backslash47/xpath) library.

## Requirements

- [Node v11.x or greater](https://nodejs.org/en/download/)

## Release Notes

See [CHANGELOG.md](CHANGELOG.md)

## Usage

Install with [npm](http://github.com/isaacs/npm):

```
npm install xslt-ts
```

This library is xml engine agnostic but I recommend to use [xmldom-ts](https://github.com/backslash47/xmldom), [xmldom](https://github.com/jindw/xmldom) or [jsdom](https://github.com/jsdom/jsdom)

```
npm install xmldom-ts
```
or 

```
npm install xmldom
```

or

```
npm install jsdom
```

## simple usage:

```typescript
import { DOMImplementationImpl, DOMParserImpl, XMLSerializerImpl } from 'xmldom-ts';
import { install, xsltProcess, xmlParse } from 'xslt-ts';

// xmlString: string of xml file contents
// xsltString: string of xslt file contents
// outXmlString: output xml string.
install(new DOMParserImpl(), new XMLSerializerImpl(), new DOMImplementationImpl());
const outXmlString = xsltProcess(xmlParse(xmlString), xmlParse(xsltString));
```

## another type of usage:

```typescript
import { DOMImplementationImpl, DOMParserImpl, XMLSerializerImpl } from 'xmldom-ts';
import { install, XSLTProcessor } from 'xslt-ts';

// xmlString: string of xml file contents
// xsltString: string of xslt file contents
// output: output DOM model
install(new DOMParserImpl(), new XMLSerializerImpl(), new DOMImplementationImpl());
const processor = new XSLTProcessorImpl();

processor.importStylesheet(xmlParse(xsltString));
const output = processor.transformToDocument(xmlParse(xmlString));
```

## Introduction

This library contains an implementation of XSLT in TypeScript. Because XSLT uses
XPath, it uses compatible XPath implementation [xpath-ts](https://github.com/backslash47/xpath) which can be used
independently of XSLT. This implementation has the advantage that it
makes XSLT uniformly available whenever the browser's native XSLTProcessor()
is not available such as in node.js or in web workers.

XSLT-processor builds on Google's [AJAXSLT](https://github.com/4031651/ajaxslt)
which was written before XSLTProcessor() became available in browsers, but the
code base has been updated to comply with ES2015+ and to make it work outside of
browsers.

This implementation of XSLT operates at the DOM level on its input
documents. It internally uses a DOM implementation to create the
output document, but usually returns the output document as text
stream. The DOM to construct the output document must be supplied by
the application. [xmldom](https://github.com/jindw/xmldom)
and [jsdom](https://github.com/jsdom/jsdom) are tested.

## Conformance

A few features that are required by the XSLT and XPath standards were left out (but patches to add them are welcome).
See our [TODO](TODO.md) for a list of missing features that we are aware of (please add more items by means of PRs).

Issues are also marked in the source code using throw-statements.

The implementation is all agnostic about namespaces. It just expects
XSLT elements to have tags that carry the xsl: prefix, but we
disregard all namespace declaration for them.

## Developing and Testing

#### Download

```
git clone 'https://github.com/backslash47/xslt-ts'
cd xslt-ts
```

#### Install

```
npm install
```

#### Build

```
npm run build
```

You will get the transpiled code under '/dist/lib' and typings under '/dist/types'.

#### Test

Run standard tests with Mocha + Chai testing framework

```
npm test
```

## Authors

- **Google Inc.** - _Initial work_ ajaxslt project
- **Johannes Wilm** - _ES2015+ rewrite_ [Fiduswriter](https://github.com/fiduswriter)
- **Matus Zamborsky** - _TypeScript rewrite_ - [Backslash47](https://github.com/backslash47)

## References

- XPath Specification http://www.w3.org/TR/1999/REC-xpath-19991116

- XSLT Specification http://www.w3.org/TR/1999/REC-xslt-19991116

- W3C DOM Level 3 Core Specification http://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/

- ECMAScript Language Specification http://www.ecma-international.org/publications/standards/Ecma-262.htm

## Licence

The original sources of **ajaxslt** projects are licenced under BSD-3 clause [AJAXSLT-LICENCE.md](AJAXSLT-LICENCE.md). Modification made after are licenced with GNU Lesser General Public License v3.0 - see the [LICENCE.md](LICENCE.md) file for details.
