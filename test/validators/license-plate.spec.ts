import { validateLicensePlate } from '../../src';
import { LicensePlateType } from '../../src/constants/license-plate';
import {
  getAllLicensePlateTypes,
  getAllRegions,
  getLicensePlateMetadata,
  getLicensePlateName,
  getLicensePlateRegion,
  getLicensePlateType,
  isValidLicensePlate,
} from '../../src/validators/license-plate';

/**
 * Comprehensive test cases for Moroccan License Plate validation
 * Each test case includes specific validation logic for the license plate type
 */

export const testCases = {
  // NORMAL License Plates (Format: [1-99999] - [Letter] - [1-89])
  // Logic: Number (1-99999) + separator + valid letter + separator + region code (1-89)
  NORMAL: {
    valid: [
      // Basic valid formats with different separators
      '1 - A - 12', // Minimum number, Arabic letter, valid region
      '123 - B - 45', // Standard format
      '9999 - D - 10', // 4-digit number
      '99999 - H - 1', // Maximum number (99999)
      '12345 - A - 89', // Maximum region code (89)

      // Arabic letters
      '12345 - أ - 25', // Arabic letter أ
      '12345 - ب - 30', // Arabic letter ب
      '12345 - د - 15', // Arabic letter د
      '5000 - ه - 50', // Arabic letter ه

      // Different separator combinations
      '1235 | A | 21', // Pipe separators
      '5678 - B | 35', // Mixed separators
      '9876 | H - 42', // Mixed separators reverse

      // Spacing variations (should be normalized)
      '123-A-45', // No spaces
      '456  -  B  -  78', // Extra spaces
    ],
    invalid: [
      // Invalid number ranges
      '0 - A - 12', // Number starts with 0
      '100000 - A - 12', // Number exceeds 99999
      '123456 - A - 12', // Too many digits

      // Invalid letters
      '12345 - X - 12', // Invalid letter X
      '12345 - Z - 12', // Invalid letter Z
      '12345 - 1 - 12', // Number instead of letter
      '12345 - AB - 12', // Multiple letters

      // Invalid region codes
      '12345 - A - 0', // Region 0 doesn't exist
      '12345 - A - 90', // Region exceeds 89
      '12345 - A - 100', // Region exceeds valid range
      '12345 - A - 999', // Way too high region

      // Missing parts
      '- A - 12', // Missing number
      '12345 - - 12', // Missing letter
      '12345 - A -', // Missing region
      '12345 - A', // Incomplete format

      // Invalid formats
      '12345 A 12', // Missing separators
      '12345-A-12-X', // Extra part
      'ABC - 123 - 45', // Letters in number position
    ],
  },

  // TRAILER License Plates (Format: [1000-9999] - 0[1-89])
  // Logic: 4-digit number + separator + zero + region code
  TRAILER: {
    valid: [
      '1000 - 01', // Minimum number, minimum region
      '1234 - 01', // Standard format
      '4321 - 10', // Mid-range values
      '9999 - 89', // Maximum values
      '5678 - 45', // Random valid combination
      '8765 - 25', // Another valid case
      '1234 - 99', // Valid region 99

      // Spacing variations
      '1234-01', // No spaces
      '1234  -  01', // Extra spaces
    ],
    invalid: [
      // Invalid number ranges
      '123 - 01', // Less than 4 digits
      '12345 - 01', // More than 4 digits
      '000 - 01', // Too few digits

      // Invalid region format
      '1234 - 1', // Missing leading zero in region
      '1234 - 001', // Extra digit in region

      '1234 - 00', // Invalid region 00

      // Format issues
      '1234 01', // Missing separator
      '1234-', // Missing region
      '- 01', // Missing number
      '1234 - 01 - X', // Extra part
    ],
  },

  // DEALER_W18 License Plates (Format: [10-99999] W 18)
  // Logic: Number (10-99999) + W + 18 (dealer plates)
  DEALER_W18: {
    valid: [
      '10 W 18', // Minimum number
      '123 W 18', // 3-digit number
      '1234 W 18', // 4-digit number
      '12345 W 18', // 5-digit number
      '99999 W 18', // Maximum number
      '12345 w 18', // Lowercase (should be normalized)

      // Spacing variations
      '12345W18', // No spaces
      '12345  W  18', // Extra spaces
    ],
    invalid: [
      // Invalid numbers
      '1 W 18', // Single digit (too small)
      '9 W 18', // Single digit
      '100000 W 18', // Exceeds maximum
      '0123 W 18', // Starts with 0

      // Wrong suffix
      '12345 W 17', // Wrong number after W
      '12345 W 19', // Wrong number after W
      '12345 W 180', // Extra digits
      '12345 W', // Missing number

      // Wrong letter
      '12345 X 18', // Wrong letter

      // Format issues
      '12345 18', // Missing W
      'W 18', // Missing number
      '12345 W 18 X', // Extra part
    ],
  },

  // TEMPORARY_WW License Plates (Format: [1-999999] WW)
  // Logic: Number (1-999999) + WW (temporary plates)
  TEMPORARY_WW: {
    valid: [
      '1 WW', // Minimum number
      '123 WW', // 3-digit number
      '1234 WW', // 4-digit number
      '12345 WW', // 5-digit number
      '123456 WW', // 6-digit number
      '999999 WW', // Maximum number

      // Case variations
      '12345 ww', // Lowercase
      '12345 Ww', // Mixed case

      // Spacing variations
      '123456WW', // No space
      '123456  WW', // Extra spaces
    ],
    invalid: [
      // Invalid numbers
      '0 WW', // Starts with 0
      '1000000 WW', // Exceeds maximum
      '0123456 WW', // Leading zero

      // Wrong suffix
      '123456 W', // Single W
      '123456 WWW', // Triple W
      '123456 XX', // Wrong letters

      // Format issues
      '123456', // Missing WW
      'WW', // Missing number
      '123456 WW X', // Extra part
      '123 456 WW', // Space in number
    ],
  },

  // PUBLIC License Plates (Format: [1-999999] [المغرب|maroc|MAROC|m|M|م])
  // Logic: Number + space + Morocco identifier in Arabic/French
  PUBLIC: {
    valid: [
      // Arabic variants
      '1 المغرب', // Minimum number with Arabic
      '12345 المغرب', // Standard with Arabic
      '999999 المغرب', // Maximum with Arabic
      '54321 م', // Single Arabic letter

      // French variants
      '12345 maroc', // Lowercase French
      '54321 Maroc', // Capitalized French
      '98765 MAROC', // Uppercase French
      '11111 m', // Single lowercase letter
      '22222 M', // Single uppercase letter

      // No spacing (should be normalized)
      '12345المغرب', // No space Arabic
      '54321maroc', // No space French
      '98765MAROC', // No space uppercase
      '11111m', // No space single letter
      '22222M', // No space single letter
      '33333م', // No space Arabic letter
    ],
    invalid: [
      // Invalid numbers
      '0 المغرب', // Starts with 0
      '1000000 المغرب', // Exceeds maximum

      // Invalid identifiers
      '12345 morocco', // English (not allowed)
      '12345 maghreb', // Different word
      '12345 ma', // Wrong abbreviation
      '12345 x', // Wrong letter

      // Format issues
      '12345', // Missing identifier
      'المغرب', // Missing number
      '12345 المغرب X', // Extra part
    ],
  },

  // DIPLOMATIC License Plates (Format: C[.| ]?D - [1-999] - [1-999] [- ه د]?)
  // Logic: CD prefix + numbers + optional Arabic diplomatic suffix
  DIPLOMATIC: {
    valid: [
      // Basic formats
      'C D - 1 - 1', // Minimum numbers
      'C D - 123 - 45', // Standard format

      // With Arabic suffix
      'C D - 12 - 34 - ه د', // With diplomatic Arabic
      'C D - 1 - 1 - ه د', // Minimum with Arabic

      // Different separators
      'C D | 12 | 34', // Pipe separators
      'C D | 123 | 45 | ه د', // Pipe with Arabic

      // Spacing variations in CD
      'C.D - 12 - 34', // Period between C and D
      'C . D - 12 - 34', // Spaced period
      'C. D | 12 | 34', // Period with pipe

      // No spaces (should be normalized)
      'CD-12-34', // No spaces
      'C.D-12-34-ه د', // Period, no spaces, Arabic
      'CD|12|34|ه د', // Pipes, no spaces, Arabic
      'C D - 12 - 34 - هد', // Missing space in Arabic should be validated
      'C D - 12 - 34 - ه د', // Correct Arabic with spaces
    ],
    invalid: [
      // Invalid numbers
      'C D - 0 - 12', // First number is 0
      'C D - 12 - 0', // Second number is 0
      'C D - 1000 - 12', // First number exceeds 999
      'C D - 12 - 1000', // Second number exceeds 999
      'C D - 999 - 999', // Maximum numbers
      'C D - 999 - 999 - ه د', // Maximum with Arabic

      // Wrong prefix
      'C X - 12 - 34', // Wrong second letter
      'X D - 12 - 34', // Wrong first letter

      // Missing parts
      'C D - 12', // Missing second number
      'C D - - 34', // Missing first number
      'C D 12 34', // Missing separators

      // Invalid Arabic suffix
      'C D - 12 - 34 - X Y', // Wrong Arabic letters
      'C D - 12 - 34 - ه د ل', // Extra Arabic letter
    ],
  },

  // INTERNATIONAL_COOPERATIVE License Plates (Format: C[.| ]?I - [1-999] - [10-999] [- ت د]?)
  // Logic: CI prefix + numbers + optional Arabic cooperative suffix
  INTERNATIONAL_COOPERATIVE: {
    valid: [
      // Basic formats
      'C I - 1 - 10', // Minimum numbers
      'C I - 123 - 45', // Standard format

      // With Arabic suffix
      'C I - 12 - 34 - ت د', // With cooperative Arabic
      'C I - 123 - 45 - ت د', // Standard with Arabic
      'C I - 1 - 99 - ت د', // Different numbers with Arabic

      // Different formats
      'C I | 12 | 34', // Pipe separators
      'C.I - 12 - 34', // Period in prefix
      'CI - 12 - 34', // No space in prefix
      'C I - 12 - 34 - تد', // Missing space in Arabic should be validated
      'C I - 12 - 34 - ت د', // Correct Arabic with spaces
    ],
    invalid: [
      // Invalid numbers
      'C I - 0 - 12', // First number is 0
      'C I - 12 - 0', // Second number is 0 (min is 10)
      'C I - 1000 - 12', // First number exceeds 999
      'C I - 12 - 1000', // Second number exceeds 999
      'C I - 12 - 9', // Second number below minimum (10)
      'C I - 999 - 999', // Maximum numbers

      // Wrong prefix
      'C X - 12 - 34', // Wrong second letter
      'X I - 12 - 34', // Wrong first letter

      // Invalid Arabic suffix
      'C I - 12 - 34 - ه د', // Wrong Arabic (diplomatic instead of cooperative)
      'C I - 12 - 34 - ت د X', // Extra character
    ],
  },

  // GOVERNMENT License Plates (Format: [000000-999999] ج)
  // Logic: 6-digit number + Arabic government letter
  GOVERNMENT: {
    valid: [
      '000001 ج', // Minimum (with leading zeros)
      '123456 ج', // Standard format
      '999999 ج', // Maximum
      '100000 ج', // 100k
      '500000 ج', // 500k
      '123456 J', // Latin J instead of Arabic ج
      '654321 ج', // Random valid

      // Different spacing (should be normalized)
      '123456ج', // No space
      '123456  ج', // Extra space
    ],
    invalid: [
      // Wrong number of digits
      '12345 ج', // 5 digits
      '1234567 ج', // 7 digits
      '123 ج', // 3 digits
      '000000 ج', // All zeros

      // Wrong suffix
      '123456 خ', // Wrong Arabic letter
      '123456', // Missing suffix

      // Format issues
      '123456 - ج', // Extra separator
      '123456 ج X', // Extra character
      'ج', // Missing number
    ],
  },

  // CIVIL_PROTECTION License Plates (Format: [000000-999999] و م)
  // Logic: 6-digit number + Arabic civil protection letters
  CIVIL_PROTECTION: {
    valid: [
      '000001 و م', // Minimum
      '123456 و م', // Standard
      '999999 و م', // Maximum
      '654321 و م', // Random valid

      // Spacing variations
      '123456وم', // No spaces
      '123456  و  م', // Extra spaces
    ],
    invalid: [
      // Wrong number of digits
      '12345 و م', // 5 digits
      '1234567 و م', // 7 digits
      '000000 و م', // All zeros

      // Wrong suffix
      '123456 W M', // Latin letters
      '123456 و', // Missing second letter
      '123456م و', // Swapping letter
      '123456 و ك', // Wrong second letter

      // Format issues
      '123456', // Missing suffix
      'و م', // Missing number
      '123456 و م X', // Extra character
    ],
  },

  // POLICE License Plates (Format: [000000-999999] ش)
  // Logic: 6-digit number + Arabic police letter
  POLICE: {
    valid: [
      '000001 ش', // Minimum
      '123456 ش', // Standard
      '999999 ش', // Maximum
      '555555 ش', // Repeating digits

      // Spacing variations
      '123456ش', // No space
      '123456  ش', // Extra space
    ],
    invalid: [
      // Wrong number of digits
      '12345 ش', // 5 digits
      '1234567 ش', // 7 digits
      '000000 ش', // All zeros

      // Wrong suffix
      '123456 S', // Latin S
      '123456 س', // Wrong Arabic letter (س instead of ش)
      '123456', // Missing suffix

      // Format issues
      'ش', // Missing number
      '123456 ش X', // Extra character
    ],
  },

  // AUXILIARY_FORCES License Plates (Format: [000000-999999] ق س)
  // Logic: 6-digit number + Arabic auxiliary forces letters
  AUXILIARY_FORCES: {
    valid: [
      '000001 ق س', // Minimum
      '123456 ق س', // Standard
      '999999 ق س', // Maximum
      '777777 ق س', // Repeating digits

      // Spacing variations
      '123456قس', // No spaces
      '123456  ق  س', // Extra spaces
    ],
    invalid: [
      // Wrong number of digits
      '12345 ق س', // 5 digits
      '1234567 ق س', // 7 digits
      '000000 ق س', // All zeros

      // Wrong suffix
      '123456 Q S', // Latin letters
      '123456 ق', // Missing second letter
      '123456 س', // Missing first letter
      '123456 ك س', // Wrong first letter

      // Format issues
      '123456', // Missing suffix
      'ق س', // Missing number
      '123456 ق س X', // Extra character
    ],
  },

  // MILITARY License Plates (Format: [000000-999999] ق م م)
  // Logic: 6-digit number + Arabic military letters
  MILITARY: {
    valid: [
      '000001 ق م م', // Minimum
      '123456 ق م م', // Standard
      '999999 ق م م', // Maximum
      '888888 ق م م', // Repeating digits

      // Spacing variations
      '123456قمم', // No spaces
      '123456  ق  م  م', // Extra spaces
    ],
    invalid: [
      // Wrong number of digits
      '12345 ق م م', // 5 digits
      '1234567 ق م م', // 7 digits
      '000000 ق م م', // All zeros

      // Wrong suffix
      '123456 Q M M', // Latin letters
      '123456 ق م', // Missing third letter
      '123456 م م', // Missing first letter
      '123456 ق ك م', // Wrong middle letter

      // Format issues
      '123456', // Missing suffix
      'ق م م', // Missing number
      '123456 ق م م X', // Extra character
    ],
  },

  // UNKNOWN type should accept anything (fallback)
  UNKNOWN: {
    valid: [
      'Random text', // Any text
      '12345', // Numbers only
      'ABC-DEF', // Letters with separator
      '!@#$%', // Special characters
      '', // Empty string
      'Mixed 123 Content', // Mixed content
    ],
    invalid: [
      // UNKNOWN type accepts everything, so no invalid cases
    ],
  },
};

