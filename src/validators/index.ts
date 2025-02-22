/**
 * Validator module for various data validation operations
 * @module validators
 */

/**
 * Import CIN validation utilities
 */
import {
  validateCIN,
  generateTestCIN,
  getCINRegion,
  sanitizeCIN,
  isValidCIN,
} from './cin';

/**
 * Import passport validation utilities
 */
import {
  validatePassport,
  isValidPassport,
  normalizePassport,
  formatPassport,
  generateRandomPassport,
  extractPassportComponents,
  arePassportsEquivalent,
} from './passport';

/**
 * Import bank validation utilities
 */
import {
  isValidIBAN,
  isValidRIB,
  getBankDetails,
  getSwiftCode,
  madToWords,
} from './bank';

/**
 * Import phone number validation utilities
 */
import {
  validatePhone,
  formatPhone,
  getPhoneDetails,
  extractPhoneNumbers,
  maskPhone,
  arePhoneNumbersEqual,
  sanitizePhone,
} from './phone-number';

/**
 * Import ICE validation utilities
 */
import {
  isValidICE,
  sanitizeICE,
  validateICE,
  validateControl,
  generateTestICE,
} from './ice';

/**
 * Namespace containing all CIN-related validation functions
 */
const cin = {
  validate: validateCIN,
  generateTest: generateTestCIN,
  getRegion: getCINRegion,
  sanitize: sanitizeCIN,
  isValid: isValidCIN,
};

/**
 * Namespace containing all passport-related validation functions
 */
const passport = {
  validate: validatePassport,
  isValid: isValidPassport,
  normalize: normalizePassport,
  format: formatPassport,
  generateRandom: generateRandomPassport,
  extractComponents: extractPassportComponents,
  areEquivalent: arePassportsEquivalent,
};

/**
 * Namespace containing all bank-related validation functions
 */
const bank = {
  isValidIBAN,
  isValidRIB,
  getDetails: getBankDetails,
  getSwiftCode,
  madToWords,
};

/**
 * Namespace containing all phone number-related validation functions
 */
const phone = {
  validate: validatePhone,
  format: formatPhone,
  getDetails: getPhoneDetails,
  extract: extractPhoneNumbers,
  mask: maskPhone,
  areEqual: arePhoneNumbersEqual,
  sanitize: sanitizePhone,
};

/**
 * Namespace containing all ICE-related validation functions
 */
const ice = {
  validateICE,
  sanitizeICE,
  isValidICE,
  validateControl,
  generateTestICE,
};

/**
 * Collection of all validator namespaces
 */
export const validators = {
  cin,
  passport,
  bank,
  phone,
  ice,
};

/**
 * Default export providing access to all validator functions
 * @default
 */
export default validators;

/**
 * Direct exports of CIN validation functions for granular imports
 */
export { validateCIN, generateTestCIN, getCINRegion, sanitizeCIN, isValidCIN };

/**
 * Direct exports of passport validation functions for granular imports
 */
export {
  validatePassport,
  isValidPassport,
  normalizePassport,
  formatPassport,
  generateRandomPassport,
  extractPassportComponents,
  arePassportsEquivalent,
};

/**
 * Direct exports of bank validation functions for granular imports
 */
export { isValidIBAN, isValidRIB, getBankDetails, getSwiftCode, madToWords };

/**
 * Direct exports of phone number validation functions for granular imports
 */
export {
  validatePhone,
  formatPhone,
  getPhoneDetails,
  extractPhoneNumbers,
  maskPhone,
  arePhoneNumbersEqual,
  sanitizePhone,
};

/**
 * Direct exports of ICE number validation functions for granular imports
 */
export {
  isValidICE,
  sanitizeICE,
  validateICE,
  validateControl,
  generateTestICE,
};
