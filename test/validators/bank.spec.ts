import {
  isValidIBAN,
  isValidRIB,
  getBankDetails,
  getSwiftCode,
  madToWords,
} from '../../src/validators/';

describe('Bank Validators', () => {
  describe('isValidIBAN', () => {
    it('should return true for valid Moroccan IBAN', () => {
      // Valid Moroccan IBAN structure:
      // MA + 2 check digits + 3 (bank) + 5 (agency) + 14 (account) + 2 (RIB key)
      expect(isValidIBAN('MA64 0071 0800 0779 2000 3031 2071')).toBe(true);
    });

    it('should return false for invalid IBAN format', () => {
      // Wrong country code
      expect(isValidIBAN('FR76 1152 0111 1111 1111 1111 1111')).toBe(false);

      // Wrong length (too short)
      expect(isValidIBAN('MA64 1152 0111 1111 1111 111')).toBe(false);

      // Wrong length (too long)
      expect(isValidIBAN('MA64 1152 0111 1111 1111 1111 11111')).toBe(false);

      // Invalid characters (contains letters where should be numbers)
      expect(isValidIBAN('MA64 ABCD 0111 1111 1111 1111 1111')).toBe(false);
    });

    it('should handle IBAN with and without spaces', () => {
      const validIBAN = 'MA64 0071 0800 0779 2000 3031 2071';
      const validIBANWithoutSpaces = validIBAN.replace(/\s/g, '');

      expect(isValidIBAN(validIBAN)).toBe(true);
      expect(isValidIBAN(validIBANWithoutSpaces)).toBe(true);
    });

    it('should handle case sensitivity', () => {
      const validIBAN = 'ma64 0071 0800 0779 2000 3031 2071';
      expect(isValidIBAN(validIBAN)).toBe(true);
    });
  });

  describe('isValidRIB', () => {
    it('should validate a correct RIB', () => {
      expect(isValidRIB('007000000000000000000149')).toBe(true);
    });

    it('should invalidate an incorrect RIB', () => {
      expect(isValidRIB('0070000000000000000001788')).toBe(false);
    });

    it('should invalidate a RIB with incorrect format', () => {
      expect(isValidRIB('007000000000000000000178')).toBe(false);
    });
  });

  describe('getBankDetails', () => {
    it('should return bank details for a valid code', () => {
      const bank = getBankDetails('007');
      expect(bank).toBeDefined();
      expect(bank?.name).toBe('Attijariwafa Bank');
    });

    it('should return undefined for an invalid code', () => {
      expect(getBankDetails('999')).toBeUndefined();
    });
  });

  describe('getSwiftCode', () => {
    it('should return the SWIFT code for a valid bank code', () => {
      expect(getSwiftCode('007')).toBe('BCMAMAMC');
    });

    it('should return the branch SWIFT code for a valid bank and branch code', () => {
      expect(getSwiftCode('007', 'ATI')).toBe('BCMAMAMCATI');
    });

    it('should return undefined for an invalid bank code', () => {
      expect(getSwiftCode('999')).toBeUndefined();
    });
  });

  describe('madToWords', () => {
    it('should convert a number to words in French', () => {
      expect(madToWords(1234)).toBe('mille deux cent trente-quatre dirhams');
    });

    it('should convert a negative number to words in French', () => {
      expect(madToWords(-1234)).toBe(
        'moins mille deux cent trente-quatre dirhams'
      );
    });

    it('should convert a number with cents to words in French', () => {
      expect(madToWords(1234.56)).toBe(
        'mille deux cent trente-quatre dirhams et cinquante-six centimes'
      );
    });
  });
});
