import bcrypt from 'bcrypt'

/**
 * Compare two strings, one plain and one hashed
 * @public 
 * @param {string} plainString
 * @param {string} hashedString
 * @returns {Promise<boolean>}
 */
export function compareStrings(plainString, hashedString) {
    return bcrypt.compare(plainString, hashedString);
};

/**
 * Hash a string
 * @public 
 * @param {string} string
 * @returns {Promise<string>}
 */
export function hashString(string, saltRounds) {
    return bcrypt.hash(string, saltRounds);
};