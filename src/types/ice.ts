export interface ICEValidationResult {
  /**
   * Whether the ICE number is valid
   */
  isValid: boolean;

  /**
   * Sanitized version of the input (digits only)
   */
  sanitized: string;

  /**
   * Parsed components of the ICE number
   */
  components?: ICEComponents;

  /**
   * Error details if validation failed
   */
  error?: ICEValidationError;
}

export interface ICEValidationError {
  /** Error code from ICEValidationError enum */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional context about the error */
  details?: Record<string, any>;
}

export interface ICEComponents {
  /** First 9 digits - Company identifier */
  company: string;
  /** Next 4 digits - Establishment identifier */
  establishment: string;
  /** Last 2 digits - Control characters */
  control: string;
}

export interface ICEGenerationOptions {
  /**
   * Whether to format the ICE number for display.
   */
  format?: boolean;

  /**
   * The separator to use between components when formatting the ICE number.
   */
  separator?: string;

  /**
   * Whether to include the "ICE" prefix when formatting the ICE number.
   */
  prefix?: boolean;

  /**
   * Whether to group the company identifier digits when formatting the ICE number.
   */
  groupCompanyDigits?: boolean;
}

export interface ICEFormatOptions {
  /**
   * The separator to use between components when formatting the ICE number.
   */
  separator?: string;

  /**
   * Whether to include the "ICE" prefix when formatting the ICE number.
   */
  prefix?: boolean;

  /**
   * Whether to group the company identifier digits when formatting the ICE number.
   */
  groupCompanyDigits?: boolean;
}
