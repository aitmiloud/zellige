import { REGION_PREFIXES, CINRegionPrefix } from '../constants/regions';
import { CINErrorCode, CINValidationResult } from '../types/cin';

/**
 * Regular expression for Moroccan CIN validation
 * Format: 1-3 letters followed by 6 digits
 */
const CIN_REGEX = /^[A-Z]{1,3}\d{1,6}$/;

/**
 * Sanitizes a CIN (Carte d'Identité Nationale) input string by removing whitespace and special characters
 *
 * @param input - Raw CIN input that needs to be sanitized
 * @returns Sanitized uppercase string or null if input is invalid
 *
 * @example
 * ```typescript
 * sanitizeCIN('A 123456'); // Returns 'A123456'
 * sanitizeCIN('BE-789.012'); // Returns 'BE789012'
 * sanitizeCIN(null); // Returns null
 * ```
 */
export function sanitizeCIN(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  return input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

/**
 * Performs comprehensive validation of a Moroccan CIN (Carte d'Identité Nationale)
 *
 * @param cin - The CIN string to validate
 * @returns Validation result containing status, errors, and metadata if valid
 *
 * @example
 * ```typescript
 * validateCIN('A123456');
 * // Returns {
 * //   isValid: true,
 * //   errors: [],
 * //   metadata: {
 * //     region: 'Rabat',
 * //     sequence: '123456',
 * //     issuingOffice: 'A'
 * //   }
 * // }
 *
 * validateCIN('XX999999');
 * // Returns {
 * //   isValid: false,
 * //   errors: [{
 * //     code: CINErrorCode.INVALID_REGION,
 * //     message: 'Invalid region prefix: XX'
 * //   }]
 * // }
 * ```
 */
export function validateCIN(cin: unknown): CINValidationResult {
  const result: CINValidationResult = {
    isValid: false,
    errors: [],
  };

  // Input validation
  if (!cin || typeof cin !== 'string') {
    result.errors.push({
      code: CINErrorCode.INVALID_INPUT,
      message: 'CIN must be a non-empty string',
    });
    return result;
  }

  // Sanitize input
  const sanitized = sanitizeCIN(cin);
  if (!sanitized) {
    result.errors.push({
      code: CINErrorCode.INVALID_INPUT,
      message: 'CIN contains invalid characters',
    });
    return result;
  }

  // Check format
  if (!CIN_REGEX.test(sanitized)) {
    result.errors.push({
      code: CINErrorCode.INVALID_FORMAT,
      message: 'Invalid CIN format. Must be 1-3 letters followed by 1-6 digits',
    });
    return result;
  }

  // Extract and validate parts
  const prefix = sanitized.match(/^[A-Z]+/)![0] as CINRegionPrefix;
  const sequence = sanitized.match(/\d+$/)![0];

  // Validate region
  if (!REGION_PREFIXES[prefix]) {
    result.errors.push({
      code: CINErrorCode.INVALID_REGION,
      message: `Invalid region prefix: ${prefix}`,
    });
    return result;
  }

  // Validate sequence
  if (!/^[1-9]\d{0,5}$/.test(sequence)) {
    result.errors.push({
      code: CINErrorCode.INVALID_SEQUENCE,
      message: 'Sequence must be 1-6 digits and cannot start with 0',
    });
    return result;
  }

  // Valid CIN
  result.isValid = true;
  result.metadata = {
    region: REGION_PREFIXES[prefix],
    sequence: sequence,
    issuingOffice: prefix as string,
  };

  return result;
}

/**
 * Quick check to determine if a string is a valid Moroccan CIN
 *
 * @param cin - The CIN string to check
 * @returns True if the CIN is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidCIN('A123456'); // Returns true
 * isValidCIN('XX999999'); // Returns false
 * isValidCIN('12345'); // Returns false
 * ```
 */
export function isValidCIN(cin: unknown): boolean {
  return validateCIN(cin).isValid;
}

/**
 * Retrieves the region name associated with a CIN prefix
 *
 * @param prefix - The CIN prefix (1-3 letters) to look up
 * @returns The full region name or null if the prefix is invalid
 *
 * @example
 * ```typescript
 * getCINRegion('A'); // Returns 'Rabat'
 * getCINRegion('BK'); // Returns 'Casablanca'
 * getCINRegion('XX'); // Returns null
 * ```
 */
export function getCINRegion(prefix: string): string | null {
  const sanitized = prefix.trim().toUpperCase();
  return REGION_PREFIXES[sanitized as CINRegionPrefix] || null;
}

/**
 * Generates a random valid CIN for testing purposes
 *
 * @param prefix - Optional specific region prefix to use
 * @returns A valid CIN string
 *
 * @example
 * ```typescript
 * generateTestCIN(); // Returns random CIN like 'A123456'
 * generateTestCIN('BK'); // Returns random CIN starting with 'BK'
 * ```
 */
export function generateTestCIN(prefix?: CINRegionPrefix): string {
  const randomPrefix =
    prefix ||
    Object.keys(REGION_PREFIXES)[
      Math.floor(Math.random() * Object.keys(REGION_PREFIXES).length)
    ];
  const sequence = String(Math.floor(Math.random() * 899999) + 100000);
  return `${randomPrefix}${sequence}`;
}
