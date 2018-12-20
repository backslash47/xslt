import { DOMImplementation, DOMParser, XMLSerializer } from 'xmldom';
import { install } from '../src';
import { executeTests as escapeTests } from './escape-test';
import { executeTests as simpleTests } from './simple-test';
import { executeTests as xpathTests } from './xpath-test';
import { executeTests as xsltTests } from './xslt-test';

// tslint:disable:variable-name

describe('xmldom', async () => {
  before(() => {
    install(new DOMParser(), new XMLSerializer(), new DOMImplementation());
  });

  escapeTests();
  xpathTests();
  simpleTests();
  xsltTests();
});
