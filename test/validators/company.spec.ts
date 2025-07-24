import { validateICE } from '../../src/validators/company'; // TODO import from src directly

describe('ICE Validator', () => {
  describe('validateICE', () => {
    test('should validate correct ICEs', () => {
      const validICEs = [
        '001663252000092',
        '001436361000017',
        '000193552000068',
        '000029979000032',
      ];

      validICEs.forEach(ice => {
        const result = validateICE(ice);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid ICEs', () => {
      const invalidICEs = [
        '', // empty
        '123456890000571234', // too many digits (>15)
        '123456', // not enough digits
        'ICE12345', // Characters
        'BE12345689000057',
        '123A5689000057',
        // '000000000000000', // All zeros
        '##12345689000057', // invalid characters
        ':12345689000057',
        '12345689000057*',
        -1, // invalid type
      ];

      invalidICEs.forEach(ice => {
        const result = validateICE(ice);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });
});