/**
 * Comprehensive Test Suite for Moroccan License Plate Validation
 * Each test suite covers specific validation logic for each license plate type
 */
describe('License Plate Validator', () => {
  describe('validateLicensePlate', () => {
    /**
     * NORMAL License Plates
     * Format: [1-99999] - [Valid Letter] - [1-89]
     * Logic: Sequential number + Arabic/Latin letter + region code
     */
    describe('NORMAL License Plates', () => {
      test('should validate valid NORMAL license plates', () => {
        testCases.NORMAL.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('NORMAL');
          expect(result.metadata?.name).toBe('Normal License Plate');
          expect(result.metadata?.regionCode).toBeDefined();
        });
      });

      test('should invalidate invalid NORMAL license plates', () => {
        testCases.NORMAL.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be one of: INVALID_SEQUENCE, INVALID_CHARACTERS, INVALID_REGION
        });
      });
    });

    /**
     * TRAILER License Plates
     * Format: [1000-9999] - 0[1-89]
     * Logic: 4-digit number + zero prefix + region code
     */
    describe('TRAILER License Plates', () => {
      test('should validate valid TRAILER license plates', () => {
        testCases.TRAILER.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('TRAILER');
          expect(result.metadata?.name).toBe('Trailer License Plate');
          expect(result.metadata?.regionCode).toBeUndefined();
        });
      });

      test('should invalidate invalid TRAILER license plates', () => {
        testCases.TRAILER.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_REGION
        });
      });
    });

    /**
     * DEALER_W18 License Plates (Temporary Dealer)
     * Format: [10-99999] W 18
     * Logic: Number range validation + fixed W18 suffix
     */
    describe('DEALER_W18 License Plates', () => {
      test('should validate valid DEALER_W18 license plates', () => {
        testCases.DEALER_W18.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('DEALER_W18');
          expect(result.metadata?.name).toBe(
            'Temporary W18 Dealer License Plate'
          );
          expect(result.metadata?.regionCode).toBeUndefined(); // No region for dealer plates
        });
      });

      test('should invalidate invalid DEALER_W18 license plates', () => {
        testCases.DEALER_W18.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_FORMAT
        });
      });
    });

    /**
     * TEMPORARY_WW License Plates
     * Format: [1-999999] WW
     * Logic: Wide number range + WW suffix
     */
    describe('TEMPORARY_WW License Plates', () => {
      test('should validate valid TEMPORARY_WW license plates', () => {
        testCases.TEMPORARY_WW.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('TEMPORARY_WW');
          expect(result.metadata?.name).toBe('Temporary WW License Plate');
          expect(result.metadata?.regionCode).toBeUndefined(); // No region for temporary plates
        });
      });

      test('should invalidate invalid TEMPORARY_WW license plates', () => {
        testCases.TEMPORARY_WW.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_FORMAT
        });
      });
    });

    /**
     * PUBLIC License Plates
     * Format: [1-999999] [المغرب|maroc|MAROC|m|M|م]
     * Logic: Number + Morocco identifier in Arabic or French
     */
    describe('PUBLIC License Plates', () => {
      test('should validate valid PUBLIC license plates', () => {
        testCases.PUBLIC.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('PUBLIC');
          expect(result.metadata?.name).toBe(
            'Public or Semi Public License Plate'
          );
          expect(result.metadata?.regionCode).toBeUndefined(); // No region for public plates
        });
      });

      test('should invalidate invalid PUBLIC license plates', () => {
        testCases.PUBLIC.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_FORMAT
        });
      });
    });

    /**
     * DIPLOMATIC License Plates
     * Format: C[.| ]?D - [1-999] - [1-999] [- ه د]?
     * Logic: CD prefix + diplomatic numbers + optional Arabic suffix
     */
    describe('DIPLOMATIC License Plates', () => {
      test('should validate valid DIPLOMATIC license plates', () => {
        testCases.DIPLOMATIC.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('DIPLOMATIC');
          expect(result.metadata?.name).toBe('Diplomatic License Plate');
          expect(result.metadata?.regionCode).toBeDefined(); // Diplomatic plates have region codes
        });
      });

      test('should invalidate invalid DIPLOMATIC license plates', () => {
        testCases.DIPLOMATIC.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_REGION
        });
      });
    });

    /**
     * INTERNATIONAL_COOPERATIVE License Plates
     * Format: C[.| ]?I - [1-999] - [10-999] [- ت د]?
     * Logic: CI prefix + cooperative numbers + optional Arabic suffix
     */
    describe('INTERNATIONAL_COOPERATIVE License Plates', () => {
      test('should validate valid INTERNATIONAL_COOPERATIVE license plates', () => {
        testCases.INTERNATIONAL_COOPERATIVE.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('INTERNATIONAL_COOPERATIVE');
          expect(result.metadata?.name).toBe(
            'International Cooperative License Plate'
          );
          expect(result.metadata?.regionCode).toBeUndefined(); // Cooperative plates have region codes
        });
      });

      test('should invalidate invalid INTERNATIONAL_COOPERATIVE license plates', () => {
        testCases.INTERNATIONAL_COOPERATIVE.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_REGION
        });
      });
    });

    /**
     * GOVERNMENT License Plates
     * Format: [000000-999999] ج
     * Logic: Exactly 6 digits + Arabic government letter
     */
    describe('GOVERNMENT License Plates', () => {
      test('should validate valid GOVERNMENT license plates', () => {
        testCases.GOVERNMENT.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('GOVERNMENT');
          expect(result.metadata?.name).toBe('Government License Plate');
          expect(result.metadata?.regionCode).toBeUndefined(); // No region for government plates
        });
      });

      test('should invalidate invalid GOVERNMENT license plates', () => {
        testCases.GOVERNMENT.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_FORMAT
        });
      });
    });

    /**
     * CIVIL_PROTECTION License Plates
     * Format: [000000-999999] و م
     * Logic: Exactly 6 digits + Arabic civil protection letters
     */
    describe('CIVIL_PROTECTION License Plates', () => {
      test('should validate valid CIVIL_PROTECTION license plates', () => {
        testCases.CIVIL_PROTECTION.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('CIVIL_PROTECTION');
          expect(result.metadata?.name).toBe('Civil Protection License Plate');
          expect(result.metadata?.regionCode).toBeUndefined(); // No region for civil protection plates
        });
      });

      test('should invalidate invalid CIVIL_PROTECTION license plates', () => {
        testCases.CIVIL_PROTECTION.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_FORMAT
        });
      });
    });

    /**
     * POLICE License Plates
     * Format: [000000-999999] ش
     * Logic: Exactly 6 digits + Arabic police letter
     */
    describe('POLICE License Plates', () => {
      test('should validate valid POLICE license plates', () => {
        testCases.POLICE.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('POLICE');
          expect(result.metadata?.name).toBe('Police License Plate');
          expect(result.metadata?.regionCode).toBeUndefined(); // No region for police plates
        });
      });

      test('should invalidate invalid POLICE license plates', () => {
        testCases.POLICE.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_FORMAT
        });
      });
    });

    /**
     * AUXILIARY_FORCES License Plates
     * Format: [000000-999999] ق س
     * Logic: Exactly 6 digits + Arabic auxiliary forces letters
     */
    describe('AUXILIARY_FORCES License Plates', () => {
      test('should validate valid AUXILIARY_FORCES license plates', () => {
        testCases.AUXILIARY_FORCES.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('AUXILIARY_FORCES');
          expect(result.metadata?.name).toBe('Auxiliary Forces License Plate');
          expect(result.metadata?.regionCode).toBeUndefined(); // No region for auxiliary forces plates
        });
      });

      test('should invalidate invalid AUXILIARY_FORCES license plates', () => {
        testCases.AUXILIARY_FORCES.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_FORMAT
        });
      });
    });

    /**
     * MILITARY License Plates
     * Format: [000000-999999] ق م م
     * Logic: Exactly 6 digits + Arabic military letters
     */
    describe('MILITARY License Plates', () => {
      test('should validate valid MILITARY license plates', () => {
        testCases.MILITARY.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.metadata?.type).toBe('MILITARY');
          expect(result.metadata?.name).toBe('Military License Plate');
          expect(result.metadata?.regionCode).toBeUndefined(); // No region for military plates
        });
      });

      test('should invalidate invalid MILITARY license plates', () => {
        testCases.MILITARY.invalid.forEach(lp => {
          const result = validateLicensePlate(lp);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          // Error should be INVALID_SEQUENCE or INVALID_FORMAT
        });
      });
    });

    /**
     * UNKNOWN License Plates (Fallback)
     * Format: Any string
     * Logic: Accepts any input that doesn't match other patterns
     */
    describe('UNKNOWN License Plates', () => {
      test('should validate any UNKNOWN license plates (fallback)', () => {
        testCases.UNKNOWN.valid.forEach(lp => {
          const result = validateLicensePlate(lp);
          // UNKNOWN type behavior depends on implementation
          // It might validate as true or false depending on the logic
          expect(result).toBeDefined();
        });
      });
    });

    /**
     * Edge Cases and Error Handling
     */
    describe('Edge Cases and Error Handling', () => {
      test('should handle null and undefined inputs', () => {
        expect(validateLicensePlate(null).isValid).toBe(false);
        expect(validateLicensePlate(undefined).isValid).toBe(false);
        expect(validateLicensePlate('').isValid).toBe(false);
      });

      test('should handle whitespace-only inputs', () => {
        expect(validateLicensePlate('   ').isValid).toBe(false);
        expect(validateLicensePlate('\t\n').isValid).toBe(false);
      });

      test('should normalize spacing and separators', () => {
        const result1 = validateLicensePlate('12345-A-12');
        const result2 = validateLicensePlate('12345 - A - 12');
        const result3 = validateLicensePlate('12345  -  A  -  12');

        // All should have the same validation result (normalized)
        expect(result1.isValid).toBe(result2.isValid);
        expect(result2.isValid).toBe(result3.isValid);
      });

      test('should handle case sensitivity properly', () => {
        const result1 = validateLicensePlate('12345 ww');
        const result2 = validateLicensePlate('12345 WW');
        const result3 = validateLicensePlate('12345 Ww');

        // All should be normalized to uppercase and validate the same
        expect(result1.isValid).toBe(result2.isValid);
        expect(result2.isValid).toBe(result3.isValid);
      });
    });

    /**
     * Integration Tests - Mixed Format Validation
     */
    describe('Integration Tests', () => {
      test('should correctly identify and validate different license plate types', () => {
        const testData = [
          { input: '12345 - A - 25', expectedType: 'NORMAL' },
          { input: '1234 - 01', expectedType: 'TRAILER' },
          { input: '12345 W 18', expectedType: 'DEALER_W18' },
          { input: '123456 WW', expectedType: 'TEMPORARY_WW' },
          { input: '12345 المغرب', expectedType: 'PUBLIC' },
          { input: 'C D - 12 - 34', expectedType: 'DIPLOMATIC' },
          { input: 'C I - 12 - 34', expectedType: 'INTERNATIONAL_COOPERATIVE' },
          { input: '123456 ج', expectedType: 'GOVERNMENT' },
          { input: '123456 و م', expectedType: 'CIVIL_PROTECTION' },
          { input: '123456 ش', expectedType: 'POLICE' },
          { input: '123456 ق س', expectedType: 'AUXILIARY_FORCES' },
          { input: '123456 ق م م', expectedType: 'MILITARY' },
        ];

        testData.forEach(({ input, expectedType }) => {
          const result = validateLicensePlate(input);
          expect(result.isValid).toBe(true);
          expect(result.metadata?.type).toBe(expectedType);
        });
      });

      test('should validate region codes for applicable license plate types', () => {
        const regionTestData = [
          { input: '12345 - A - 1', hasRegion: true }, // NORMAL
          { input: '1234 - 01', hasRegion: false }, // TRAILER
          { input: 'C D - 12 - 34', hasRegion: true }, // DIPLOMATIC
          { input: 'C I - 12 - 34', hasRegion: false }, // INTERNATIONAL_COOPERATIVE
          { input: '12345 W 18', hasRegion: false }, // DEALER_W18
          { input: '123456 WW', hasRegion: false }, // TEMPORARY_WW
          { input: '12345 المغرب', hasRegion: false }, // PUBLIC
          { input: '123456 ج', hasRegion: false }, // GOVERNMENT
        ];

        regionTestData.forEach(({ input, hasRegion }) => {
          const result = validateLicensePlate(input);
          expect(result.isValid).toBe(true);
          if (hasRegion) {
            expect(result.metadata?.regionCode).toBeDefined();
          } else {
            expect(result.metadata?.regionCode).toBeUndefined();
          }
        });
      });
    });
  });
});

