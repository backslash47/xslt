import { JSDOM } from 'jsdom';
import { install } from '../src';
import { executeTests as escapeTests } from './escape-test';
import { executeTests as simpleTests } from './simple-test';
import { executeTests as xpathTests } from './xpath-test';
import { executeTests as xsltTests } from './xslt-test';

// tslint:disable:variable-name

declare module 'jsdom' {
  class DOMWindow {
    XMLSerializer: typeof XMLSerializer;
  }
}

describe('jsdom', async () => {
  before(() => {
    const jsdom = new JSDOM();
    install(new jsdom.window.DOMParser(), new jsdom.window.XMLSerializer(), jsdom.window.document.implementation);
  });

  escapeTests(true);
  xpathTests();
  simpleTests();
  xsltTests();
});
