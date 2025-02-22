import { MOROCCAN_BANKS } from '../constants/banks';
import type { BankDetails } from '../types/bank';

// Add error codes enum at the top of the file
export enum BankValidationError {
  INVALID_INPUT_TYPE = 'BANK_001',
  INVALID_IBAN_FORMAT = 'BANK_002',
  INVALID_BANK_CODE = 'BANK_003',
  INVALID_IBAN_CHECKSUM = 'BANK_004',
  INVALID_RIB_FORMAT = 'BANK_005',
  INVALID_RIB_LENGTH = 'BANK_006',
  INVALID_RIB_CHECKSUM = 'BANK_007',
  BANK_NOT_FOUND = 'BANK_008',
  INVALID_AMOUNT = 'BANK_009',
  BRANCH_NOT_FOUND = 'BANK_010',
}

// Custom error class
export class BankValidationException extends Error {
  constructor(
    public code: BankValidationError,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BankValidationException';
  }
}

/**
 * Validates a given IBAN (International Bank Account Number) for Moroccan banks.
 *
 * @param iban - The IBAN string to validate.
 * @returns `true` if the IBAN is valid, `false` otherwise.
 * @throws {TypeError} If the provided IBAN is not a string.
 *
 * The function performs the following checks:
 * 1. Ensures the IBAN is a string.
 * 2. Removes any whitespace and converts the IBAN to uppercase.
 * 3. Checks if the IBAN matches the Moroccan IBAN format (starts with 'MA' followed by 26 digits).
 * 4. Extracts the bank code and verifies it against a list of active Moroccan banks.
 * 5. Rearranges the IBAN and converts it to a numeric string for the MOD 97-10 check.
 * 6. Performs the MOD 97-10 check to validate the IBAN.
 */
export function isValidIBAN(iban: string): boolean {
  try {
    if (typeof iban !== 'string') {
      throw new BankValidationException(
        BankValidationError.INVALID_INPUT_TYPE,
        'IBAN must be a string',
        { providedType: typeof iban }
      );
    }

    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();

    if (!/^MA\d{26}$/.test(cleanIBAN)) {
      throw new BankValidationException(
        BankValidationError.INVALID_IBAN_FORMAT,
        'Invalid IBAN format',
        { iban: cleanIBAN }
      );
    }

    const bankCode = cleanIBAN.substring(4, 7);
    const bank = MOROCCAN_BANKS.find(b => b.code === bankCode && b.active);

    if (!bank) {
      throw new BankValidationException(
        BankValidationError.INVALID_BANK_CODE,
        'Invalid or inactive bank code',
        { bankCode }
      );
    }

    if (!bank.ibanRegex.test(cleanIBAN)) {
      throw new BankValidationException(
        BankValidationError.INVALID_IBAN_FORMAT,
        'IBAN does not match bank-specific format',
        { bankCode, iban: cleanIBAN }
      );
    }

    const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);
    const numeric = rearranged
      .split('')
      .map(c => (/\d/.test(c) ? c : (c.charCodeAt(0) - 55).toString()))
      .join('');

    let remainder = 0;
    for (let i = 0; i < numeric.length; i++) {
      remainder = (remainder * 10 + parseInt(numeric[i])) % 97;
    }

    if (remainder !== 1) {
      throw new BankValidationException(
        BankValidationError.INVALID_IBAN_CHECKSUM,
        'Invalid IBAN checksum',
        { iban: cleanIBAN }
      );
    }

    return true;
  } catch (error) {
    if (error instanceof BankValidationException) {
      // You can log the error here if needed
      console.error(`Bank validation error: ${error.code} - ${error.message}`);
    }
    return false;
  }
}

/**
 * Validates a Moroccan RIB (Relevé d'Identité Bancaire).
 *
 * This function checks if the provided RIB is valid by performing the following steps:
 * 1. Cleans the RIB by removing spaces and hyphens.
 * 2. Extracts the bank code and verifies it against a list of active Moroccan banks.
 * 3. Checks the length and format of the RIB against bank-specific rules.
 * 4. Calculates the expected key using the MOD 97-10 algorithm and compares it with the actual key.
 *
 * @param rib - The RIB string to validate.
 * @returns `true` if the RIB is valid, `false` otherwise.
 */
export function isValidRIB(rib: string): boolean {
  try {
    const cleanRIB = rib.replace(/[\s-]/g, '');
    const bankCode = cleanRIB.substring(0, 3);
    const bank = MOROCCAN_BANKS.find(b => b.code === bankCode && b.active);

    if (!bank) {
      throw new BankValidationException(
        BankValidationError.BANK_NOT_FOUND,
        'Invalid or inactive bank code',
        { bankCode }
      );
    }

    if (cleanRIB.length !== bank.ribLength) {
      throw new BankValidationException(
        BankValidationError.INVALID_RIB_LENGTH,
        'Invalid RIB length',
        {
          expected: bank.ribLength,
          received: cleanRIB.length,
        }
      );
    }

    if (!bank.ribRegex.test(cleanRIB)) {
      throw new BankValidationException(
        BankValidationError.INVALID_RIB_FORMAT,
        'RIB does not match bank-specific format',
        { bankCode, rib: cleanRIB }
      );
    }

    const payload = cleanRIB.slice(0, -2);
    const actualKey = parseInt(cleanRIB.slice(-2), 10);

    const chunks = [];
    for (let i = 0; i < payload.length; i += 7) {
      chunks.push(parseInt(payload.slice(i, i + 7), 10));
    }

    let remainder = 0;
    for (const chunk of chunks) {
      remainder =
        (remainder * Math.pow(10, chunk.toString().length) + chunk) % 97;
    }

    const expectedKey = (97 - remainder) % 97;

    if (expectedKey !== actualKey) {
      throw new BankValidationException(
        BankValidationError.INVALID_RIB_CHECKSUM,
        'Invalid RIB checksum',
        {
          expected: expectedKey,
          actual: actualKey,
          rib: cleanRIB,
        }
      );
    }

    return true;
  } catch (error) {
    if (error instanceof BankValidationException) {
      console.error(`Bank validation error: ${error.code} - ${error.message}`);
    }
    return false;
  }
}

