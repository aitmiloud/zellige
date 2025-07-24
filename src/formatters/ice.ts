import { ICEFormatOptions } from '../types/ice';
import { validateICE } from '../validators/ice';

export enum ICEFormattingErrorCode {
  INVALID_INPUT_TYPE = 'ICE_FORMAT_001',
  INVALID_SEPARATOR = 'ICE_FORMAT_002',
  INVALID_PREFIX = 'ICE_FORMAT_003',
  INVALID_GROUPING = 'ICE_FORMAT_004',
}

/**
 * Custom error class for ICE number formatting issues.
 *
 * This error is thrown when an ICE number cannot be formatted due to invalid input,
 * incorrect options, or other formatting-related problems.
 *
 * @property {ICEFormattingErrorCode} code - A machine-readable error code.
 * @property {string} message - A human-readable error message.
 * @property {Record<string, any>} [details] - Additional context about the error.
 *
 * @example
 * throw new ICEFormattingError(ICEFormattingErrorCode.INVALID_SEPARATOR, 'Invalid separator provided', { separator: '12' });
 */
export class ICEFormattingError extends Error {
  constructor(
    public code: ICEFormattingErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ICEFormattingError';
  }
}

/**
 * Formats a Moroccan ICE (Identifiant Commun de l'Entreprise) number for display.
 *
 * Validates the input ICE number, applies optional formatting rules,
 * and returns a human-readable string. It supports custom separators, digit grouping,
 * and an optional "ICE" prefix.
 *
 * @param ice - The ICE number to format (must be a valid 15-digit string).
 * @param options - Formatting options:
 *   - `separator`: Character to separate components (default: space).
 *   - `prefix`: Whether to add an "ICE" prefix (default: false).
 *   - `groupCompanyDigits`: Whether to group the company identifier into 3-digit chunks (default: false).
 *
 * @returns The formatted ICE number (e.g., "123 456789 0001 31" or "ICE 123-456-789-0001-31").
 *
 * @throws {ICEFormattingError} If the input ICE is invalid or the separator is invalid.
 *
 * @example
 * formatICE('123456789000131'); // "123456789 0001 31"
 * formatICE('123456789000131', { separator: '-', prefix: true }); // "ICE 123456789-0001-31"
 * formatICE('123456789000131', { groupCompanyDigits: true }); // "123 456 789 0001 31"
 */
export function formatICE(ice: string, options: ICEFormatOptions = {}): string {
  // Validate and sanitize first
  const validation = validateICE(ice);
  if (!validation.isValid) {
    throw new ICEFormattingError(
      ICEFormattingErrorCode.INVALID_INPUT_TYPE,
      'Cannot format invalid ICE number',
      { input: ice, validationResult: validation }
    );
  }

  const { company, establishment, control } = validation.components!;
  const separator = options.separator || ' ';

  // Validate separator
  if (separator.length > 1 || /\d/.test(separator)) {
    throw new ICEFormattingError(
      ICEFormattingErrorCode.INVALID_SEPARATOR,
      'Separator must be a single non-digit character',
      { separator }
    );
  }

  let formatted = '';

  // Handle company digit grouping (9 digits)
  if (options.groupCompanyDigits) {
    formatted += [
      company.substring(0, 3),
      company.substring(3, 6),
      company.substring(6, 9),
    ].join(separator);
  } else {
    formatted += company;
  }

  // Add establishment and control
  formatted += `${separator}${establishment}${separator}${control}`;

  // Add optional "ICE" prefix
  if (options.prefix) {
    formatted = `ICE${separator}${formatted}`;
  }

  return formatted;
}

/**
 * Converts a formatted ICE number into its raw numeric representation.
 *
 * Removes all non-digit characters (e.g., spaces, hyphens, slashes)
 * and any "ICE" prefix (case-insensitive) from the input string.
 *
 * @param ice - The formatted ICE number (e.g., "ICE 123-456/789.0001_31").
 * @returns The raw ICE number as a 15-digit string (e.g., "123456789000131").
 *
 * @example
 * unformatICE('ICE 123-456/789.0001_31'); // Returns "123456789000131"
 * unformatICE('１２３４５６７８９０００１３１'); // Returns "123456789000131"
 */
export function unformatICE(ice: string): string {
  // Remove all non-digit characters and "ICE" prefix
  return ice
    .replace(/^ICE\D*/i, '') // Case-insensitive prefix removal
    .replace(/\D/g, ''); // Remove remaining non-digits
}

/**
 * Formats an ICE number dynamically as the user types, ensuring readability and correctness.
 *
 * Designed for real-time input fields, automatically adding separators
 * as the user types. It supports partial ICE numbers and ensures the formatted output
 * adheres to the standard ICE structure.
 *
 * @param {string} input - The raw or partially formatted ICE number input.
 * @param {number} [maxLength=15] - The maximum length of the ICE number (default: 15).
 * @returns {string} - The dynamically formatted ICE number with appropriate separators.
 *
 * @example
 * formatICEWhileTyping('123456789'); // Returns "123 456 789"
 * formatICEWhileTyping('123456789000131'); // Returns "123 456 789 0001 31"
 */
export function formatICEWhileTyping(
  input: string,
  maxLength: number = 15
): string {
  const clean = unformatICE(input).slice(0, maxLength);

  // Format partial numbers
  return clean
    .replace(/(\d{3})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1 $2 $3 $4 $5') // Full format
    .replace(/(\d{9})(\d{4})/, '$1 $2') // Company + establishment
    .replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') // Partial company
    .trim();
}
