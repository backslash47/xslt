import { expect } from 'chai';
import { xsltProcess } from '../src/xslt';
import { xmlParse } from './utils';

// tslint:disable:max-line-length
// tslint:disable:quotemark
// tslint:disable:no-unused-expression

export function executeTests() {
  describe('simple', () => {
    it('simple test', () => {
      const xmlString =
        '<root>' +
        '<test name="test1" />' +
        '<test name="test2" />' +
        '<test name="test3" />' +
        '<test name="test4" />' +
        '</root>';

      const xsltString =
        '<?xml version="1.0"?>' +
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">' +
        '<xsl:template match="test">' +
        '<span> <xsl:value-of select="@name" /> </span>' +
        '</xsl:template>' +
        '<xsl:template match="/">' +
        '<div>' +
        '<xsl:apply-templates select="//test" />' +
        '</div>' +
        '</xsl:template>' +
        '</xsl:stylesheet>';

      const expectedOutString =
        '<div>' + '<span>test1</span>' + '<span>test2</span>' + '<span>test3</span>' + '<span>test4</span>' + '</div>';

      const outXmlString = xsltProcess(xmlParse(xmlString), xmlParse(xsltString));

      expect(outXmlString).to.equal(expectedOutString);
    });
  });
}