export function getBankDetails(code: string): BankDetails | undefined {
  try {
    const cleanCode = code.replace(/[\s-]/g, '');
    const bankCode = cleanCode.startsWith('MA')
      ? cleanCode.substring(4, 7)
      : cleanCode.substring(0, 3);

    const bank = MOROCCAN_BANKS.find(b => b.code === bankCode && b.active);

    if (!bank) {
      throw new BankValidationException(
        BankValidationError.BANK_NOT_FOUND,
        'Bank not found or inactive',
        { bankCode }
      );
    }

    return bank;
  } catch (error) {
    if (error instanceof BankValidationException) {
      console.error(`Bank validation error: ${error.code} - ${error.message}`);
    }
    return undefined;
  }
}

/**
 * Gets SWIFT/BIC code with branch support
 */
export function getSwiftCode(
  code: string,
  branch?: string
): string | undefined {
  try {
    const bank = getBankDetails(code);
    if (!bank) {
      throw new BankValidationException(
        BankValidationError.BANK_NOT_FOUND,
        'Bank not found',
        { code }
      );
    }

    if (branch && bank.branches) {
      const branchDetails = bank.branches.find(b => b.code === branch);
      if (!branchDetails) {
        throw new BankValidationException(
          BankValidationError.BRANCH_NOT_FOUND,
          'Branch not found',
          { bankCode: code, branchCode: branch }
        );
      }
      return branchDetails.swift;
    }

    return bank.swift;
  } catch (error) {
    if (error instanceof BankValidationException) {
      console.error(`Bank validation error: ${error.code} - ${error.message}`);
    }
    return undefined;
  }
}

/**
 * Converts a given amount in Moroccan Dirhams (MAD) to its French words representation.
 *
 * @param amount - The amount in Moroccan Dirhams to be converted.
 * @returns The French words representation of the given amount.
 *
 * @example
 * ```typescript
 * madToWords(1234); // "mille deux cent trente-quatre dirhams"
 * madToWords(0); // "zéro dirhams"
 * madToWords(-45.67); // "moins quarante-cinq dirhams et soixante-sept centimes"
 * ```
 */
export function madToWords(amount: number): string {
  try {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new BankValidationException(
        BankValidationError.INVALID_AMOUNT,
        'Amount must be a valid number',
        { providedAmount: amount }
      );
    }

    const units = [
      '',
      'un',
      'deux',
      'trois',
      'quatre',
      'cinq',
      'six',
      'sept',
      'huit',
      'neuf',
    ];
    const teens = [
      'dix',
      'onze',
      'douze',
      'treize',
      'quatorze',
      'quinze',
      'seize',
      'dix-sept',
      'dix-huit',
      'dix-neuf',
    ];
    const tens = [
      '',
      'dix',
      'vingt',
      'trente',
      'quarante',
      'cinquante',
      'soixante',
      'soixante-dix',
      'quatre-vingt',
      'quatre-vingt-dix',
    ];

    const convertLessThanThousand = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += (n >= 200 ? units[Math.floor(n / 100)] + ' ' : '') + 'cent';
        n %= 100;
        if (n > 0) result += ' ';
      }

      if (n >= 80 && n < 100) {
        result += 'quatre-vingt' + (n === 80 ? '' : '-' + units[n - 80]);
      } else if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        if (n % 10 > 0) result += '-' + units[n % 10];
      } else if (n >= 10) {
        result += teens[n - 10];
      } else if (n > 0) {
        result += units[n];
      }

      return result;
    };

    if (amount === 0) return 'zéro dirhams';
    let result = '';
    const isNegative = amount < 0;
    amount = Math.abs(amount);

    const whole = Math.floor(amount);
    const cents = Math.round((amount - whole) * 100);

    if (whole > 0) {
      const millions = Math.floor(whole / 1_000_000);
      const thousands = Math.floor((whole % 1_000_000) / 1_000);
      const remainder = whole % 1_000;

      if (millions > 0) {
        result +=
          convertLessThanThousand(millions) +
          ' million' +
          (millions > 1 ? 's ' : ' ');
      }

      if (thousands > 0) {
        result +=
          thousands === 1
            ? 'mille '
            : convertLessThanThousand(thousands) + ' mille ';
      }

      if (remainder > 0) {
        result += convertLessThanThousand(remainder);
      }

      result += ' dirham' + (whole !== 1 ? 's' : '');
    }

    if (cents > 0) {
      if (whole > 0) result += ' et ';
      result +=
        convertLessThanThousand(cents) + ' centime' + (cents !== 1 ? 's' : '');
    }

    return (isNegative ? 'moins ' : '') + result.trim();
  } catch (error) {
    if (error instanceof BankValidationException) {
      console.error(`Bank validation error: ${error.code} - ${error.message}`);
      return 'erreur de conversion';
    }
    return 'erreur de conversion';
  }
}
