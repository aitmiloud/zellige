// TODO This is for companies
export enum ICEErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_SEQUENCE = 'INVALID_SEQUENCE',
  PARTIALLY_VALID = 'PARTIALLY_VALID',
}

/**
 * Represents an error that occurred during CIN validation
 */
export interface ICEError {
  /** The type of error that occurred */
  code: ICEErrorCode;
  /** Detailed error message */
  message: string;
}

/**
 * Result of validating a CIN
 */
export interface ICEValidationResult {
  /** Whether the ICE is valid */
  isValid: boolean;
  /** Array of validation errors if any */
  errors: ICEError[];
  /** Additional metadata extracted from the ICE */
  metadata?: {
    /** Company code */
    company?: string;
    /** Company's establishments */
    establishments?: string;
    /** Checksum for error detection */
    checksum?: string;
  };
}