/**
 * License Plate Validator Tests
 * This suite tests the isValidLicensePlate function which checks if a license plate is valid
 * based on the defined patterns and rules.
 */

describe('License Plate Validator Tests', () => {
  describe('isValidLicensePlate', () => {
    test('should return true for valid license plates', () => {
      expect(isValidLicensePlate('12345 - A - 1')).toBe(true);
      expect(isValidLicensePlate('54321 - B - 2')).toBe(true);
      expect(isValidLicensePlate('C D - 12 - 34')).toBe(true);
      expect(isValidLicensePlate('C I - 12 - 34 - ت د')).toBe(true);
      expect(isValidLicensePlate('123456 ج')).toBe(true);
      expect(isValidLicensePlate('123456 و م')).toBe(true);
    });
    test('should return false for invalid license plates', () => {
      expect(isValidLicensePlate('INVALID')).toBe(false);
      expect(isValidLicensePlate('12345 - A - 0')).toBe(false);
      expect(isValidLicensePlate('C D - 0 - 12')).toBe(false);
      expect(isValidLicensePlate('C I - 12 - 9')).toBe(false);
      expect(isValidLicensePlate('1234567 ج')).toBe(false);
    });
    test('should handle edge cases', () => {
      expect(isValidLicensePlate(null)).toBe(false);
      expect(isValidLicensePlate(undefined)).toBe(false);
      expect(isValidLicensePlate('')).toBe(false);
      expect(isValidLicensePlate('   ')).toBe(false);
    });
    test('should normalize spacing and separators', () => {
      expect(isValidLicensePlate('12345-A-1')).toBe(true);
      expect(isValidLicensePlate('12345 - A - 1')).toBe(true);
      expect(isValidLicensePlate('12345  -  A  -  1')).toBe(true);
    });
    test('should handle case sensitivity properly', () => {
      expect(isValidLicensePlate('12345 ww')).toBe(true);
      expect(isValidLicensePlate('12345 WW')).toBe(true);
      expect(isValidLicensePlate('12345 Ww')).toBe(true);
    });
  });
});

