import { getDom } from './install';
import { xmlText } from './utils/xml';
import { XSLTProcessorImpl } from './xslt-processor';

// The exported entry point of the XSL-T processor, as explained
// above.
//
// @param xmlDoc The input document root, as DOM node.
// @param template The stylesheet document root, as DOM node.
// @return the processed document, as XML text in a string.
export function xsltProcess(xmlDoc: Node, stylesheet: Node) {
  const processor = new XSLTProcessorImpl();

  processor.importStylesheet(stylesheet);

  const document = getDom().createDocument(null, null, null);
  const output = processor.transformToFragment(xmlDoc, document);

  const ret = xmlText(output);
  return ret;
}
