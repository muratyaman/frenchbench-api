import md5 from 'md5';
import { v4 } from 'uuid';

export const newUuid = () => v4();
export const hash = (str) => md5(str);

export function ts() {
  return (new Date()).toISOString();
}

export function log(...args) {
  console.log.call(null, ts(), ...args);
}