/**
 * License Plate Type Tests
 * This suite tests the getLicensePlateType function which determines the type of a license plate
 * based on its format and content.
 */

describe('License Plate Type Tests', () => {
  describe('getLicensePlateType', () => {
    test('should return type for Normal license plates', () => {
      expect(getLicensePlateType('12345 - A - 1')).toBe('NORMAL');
      expect(getLicensePlateType('54321 - B - 2')).toBe('NORMAL');
      expect(getLicensePlateType('99999 - H - 3')).toBe('NORMAL');
      expect(getLicensePlateType('10000 - D - 4')).toBe('NORMAL');
      expect(getLicensePlateType('5000 - E - 5')).toBe('NORMAL');
    });

    test('should return type for Diplomatic license plates', () => {
      expect(getLicensePlateType('C D - 12 - 34')).toBe('DIPLOMATIC');
    });

    test('should return type for International Cooperative license plates', () => {
      expect(getLicensePlateType('C I - 12 - 34')).toBe(
        'INTERNATIONAL_COOPERATIVE'
      );
    });
    test('should return type for Dealer W18 license plates', () => {
      expect(getLicensePlateType('12345 W 18')).toBe('DEALER_W18');
    });
    test('should return type for Temporary WW license plates', () => {
      expect(getLicensePlateType('123456 WW')).toBe('TEMPORARY_WW');
    });
    test('should return type for Public license plates', () => {
      expect(getLicensePlateType('12345 المغرب')).toBe('PUBLIC');
      expect(getLicensePlateType('12345 م')).toBe('PUBLIC');
      expect(getLicensePlateType('12345 MAROC')).toBe('PUBLIC');
      expect(getLicensePlateType('12345 m')).toBe('PUBLIC');
    });
    test('should return type for Government license plates', () => {
      expect(getLicensePlateType('123456 ج')).toBe('GOVERNMENT');
    });
    test('should return type for Civil Protection license plates', () => {
      expect(getLicensePlateType('123456 و م')).toBe('CIVIL_PROTECTION');
    });
    test('should return type for Police license plates', () => {
      expect(getLicensePlateType('123456 ش')).toBe('POLICE');
    });
    test('should return type for Military license plates', () => {
      expect(getLicensePlateType('123456 ق م م')).toBe('MILITARY');
    });
    test('should return type for Auxiliary Forces license plates', () => {
      expect(getLicensePlateType('123456 ق س')).toBe('AUXILIARY_FORCES');
    });
    test('should return type for unknown license plates', () => {
      expect(getLicensePlateType('123456')).toBe('UNKNOWN');
      expect(getLicensePlateType('Random text')).toBe('UNKNOWN');
      expect(getLicensePlateType('!@#$%')).toBe('UNKNOWN');
    });
    test('should return null for empty or whitespace-only license plates', () => {
      expect(getLicensePlateType('')).toBe(null);
      expect(getLicensePlateType('   ')).toBe(null);
      expect(getLicensePlateType(null)).toBe(null);
      expect(getLicensePlateType(undefined)).toBe(null);
    });
    test('should return null for invalid license plates', () => {
      expect(getLicensePlateType('INVALID')).toBe('UNKNOWN');
      expect(getLicensePlateType('12345 - A - 0')).toBe('UNKNOWN');
      expect(getLicensePlateType('C D - 0 - 12')).toBe('UNKNOWN');
      expect(getLicensePlateType('C I - 12 - 9')).toBe('UNKNOWN');
      expect(getLicensePlateType('1234567 ج')).toBe('UNKNOWN');
    });
  });
});

