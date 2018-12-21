import { expect } from 'chai';
import { xmlText } from '../src/utils/xml';
import { xmlParse } from './utils';
// tslint:disable:max-line-length
// tslint:disable:quotemark
// tslint:disable:no-unused-expression

export function executeTests(isJSDOM: boolean = false) {
  describe('Escape tests', () => {
    it('accepts already escaped ampersand', () => {
      const xmlString = '<root>Fish&amp;pie</root>';

      const outXmlString = xmlText(xmlParse(xmlString));

      expect(outXmlString).to.equal(xmlString);
    });

    if (!isJSDOM) {
      it('escapes non-escaped ampersand', () => {
        const xmlString = '<root>Fish&pie</root>';

        const outXmlString = xmlText(xmlParse(xmlString));

        expect(outXmlString).to.equal('<root>Fish&amp;pie</root>');
      });
    }

    it('accepts non-escaped ">" between elements', () => {
      const xmlString = '<root>Fish>pie</root>';

      const outXmlString = xmlText(xmlParse(xmlString));

      expect(outXmlString).to.equal('<root>Fish&gt;pie</root>');
    });

    it('accepts non-escaped "\'" between elements', () => {
      const xmlString = "<root>Fish'pie</root>";

      const outXmlString = xmlText(xmlParse(xmlString));

      expect(outXmlString).to.equal("<root>Fish'pie</root>");
    });

    it("accepts non-escaped '\"' between elements", () => {
      const xmlString = '<root>Fish"pie</root>';

      const outXmlString = xmlText(xmlParse(xmlString));

      expect(outXmlString).to.equal('<root>Fish"pie</root>');
    });

    it('accepts non-escaped ">" in attributes', () => {
      const xmlString = '<root dish="eat>hunger">Fish</root>';

      const outXmlString = xmlText(xmlParse(xmlString));

      expect(outXmlString).to.equal('<root dish="eat&gt;hunger">Fish</root>');
    });

    it('accepts non-escaped "\'" in attributes', () => {
      const xmlString = '<root dish="eat\'hunger">Fish</root>';

      const outXmlString = xmlText(xmlParse(xmlString));

      expect(outXmlString).to.equal('<root dish="eat\'hunger">Fish</root>');
    });

    it("accepts non-escaped '\"' in attributes", () => {
      const xmlString = "<root dish='eat\"hunger'>Fish</root>";
      const outXmlString = xmlText(xmlParse(xmlString));

      expect(outXmlString).to.equal('<root dish="eat&quot;hunger">Fish</root>');
    });
  });
}
