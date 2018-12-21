import { getParser } from '../src/install';

export function xmlParse(xml: string) {
  const parser = getParser();
  return parser.parseFromString(xml, 'text/xml');
}