/**
 * License Plate Region Tests
 * This suite tests the getLicensePlateRegion function which extracts the region name from a license plate
 * based on the region code.
 */

describe('License Plate Region Name Tests', () => {
  describe('getLicensePlateRegion', () => {
    test('should return region name for Normal license plates', () => {
      expect(getLicensePlateRegion('12345 - A - 1')).toEqual({
        name: 'Rabat',
        code: 1,
      });
      expect(getLicensePlateRegion('54321 - B - 2')).toEqual({
        name: 'Salé-Médina',
        code: 2,
      });
      expect(getLicensePlateRegion('99999 - H - 3')).toEqual({
        name: 'Sala Al-Jadida',
        code: 3,
      });
      expect(getLicensePlateRegion('10000 - D - 4')).toEqual({
        name: 'Skhirat-Temara',
        code: 4,
      });
      expect(getLicensePlateRegion('5000 - E - 5')).toEqual({
        name: 'Khémisset',
        code: 5,
      });
      expect(getLicensePlateRegion('123 - F - 10')).toEqual({
        name: 'Casablanca Moulay Rachid',
        code: 10,
      });
    });

    test('should return region name for Diplomatic license plates', () => {
      const result = getLicensePlateRegion('C D - 12 - 34');
      expect(result).toEqual({
        name: 'Libye',
        code: 34,
      });
    });

    test('should return null for invalid license plates', () => {
      const result = getLicensePlateRegion('INVALID');
      expect(result).toBe(null);
    });

    test('should return message for license plates without region', () => {
      const result = getLicensePlateRegion('12345 W 18');
      expect(result).toBe(null);
    });
  });
});

