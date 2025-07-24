import { ICEComponents } from '../types/ice';
import { validateICE } from '../validators/ice';

export enum ICEExtractionErrorCode {
  INVALID_INPUT_TYPE = 'ICE_EXTRACT_001',
  MISSING_COMPONENTS = 'ICE_EXTRACT_002',
  INVALID_COMPONENT_LENGTH = 'ICE_EXTRACT_003',
}

/**
 * Custom error class for ICE number components extraction issues.
 *
 * This error is thrown when an ICE number components cannot be extracted due to invalid input,
 * incorrect options, or other extraction-related problems.
 *
 * @property {ICEFormattingErrorCode} code - A machine-readable error code.
 * @property {string} message - A human-readable error message.
 * @property {Record<string, any>} [details] - Additional context about the error.
 *
 * @example
 * throw new ICEExtractionError(ICEExtractionErrorCode.INVALID_INPUT_TYPE, 'Cannot extract elements from invalid ICE number', { input, validationResult: validation });
 */
export class ICEExtractionError extends Error {
  constructor(
    public code: ICEExtractionErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ICEExtractionError';
  }
}

/**
 * Extracts the components of a Moroccan ICE number.
 *
 * @param {string} input - The ICE number (raw or formatted).
 * @returns {Object} - An object containing the extracted components:
 *   - company: The 9-digit company identifier.
 *   - establishment: The 4-digit establishment identifier.
 *   - checksum: The 2-digit control characters.
 *
 * @throws {ICEExtractionError} If the input is invalid or cannot be extracted.
 */
export function extractICEComponents(input: string): ICEComponents {
  // Validate and sanitize the input
  const validation = validateICE(input);
  if (!validation.isValid) {
    throw new ICEExtractionError(
      ICEExtractionErrorCode.INVALID_INPUT_TYPE,
      'Cannot extract elements from invalid ICE number',
      { input, validationResult: validation }
    );
  }

  // Ensure components are present
  if (!validation.components) {
    throw new ICEExtractionError(
      ICEExtractionErrorCode.MISSING_COMPONENTS,
      'ICE components are missing',
      { input }
    );
  }

  const { company, establishment, control } = validation.components;

  // Validate component lengths
  if (
    company.length !== 9 ||
    establishment.length !== 4 ||
    control.length !== 2
  ) {
    throw new ICEExtractionError(
      ICEExtractionErrorCode.INVALID_COMPONENT_LENGTH,
      'ICE components have invalid lengths',
      { company, establishment, control }
    );
  }

  return {
    company,
    establishment,
    control,
  };
}
