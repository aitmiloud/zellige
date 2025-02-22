import { validateICE } from '../../src';
import {
  calculateControl,
  generateRandomDigits,
  generateTestICE,
  ICEValidationErrorCode,
  isValidICE,
  sanitizeICE,
  validateControl,
} from '../../src/validators/ice';

describe('ICE Validators', () => {
  describe('validateICE', () => {
    const VALID_ICE = '123456789000060';
    const INVALID_CONTROL_ICE = '123456789000061';
    const SHORT_ICE = '12345678900006';
    const LONG_ICE = '1234567890000600';
    const NON_NUMERIC_VALID_ICE = 'ICE123-456/789.0001_60';
    const NON_NUMERIC_INVALID_LENGTH = 'ICE123-456/789';

    test('should return valid result for correct ICE', () => {
      const result = validateICE(VALID_ICE);

      expect(result.isValid).toBeTruthy();
      expect(result.sanitized).toBe(VALID_ICE);
      expect(result.components).toEqual({
        company: '123456789',
        establishment: '0000',
        control: '60',
      });
    });

    test('should return invalid length for short ICE', () => {
      const result = validateICE(SHORT_ICE);

      expect(result.isValid).toBeFalsy();
      expect(result.error?.code).toBe(ICEValidationErrorCode.INVALID_LENGTH);
      expect(result.error?.details).toMatchObject({
        receivedLength: 14,
        sanitized: SHORT_ICE,
      });
    });

    test('should return invalid length for long ICE', () => {
      const result = validateICE(LONG_ICE);

      expect(result.isValid).toBeFalsy();
      expect(result.error?.code).toBe(ICEValidationErrorCode.INVALID_LENGTH);
      expect(result.error?.details).toMatchObject({
        receivedLength: 16,
        sanitized: LONG_ICE,
      });
    });

    test('should return invalid control for wrong checksum', () => {
      const result = validateICE(INVALID_CONTROL_ICE);

      expect(result.isValid).toBeFalsy();
      expect(result.error?.code).toBe(ICEValidationErrorCode.INVALID_CONTROL);
      expect(result.error?.details).toMatchObject({
        providedControl: '61',
        sanitized: INVALID_CONTROL_ICE,
      });
    });

    test('should handle non-numeric characters with valid result', () => {
      const result = validateICE(NON_NUMERIC_VALID_ICE);

      expect(result.isValid).toBeFalsy();
      expect(result.sanitized).toBe('123456789000160');
    });

    test('should handle non-numeric characters with invalid length', () => {
      const result = validateICE(NON_NUMERIC_INVALID_LENGTH);

      expect(result.isValid).toBeFalsy();
      expect(result.error?.code).toBe(ICEValidationErrorCode.INVALID_LENGTH);
      expect(result.error?.details).toMatchObject({
        receivedLength: 9,
        sanitized: '123456789',
      });
    });
  });

  describe('isValidICE', () => {
    // Valid ICE numbers
    test('should return true for valid ICE numbers', () => {
      expect(isValidICE('123456789000060')).toBeTruthy(); // Valid ICE
      expect(isValidICE('000000000000000')).toBeTruthy(); // Edge case: all zeros
      expect(isValidICE('999999999999914')).toBeTruthy(); // Edge case: all nines
    });

    // Invalid ICE numbers
    test('should return false for invalid ICE numbers', () => {
      expect(isValidICE('1234567890001')).toBeFalsy(); // Too short
      expect(isValidICE('12345678900012345')).toBeFalsy(); // Too long
      expect(isValidICE('123456789ABCDEF')).toBeFalsy(); // Non-numeric characters
      expect(isValidICE('123456789000099')).toBeFalsy(); // Invalid checksum
    });

    // Edge cases
    test('should return false for non-string inputs', () => {
      expect(isValidICE(null as unknown as string)).toBeFalsy(); // Null input
      expect(isValidICE(undefined as unknown as string)).toBeFalsy(); // Undefined input
      expect(isValidICE(123456789000057 as unknown as string)).toBeFalsy(); // Number input
      expect(isValidICE({} as unknown as string)).toBeFalsy(); // Object input
    });

    test('should return false for empty or whitespace-only strings', () => {
      expect(isValidICE('')).toBeFalsy(); // Empty string
      expect(isValidICE('   ')).toBeFalsy(); // Whitespace-only string
    });
  });

  describe('sanitizeICE', () => {
    test('should remove all non-digit characters from input', () => {
      expect(sanitizeICE('123 456-789/0001.31')).toBe('123456789000131');
      expect(sanitizeICE('ICE123-456/789.0001_31')).toBe('123456789000131');
      expect(sanitizeICE('1 2 3 4 5 6 7 8 9 0 0 0 1 3 1')).toBe(
        '123456789000131'
      ); // Full-width numbers
    });

    test('should return empty string if input contains no digits', () => {
      expect(sanitizeICE('ICE')).toBe('');
      expect(sanitizeICE('ABC-DEF/XYZ')).toBe('');
      expect(sanitizeICE('!@#$%^&*()')).toBe('');
    });

    test('should handle empty input', () => {
      expect(sanitizeICE('')).toBe('');
    });

    test('should handle input with only digits', () => {
      expect(sanitizeICE('123456789000131')).toBe('123456789000131');
    });

    test('should handle mixed input with digits and non-digits', () => {
      expect(sanitizeICE('1A2B3C4D5E6F7G8H9I0J0K0L1M3N1')).toBe(
        '123456789000131'
      );
    });
  });

  describe('validateControl', () => {
    test('should return true for valid control characters', () => {
      // Example: 1234567890000 % 97 = 60 → control characters should be "60"
      const validICE = '123456789000060';
      expect(validateControl(validICE)).toBeTruthy();
    });

    test('should return false for invalid control characters', () => {
      // Example: 1234567890000 % 97 = 60, but control characters are "99"
      const invalidICE = '123456789000099';
      expect(validateControl(invalidICE)).toBeFalsy();
    });

    test('should return false for ICE with incorrect length', () => {
      // ICE is too short (missing control characters)
      const shortICE = '1234567890000';
      expect(validateControl(shortICE)).toBeFalsy();
    });

    test('should return false for non-numeric ICE', () => {
      // ICE contains non-numeric characters
      const nonNumericICE = '1234567890000XX';
      expect(validateControl(nonNumericICE)).toBeFalsy();
    });

    test('should return false for empty input', () => {
      // Empty input
      const emptyICE = '';
      expect(validateControl(emptyICE)).toBeFalsy();
    });

    test('should return false for undefined input', () => {
      // Undefined input
      expect(validateControl(undefined as unknown as string)).toBeFalsy();
    });
  });

  describe('generateTestICE', () => {
    test('should generates a raw ICE number by default', () => {
      const ice = generateTestICE();
      expect(ice).toMatch(/^\d{15}$/); // 15-digit numeric string
    });

    test('should generates a formatted ICE number when format=true', () => {
      const ice = generateTestICE({ format: true });
      expect(ice).toMatch(/^\d{9} \d{4} \d{2}$/); // Default format: "123456789 0001 31"
    });

    test('should generates a formatted ICE number with custom separator', () => {
      const ice = generateTestICE({ format: true, separator: '-' });
      expect(ice).toMatch(/^\d{9}-\d{4}-\d{2}$/); // Format: "123456789-0001-31"
    });

    test('should generates a formatted ICE number with prefix', () => {
      const ice = generateTestICE({ format: true, prefix: true });
      expect(ice).toMatch(/^ICE \d{9} \d{4} \d{2}$/); // Format: "ICE 123456789 0001 31"
    });

    test('should generates a formatted ICE number with grouped company digits', () => {
      const ice = generateTestICE({ format: true, groupCompanyDigits: true });
      expect(ice).toMatch(/^\d{3} \d{3} \d{3} \d{4} \d{2}$/); // Format: "123 456 789 0001 31"
    });

    test('should generates a formatted ICE number with all options enabled', () => {
      const ice = generateTestICE({
        format: true,
        separator: '-',
        prefix: true,
        groupCompanyDigits: true,
      });
      expect(ice).toMatch(/^ICE-\d{3}-\d{3}-\d{3}-\d{4}-\d{2}$/); // Format: "ICE 123-456-789-0001-31"
    });

    test('should generates unique ICE numbers', () => {
      const ice1 = generateTestICE();
      const ice2 = generateTestICE();
      expect(ice1).not.toBe(ice2);
    });
  });

  describe('generateRandomDigits', () => {
    test('should generates a string of the correct length', () => {
      const length = 5;
      const result = generateRandomDigits(length);
      expect(result.length).toBe(length);
    });

    test('should generates only numeric characters', () => {
      const length = 10;
      const result = generateRandomDigits(length);
      expect(result).toMatch(/^\d+$/); // Only digits allowed
    });

    test('should generates different outputs for multiple calls', () => {
      const length = 8;
      const result1 = generateRandomDigits(length);
      const result2 = generateRandomDigits(length);
      expect(result1).not.toBe(result2); // Ensure randomness
    });

    test('should handles zero length gracefully', () => {
      const result = generateRandomDigits(0);
      expect(result).toBe('');
    });

    test('should handles negative length gracefully', () => {
      const result = generateRandomDigits(-5);
      expect(result).toBe('');
    });
  });

  describe('calculateControl', () => {
    test('should calculates control for full ICE (15 digits)', () => {
      const ice = '123456789000131';
      const control = calculateControl(ice);
      expect(control).toBe('61');
    });

    test('should calculates control for partial ICE (13 digits)', () => {
      const ice = '1234567890001';
      const control = calculateControl(ice);
      expect(control).toBe('61');
    });

    test('should calculates control for edge case (all zeros)', () => {
      const ice = '000000000000000';
      const control = calculateControl(ice);
      expect(control).toBe('00');
    });

    test('should calculates control for maximum value (all 9s)', () => {
      const ice = '999999999999999';
      const control = calculateControl(ice);
      expect(control).toBe('14');
    });

    test('should calculates control for a random ICE', () => {
      const ice = '987654321012345';
      const control = calculateControl(ice);
      expect(control).toBe('05');
    });

    test('should handles shorter input (less than 13 digits)', () => {
      const ice = '123456789';
      const control = calculateControl(ice);
      expect(control).toBe('39');
    });
  });
});
