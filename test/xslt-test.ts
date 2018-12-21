import { expect } from 'chai';
import { xsltProcess } from '../src/api';
import { xmlParse } from './utils';

// tslint:disable:max-line-length
// tslint:disable:quotemark
// tslint:disable:no-unused-expression

const xmlString = '<all>' + '<item pos="2">A</item>' + '<item pos="3">B</item>' + '<item pos="1">C</item>' + '</all>';

export function executeTests() {
  describe('complex tests', () => {
    it('handles for-each sort', () => {
      const xsltForEachSort =
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:template match="/">' +
        '<xsl:for-each select="//item">' +
        '<xsl:sort select="@pos"/>' +
        '<xsl:value-of select="."/>' +
        '</xsl:for-each>' +
        '</xsl:template>' +
        '</xsl:stylesheet>';

      const xml = xmlParse(xmlString);
      const xslt = xmlParse(xsltForEachSort);
      const html = xsltProcess(xml, xslt);

      expect(html).to.equal('CAB');
    });

    it('handles for-each sort ascending', () => {
      const xsltForEachSortAscending =
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:template match="/">' +
        '<xsl:for-each select="//item">' +
        '<xsl:sort select="." order="ascending"/>' +
        '<xsl:value-of select="."/>' +
        '</xsl:for-each>' +
        '</xsl:template>' +
        '</xsl:stylesheet>';

      const xml = xmlParse(xmlString);
      const xslt = xmlParse(xsltForEachSortAscending);
      const html = xsltProcess(xml, xslt);

      expect(html).to.equal('ABC');
    });

    it('handles for-each sort descending', () => {
      const xsltForEachSortDescending =
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:template match="/">' +
        '<xsl:for-each select="//item">' +
        '<xsl:sort select="." order="descending"/>' +
        '<xsl:value-of select="."/>' +
        '</xsl:for-each>' +
        '</xsl:template>' +
        '</xsl:stylesheet>';

      const xml = xmlParse(xmlString);
      const xslt = xmlParse(xsltForEachSortDescending);
      const html = xsltProcess(xml, xslt);

      expect(html).to.equal('CBA');
    });

    it('applies templates', () => {
      const xmlApplyTemplates =
        '<all>' + '<item type="X">A</item>' + '<item type="Y">B</item>' + '<item type="X">C</item>' + '</all>';

      const xsltApplyTemplates =
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:template match="/">' +
        '<xsl:apply-templates select="//item"/>' +
        '</xsl:template>' +
        '<xsl:template match="item[@type=\'X\']">' +
        '<xsl:value-of select="."/>' +
        '</xsl:template>' +
        '<xsl:template match="item[@type=\'Y\']">' +
        '<xsl:value-of select="."/>' +
        '</xsl:template>' +
        '</xsl:stylesheet>';

      const xml = xmlParse(xmlApplyTemplates);
      const xslt = xmlParse(xsltApplyTemplates);
      const html = xsltProcess(xml, xslt);

      expect(html).to.equal('ABC');
    });

    it('handles global variables', () => {
      const xsltGlobalVariables =
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:variable name="x" select="\'x\'"/>' +
        '<xsl:variable name="y" select="\'y\'"/>' +
        '<xsl:variable name="z">' +
        '<xsl:text>z</xsl:text>' +
        '</xsl:variable>' +
        '<xsl:template match="/">' +
        '<xsl:value-of select="$x"/>' +
        '<xsl:value-of select="$z"/>' +
        '<xsl:for-each select="//item">' +
        '<xsl:value-of select="$y"/>' +
        '</xsl:for-each>' +
        '</xsl:template>' +
        '</xsl:stylesheet>';

      const xml = xmlParse(xmlString);
      const xslt = xmlParse(xsltGlobalVariables);
      const html = xsltProcess(xml, xslt);

      expect(html).to.equal('xzyyy');
    });

    it('handles top level output', () => {
      const xsltTopLevelOutput =
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:template match="/">' +
        '<xsl:element name="x">' +
        '<xsl:attribute name="y">' +
        '<xsl:text>z</xsl:text>' +
        '</xsl:attribute>' +
        '<xsl:text>k</xsl:text>' +
        '</xsl:element>' +
        '</xsl:template>' +
        '</xsl:stylesheet>';

      const xml = xmlParse(xmlString);
      const xslt = xmlParse(xsltTopLevelOutput);
      const html = xsltProcess(xml, xslt);

      expect(html).to.equal('<x y="z">k</x>');
    });

    it('handles copy', () => {
      const xsltCopy =
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:template match="/">' +
        '<xsl:for-each select="//item">' +
        '<xsl:copy>' +
        '<xsl:for-each select="@*|node()">' +
        '<xsl:copy/>' +
        '</xsl:for-each>' +
        '</xsl:copy>' +
        '</xsl:for-each>' +
        '</xsl:template>' +
        '</xsl:stylesheet>';

      const xml = xmlParse(xmlString);
      const xslt = xmlParse(xsltCopy);
      const html = xsltProcess(xml, xslt);

      expect(html).to.equal('<item pos="2">A</item>' + '<item pos="3">B</item>' + '<item pos="1">C</item>');
    });
  });
}
