import {
  ICE_LENGTH,
  COMPANY_LENGTH,
  ESTABLISHMENT_LENGTH,
  CONTROL_LENGTH,
} from '../constants/ice';
import { formatICE } from '../formatters';
import type { ICEGenerationOptions, ICEValidationResult } from '../types/ice';

// ICE Error codes
export enum ICEValidationErrorCode {
  INVALID_INPUT_TYPE = 'ICE_001',
  INVALID_LENGTH = 'ICE_002',
  NON_NUMERIC_CHARACTERS = 'ICE_003',
  INVALID_CONTROL = 'ICE_004',
}

/**
 * Custom error class for ICE number validations issues.
 *
 * This error is thrown when an ICE number cannot be validated due to invalid input,
 * incorrect options, or other validations-related problems.
 *
 * @property {ICEValidationErrorCode} code - A machine-readable error code.
 * @property {string} message - A human-readable error message.
 * @property {Record<string, any>} [details] - Additional context about the error.
 *
 * @example
 * throw new ICEValidationException(ICEValidationErrorCode.INVALID_INPUT_TYPE, 'Invalid input provided', { input: '12' });
 */
export class ICEValidationException extends Error {
  constructor(
    public code: ICEValidationErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ICEValidationException';
  }
}

/**
 * Validates a Moroccan ICE (Identifiant Commun de l'Entreprise) number
 *
 * @param ice - The ICE number to validate
 * @returns ICEValidationResult with validation details
 * @throws {ICEValidationException} When validation fails
 */
export function validateICE(ice: string): ICEValidationResult {
  try {
    // Sanitize input
    const sanitized = sanitizeICE(ice);

    // Validate ICE length
    if (sanitized.length !== ICE_LENGTH) {
      throw new ICEValidationException(
        ICEValidationErrorCode.INVALID_LENGTH,
        `ICE must be exactly ${ICE_LENGTH} digits`,
        { receivedLength: sanitized.length, sanitized }
      );
    }

    // Validate ICE numeric format
    if (!/^\d+$/.test(sanitized)) {
      throw new ICEValidationException(
        ICEValidationErrorCode.NON_NUMERIC_CHARACTERS,
        'ICE must contain only numeric characters',
        { sanitized }
      );
    }

    // Extract components
    const components = {
      company: sanitized.substring(0, COMPANY_LENGTH),
      establishment: sanitized.substring(
        COMPANY_LENGTH,
        COMPANY_LENGTH + ESTABLISHMENT_LENGTH
      ),
      control: sanitized.substring(
        COMPANY_LENGTH + ESTABLISHMENT_LENGTH,
        ICE_LENGTH
      ),
    };

    // Validate ICE control (placeholder implementation)
    if (!validateControl(sanitized)) {
      throw new ICEValidationException(
        ICEValidationErrorCode.INVALID_CONTROL,
        'Invalid ICE control',
        {
          calculatedControl: calculateControl(sanitized),
          providedControl: components.control,
          sanitized,
        }
      );
    }

    return {
      isValid: true,
      sanitized,
      components,
    };
  } catch (error) {
    if (isICEValidationException(error)) {
      return {
        isValid: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        sanitized: error.details?.sanitized || '',
      };
    }
    return {
      isValid: false,
      error: {
        code: ICEValidationErrorCode.INVALID_INPUT_TYPE,
        message: 'Unexpected validation error',
      },
      sanitized: '',
    };
  }
}

/**
 * Quick check to determine if a string is a valid Moroccan ICE
 *
 * @param cin - The ICE string to check
 * @returns True if the ICE is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidICE('A123456'); // Returns false
 * isValidICE('123456789000001'); // Returns false
 * isValidICE('123456789000057'); // Returns true
 * ```
 */
export function isValidICE(ice: string): boolean {
  return validateICE(ice).isValid;
}

/**
 * Sanitizes ICE input by removing non-digit characters
 * @param ice - ICE to be verified
 * @returns Sanitized ICE
 */
export function sanitizeICE(ice: string): string {
  return ice.replace(/\D/g, '');
}

/**
 * Validates ICE control
 *
 * Note: This uses a temporary MOD 97 validation until official
 * specifications are confirmed. Replace with official algorithm
 * when available.
 * @param ice - ICE to be control validated
 * @returns true if ICE is valid, otherwise false
 */
export function validateControl(ice: string): boolean {
  if (typeof ice !== 'string') {
    return false;
  }
  return calculateControl(ice) === ice.slice(-CONTROL_LENGTH);
}

/**
 * Calculates ICE control (MOD 97)
 * @param ice - ICE to be control calculated
 * @returns Calculated control
 */
export function calculateControl(ice: string): string {
  const payload =
    ice.length === ICE_LENGTH ? ice.slice(0, -CONTROL_LENGTH) : ice;
  const numericValue = BigInt(payload);
  const control = Number(numericValue % 97n);
  return control.toString().padStart(CONTROL_LENGTH, '0');
}

/**
 * Type guard for ICEValidationException
 * @param error - Error to check its type
 * @returns true if error is instance of ICEValidationException, otherwise false
 */
function isICEValidationException(
  error: unknown
): error is ICEValidationException {
  return error instanceof ICEValidationException;
}

/**
 * Generates a valid Moroccan ICE number for testing purposes.
 *
 * @param {ICEGenerationOptions} options - Options for generating the ICE number:
 *   - format: Whether to format the ICE number (default: false).
 *   - separator: The separator to use in formatting (default: space).
 *   - prefix: Whether to include the "ICE" prefix (default: false).
 *   - groupCompanyDigits: Whether to group company digits (default: false).
 * @returns {string} - A valid ICE number, optionally formatted.
 */
export function generateTestICE(options: ICEGenerationOptions = {}): string {
  // Generate random components
  const company = generateRandomDigits(9);
  const establishment = generateRandomDigits(4);
  const payload = `${company}${establishment}`;

  // Calculate control
  const control = calculateControl(payload);

  // Combine into a valid ICE number
  const rawICE = `${payload}${control}`;

  // Format the ICE number if requested
  if (options.format) {
    return formatICE(rawICE, {
      separator: options.separator,
      prefix: options.prefix,
      groupCompanyDigits: options.groupCompanyDigits,
    });
  }

  return rawICE;
}

/**
 * Generates a string of random digits of the specified length.
 */
export function generateRandomDigits(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10); // Random digit (0-9)
  }
  return result;
}
