import { getParser } from '../src/dom';

export function xmlParse(xml: string) {
  const parser = getParser();
  return parser.parseFromString(xml, 'text/xml');
}
