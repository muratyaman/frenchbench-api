import bcrypt from 'bcrypt';

/**
 * Remove all chars but a-z, A-Z, 0-9, '.', '-', '_'
 * @param {string} username
 * @returns {string}
 */
export function pruneUsername(username) {
  const pattern = /[^a-zA-Z0-9.\-_]+/i;
  return String(username).replace(pattern, '');
}

export const specialChars = '.,-_<>?!@$;:()&%+-*/\\';

/**
 * Check whether input has one special character or not
 * @param {string} testString
 * @returns {boolean}
 */
export function hasOneSpecialChar(testString) {
  const chars = specialChars.split(''); // convert to char array
  const escapedChars = chars.map(c => ('\\'+c)); // add escape before each char
  const pattern = escapedChars.join('|'); // join by pipe so the test will look for one of the sub-patterns
  const re = new RegExp(pattern);
  return re.exec(testString) !== null;
}

/**
 * Check password
 * 1. has length over 9
 * 2. has 1 of a-z
 * 3. has 1 of A-Z
 * 4. has 1 of 0-9
 * 5. has 1 of special characters
 * @param {string} password
 * @returns {boolean}
 */
export function isStrongPassword(password) {
  let s = String(password);
  return 10 <= s.length
    && s.match(/[a-z]/)
    && s.match(/[A-Z]/)
    && s.match(/[0-9]/)
    && hasOneSpecialChar(s);
}

/**
 * Create hash for plain password
 * @param {string} plainPassword
 * @param {number} saltRounds
 * @returns {Promise<string>}
 */
export async function hashPassword(plainPassword, saltRounds = 10) {
  // store hash in your db
  return bcrypt.hash(plainPassword, saltRounds);
}

/**
 * Verify password
 * @param {string} plainPassword
 * @param {string} password_hash
 * @returns {Promise<Boolean>}
 */
export async function verifyPassword(plainPassword, password_hash) {
  // result == true/false
  return bcrypt.compare(plainPassword, password_hash);
}

export function hideSensitiveUserProps(row) {
  delete row.password_hash;
  return row;
}