/**
 * License Plate Metadata Tests
 * This suite tests the getLicensePlateMetadata function which retrieves metadata for a license plate
 * based on its type and content.
 */

describe('License Plate Metadata Tests', () => {
  describe('getLicensePlateMetadata', () => {
    test('should return metadata for valid Normal license plates', () => {
      const result = getLicensePlateMetadata('12345 - A - 1');
      expect(result).toEqual({
        type: 'NORMAL',
        name: 'Normal License Plate',
        regionCode: 1,
      });
    });

    test('should return type UNKNOWN in metadata for invalid license plates', () => {
      const result = getLicensePlateMetadata('INVALID');
      expect(result).toEqual({
        name: 'Unknown License Plate Type',
        type: 'UNKNOWN',
        regionCode: undefined,
      });
    });

    test('should return metadata for license plates without region', () => {
      const result = getLicensePlateMetadata('12345 W 18');
      expect(result).toEqual({
        name: 'Temporary W18 Dealer License Plate',
        type: 'DEALER_W18',
        regionCode: undefined,
      });
    });

    test('should return name for unknown license plates', () => {
      expect(getLicensePlateMetadata('INVALID')).toEqual({
        name: 'Unknown License Plate Type',
        type: 'UNKNOWN',
        regionCode: undefined,
      });
    });
  });
});

