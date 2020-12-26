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

export const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export function validateEmailAddress(s) {
  if (!s) return false;
  const st = '' + s;
  if (st === '') return false;
  if (emailPattern.test(st)) return true;
  return false;
}

export const LOWER_CASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
export const UPPER_CASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const DIGITS = '0123456789';
export const ALL_LETTERS_AND_DIGITS = LOWER_CASE_LETTERS + UPPER_CASE_LETTERS + DIGITS;

export function rndStr(len = 10, charList = ALL_LETTERS_AND_DIGITS) {
  let s = '', r = 0, c = '', listLen = charList.length;
  
  for (let i = 0; i < len; i++) {
    r = rndInt(listLen - 1);
    c = charList[i];
    s += c;
  }

  return s;
}

export function rndInt(max = 9999, min = 0) {
  return min + Math.round(Math.random() * (max - min));
}

export function rndEmailVerificationCode() {
  return rndStr(5, UPPER_CASE_LETTERS);
}
