import md5 from 'md5';
import { v4 } from 'uuid';

export const newUuid = v4;
export const hash = md5;

export function ts(): string {
  return (new Date()).toISOString();
}

export function log(...args: any[]): void {
  console.log.call(null, ts(), ...args);
}

export const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export function validateEmailAddress(s: string | null): boolean {
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

export function rndStr(len = 10, charList = ALL_LETTERS_AND_DIGITS): string {
  let s = '', r = 0, c = '';
  const listLen = charList.length;
  
  for (let i = 0; i < len; i++) {
    r = rndInt(listLen - 1);
    c = charList[r];
    s += c;
  }

  return s;
}

export function rndInt(max = 9999, min = 0): number {
  return min + Math.round(Math.random() * (max - min));
}

export function rndEmailVerificationCode(): string {
  return rndStr(5, UPPER_CASE_LETTERS);
}