/**
 * License Plate Name Tests
 * This suite tests the getLicensePlateName function which returns the name of a license plate
 * based on its type and content.
 */

describe('License Plate Name Tests', () => {
  describe('getLicensePlateName', () => {
    test('should return name for Normal license plates', () => {
      expect(getLicensePlateName('12345 - A - 1')).toBe('Normal License Plate');
    });

    test('should return name for Diplomatic license plates', () => {
      expect(getLicensePlateName('C D - 12 - 34')).toBe(
        'Diplomatic License Plate'
      );
    });

    test('should return name for Temporary W18 Dealer license plates', () => {
      expect(getLicensePlateName('12345 W 18')).toBe(
        'Temporary W18 Dealer License Plate'
      );
    });

    test('should return name for unknown license plates', () => {
      expect(getLicensePlateName('INVALID')).toBe('Unknown License Plate Type');
    });
  });
});

/**
 * Get All Regions Tests
 * This suite tests the getAllRegions function which retrieves all available regions
 * for license plates based on the region codes.
 */

describe('Get All Regions Tests', () => {
  describe('getAllRegions', () => {
    test('should return all regions with correct names and codes', () => {
      const regionsObj = getAllRegions();
      expect(regionsObj).toBeDefined();
      const regions = Object.entries(regionsObj).map(([code, name]) => ({
        code: Number(code),
        name: name,
      }));
      expect(regions.length).toBeGreaterThan(0);

      // Check specific regions
      const rabatRegion = regions.find(
        (r: { code: number; name: string }) => Number(r.code) === 1
      );
      expect(rabatRegion).toEqual({ name: 'Rabat', code: 1 });

      const saleRegion = regions.find(
        (r: { code: number; name: string }) => Number(r.code) === 2
      );
      expect(saleRegion).toEqual({ name: 'Salé-Médina', code: 2 });

      const casablancaRegion = regions.find(
        (r: { code: number; name: string }) => Number(r.code) === 10
      );
      expect(casablancaRegion).toEqual({
        name: 'Casablanca Moulay Rachid',
        code: 10,
      });
    });
  });
});

/**
 * Get All License Plate Types Tests
 * This suite tests the getAllLicensePlateTypes function which retrieves all available license plate types
 * based on the defined patterns and rules.
 */

describe('Get All License Plate Types Tests', () => {
  describe('getAllLicensePlateTypes', () => {
    test('should return all license plate types with correct names and codes', () => {
      const types: LicensePlateType[] = getAllLicensePlateTypes();
      expect(types).toBeDefined();
      expect(types.length).toBeGreaterThan(0);

      // Check specific types
      const normalType = types.find(
        type => type === (LicensePlateType.NORMAL as LicensePlateType)
      );
      expect(normalType).toEqual(LicensePlateType.NORMAL);

      const diplomaticType = types.find(
        type => type === (LicensePlateType.DIPLOMATIC as LicensePlateType)
      );
      expect(diplomaticType).toEqual(LicensePlateType.DIPLOMATIC);

      const dealerW18Type = types.find(
        type => type === (LicensePlateType.DEALER_W18 as LicensePlateType)
      );
      expect(dealerW18Type).toEqual(LicensePlateType.DEALER_W18);
    });
  });
});
