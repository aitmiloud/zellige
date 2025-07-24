import { ICEErrorCode, ICEValidationResult } from '../types/company';

// http://www.ompic.ma/fr/content/identifiant-commun-de-lentreprise
// Identifiant Commun de l'Entreprise
const ICE_REGEX = /^\d{15}$/;

// TODO Numero de registre de commerce
// TODO Identifiant fiscal
// TODO Numero de CNSS

/**
 * Sanitizes an ICE input string by removing all non-digits characters
 *
 * @param input - Raw ICE input that needs to be sanitized
 * @returns Sanitized string of 15 digits or null if input is invalid
 *
 * @example
 * ```typescript
 * sanitizeICE('123456789000012'); // Returns '123456789000012'
 * sanitizeICE('  123456789000012'); // Returns '123456789000012'
 * sanitizeICE(null); // Returns null
 * ```
 */
export function sanitizeICE(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  return input.replace(/[^0-9]/g, '');
  // ? Should we only remove whitespace and special characters, similar to CIN?
  // return input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

/**
 * Performs comprehensive validation of a Moroccan ICE (Identifiant Commun de l'Entreprise)
 *
 * @param ice - The ICE string to validate
 * @returns Validation result containing status, errors, and metadata if valid
 *
 * @example
 * ```typescript
 * validateICE('123456789000057');
 * // Returns {
 * //   isValid: true,
 * //   errors: [],
 * //   metadata: {
 * //     company: '123456789',
 * //     establishments: '0000',
 * //     checksum: '57',
 * //   }
 * // }
 *
 * validateICE('XX999999');
 * // Returns {
 * //   isValid: false,
 * //   errors: [{
 * //     code: ICEErrorCode.INVALID_ICE,
 * //     message: 'Invalid ICE'
 * //   }]
 * // }
 * ```
 */
export function validateICE(ice: unknown): ICEValidationResult {
  const result: ICEValidationResult = {
    isValid: false,
    errors: [],
  };

  // Input validation
  if (!ice || typeof ice !== 'string') {
    result.errors.push({
      code: ICEErrorCode.INVALID_INPUT,
      message: 'ICE must be a non-empty string',
    });
    return result;
  }

  // Sanitize input
  const sanitized = sanitizeICE(ice);
  if (!sanitized) {
    result.errors.push({
      code: ICEErrorCode.INVALID_INPUT,
      message: 'ICE contains invalid characters',
    });
    return result;
  }

  // Check format
  if (!ICE_REGEX.test(sanitized)) {
    result.errors.push({
      code: ICEErrorCode.INVALID_FORMAT,
      message: 'Invalid ICE format. Must be string of 15 digits',
    });
    return result;
  }

  // Extract and validate parts
  const match = sanitized.match(/^(\d{9})(\d{4})(\d{2})$/);
  if (match) {
    const company = match[1];
    const establishments = match[2];
    const checksum = match[3];
    console.log(`Company: ${company}`);
    console.log(`Establishments: ${establishments}`);
    console.log(`Checksum: ${checksum}`);

    if (!/^\d{9}$/.test(company)) {
      result.errors.push({
        code: ICEErrorCode.INVALID_SEQUENCE,
        message: 'Company must be 9 digits',
      });
      return result;
    }

    if (!/^\d{4}$/.test(establishments)) {
      result.errors.push({
        code: ICEErrorCode.INVALID_SEQUENCE,
        message: 'Establishments must be 4 digits',
      });
      return result;
    }

    if (!/^\d{2}$/.test(checksum)) {
      result.errors.push({
        code: ICEErrorCode.INVALID_SEQUENCE,
        message: 'Checksum must be 2 digits',
      });
      return result;
    }

    // Valid ICE
    result.isValid = true;
    result.metadata = {
      company,
      establishments,
      checksum,
    };

    return result;
  } else {
    // TODO probably unreachable. Refactor.
  }
}
