import { ERRORS, LicensePlateType, RULES } from '../constants/license-plate';
import { PATTERNS } from '../constants/license-plate';
import {
  LICENSE_PLATE_DIPLOMATIC_REGION,
  LICENSE_PLATE_REGIONS,
} from '../constants/regions';
import {
  LicensePlateInput,
  LicensePlateValidationResult,
} from '../types/license-plate';

/**
 * Normalizes a license plate input string by trimming, standardizing spaces, separators, and converting to uppercase.
 *
 * @param {LicensePlateInput} input - The license plate string to normalize.
 * @returns {string | null} The normalized license plate string, or null if input is invalid.
 */
export function sanitizeLicensePlate(input: LicensePlateInput): string | null {
  if (!input) return null;
  if (typeof input !== 'string' || input.trim().length === 0) return null;

  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s*-\s*/g, ' - ')
    .toUpperCase();
}

/**
 * Splits a normalized license plate string into its component parts based on the plate type and separator.
 *
 * @param {string} input - The normalized license plate string.
 * @param {LicensePlateType} type - The type of license plate.
 * @param {RegExp} separator - The separator regex to use for splitting.
 * @returns {string[]} The array of parts extracted from the license plate.
 */
function splitParts(
  input: string,
  type: LicensePlateType,
  separator: RegExp
): string[] {
  if (type === LicensePlateType.NORMAL || type === LicensePlateType.TRAILER)
    return input.split(separator);
  if (
    type === LicensePlateType.GOVERNMENT ||
    type === LicensePlateType.CIVIL_PROTECTION ||
    type === LicensePlateType.POLICE ||
    type === LicensePlateType.AUXILIARY_FORCES ||
    type === LicensePlateType.PUBLIC ||
    type === LicensePlateType.MILITARY
  )
    return [input.split(separator)[0].trim()];
  if (
    type === LicensePlateType.DEALER_W18 ||
    type === LicensePlateType.TEMPORARY_WW
  ) {
    return [input.split(separator)[0].trim()];
  }
  if (
    type === LicensePlateType.INTERNATIONAL_COOPERATIVE ||
    type === LicensePlateType.DIPLOMATIC
  ) {
    const parts = input.split(separator);
    if (parts.length >= 3) return parts.slice(1, 3);

    return parts;
  }

  return [];
}

/**
 * Determines the license plate type by matching the input string against known patterns.
 *
 * @param {string} input - The normalized license plate string.
 * @returns {LicensePlateType} The detected license plate type, or UNKNOWN if no match is found.
 */
function getType(input: string): LicensePlateType {
  return (Object.keys(PATTERNS).find(key =>
    PATTERNS[key as keyof typeof PATTERNS].test(input)
  ) || 'UNKNOWN') as LicensePlateType;
}

/**
 * Extracts the region code from the license plate parts based on the plate type.
 *
 * @param {string[]} parts - The parts of the license plate string.
 * @returns {number | undefined} The region code if found, otherwise undefined.
 */
function extractRegion(parts: string[]): number | undefined {
  if (!parts.length) return undefined;
  const code = parseInt(parts[parts.length - 1]);
  return isNaN(code) ? undefined : code;
}

/**
 * Validates the format and structure of a license plate string.
 *
 * @param {LicensePlateInput} input - The license plate string to validate.
 * @returns {LicensePlateValidationResult} The validation result, including validity, error, and metadata.
 */
export function validateLicensePlate(
  input: LicensePlateInput
): LicensePlateValidationResult {
  const returnValue: LicensePlateValidationResult = {
    isValid: false,
    error: ERRORS.INVALID_FORMAT,
  };
  const normalizedInput = sanitizeLicensePlate(input);

  if (!normalizedInput) {
    return returnValue;
  }
  const type: LicensePlateType = getType(normalizedInput);

  if (!type || type === LicensePlateType.UNKNOWN) {
    returnValue.error = ERRORS.INVALID_TYPE;
    returnValue.metadata = {
      type: LicensePlateType.UNKNOWN,
      name: 'Unknown License Plate Type',
      regionCode: undefined,
    };
    return returnValue;
  }

  const rule = RULES[type];
  if (!rule) {
    returnValue.error = ERRORS.INVALID_TYPE;
    return returnValue;
  }
  const parts = splitParts(normalizedInput, type, rule.separator);

  if (parts.length === 0) {
    returnValue.error = ERRORS.INVALID_FORMAT;
    return returnValue;
  }

  let regionCode: number | undefined = undefined;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    const check = rule.checks[i];

    if (!check.validate(part)) {
      return { isValid: false, error: check.error };
    }
  }

  if (rule.hasRegion) {
    regionCode = extractRegion(parts);
  }

  return {
    isValid: true,
    error: undefined,
    metadata: {
      type,
      name: rule.name,
      regionCode: rule.hasRegion ? regionCode : undefined,
    },
  };
}

/**
 * Checks if a license plate string is valid according to known rules and patterns.
 *
 * @param {LicensePlateInput} input - The license plate string to check.
 * @returns {boolean} True if the license plate is valid, false otherwise.
 */
export function isValidLicensePlate(input: LicensePlateInput): boolean {
  const result = validateLicensePlate(input);
  return result.isValid;
}

/**
 * Returns the type of a license plate if valid, or UNKNOWN/null if invalid or unrecognized.
 *
 * @param {LicensePlateInput} input - The license plate string to analyze.
 * @returns {LicensePlateType | null} The license plate type, or null if input is invalid.
 */
export function getLicensePlateType(
  input: LicensePlateInput
): LicensePlateType | null {
  const normalizedInput = sanitizeLicensePlate(input);
  if (!normalizedInput) return null;
  if (validateLicensePlate(normalizedInput).isValid) {
    return getType(normalizedInput);
  }
  return LicensePlateType.UNKNOWN;
}

/**
 * Retrieves the region name and code from a valid license plate string.
 *
 * @param {LicensePlateInput} input - The license plate string to analyze.
 * @returns {{ name: string; code: number } | null} The region info, or null if not found or invalid.
 */
export function getLicensePlateRegion(
  input: LicensePlateInput
): { name: string; code: number } | null {
  const normalizedInput = sanitizeLicensePlate(input);
  if (!normalizedInput) return null;

  const type = getType(normalizedInput);
  if (type === LicensePlateType.UNKNOWN) return null;

  const rule = RULES[type];
  if (!rule || !rule.hasRegion) return null;

  const parts = splitParts(normalizedInput, type, rule.separator);
  const regionCode = extractRegion(parts);
  if (regionCode === undefined || isNaN(regionCode)) return null;
  return type === LicensePlateType.NORMAL
    ? { name: LICENSE_PLATE_REGIONS[regionCode], code: regionCode }
    : { name: LICENSE_PLATE_DIPLOMATIC_REGION[regionCode], code: regionCode };
}

/**
 * Returns the metadata for a license plate string, including type, name, and region code if available.
 *
 * @param {LicensePlateInput} input - The license plate string to analyze.
 * @returns {LicensePlateValidationResult['metadata'] | null} The metadata object, or null if invalid.
 */
export function getLicensePlateMetadata(
  input: LicensePlateInput
): LicensePlateValidationResult['metadata'] | null {
  const result = validateLicensePlate(input);
  return result.metadata;
}

/**
 * Gets the display name of a license plate type from the input string.
 *
 * @param {LicensePlateInput} input - The license plate string to analyze.
 * @returns {string | null} The license plate type name, or null if not found.
 */
export function getLicensePlateName(input: LicensePlateInput): string | null {
  const metadata = getLicensePlateMetadata(input);
  return metadata ? metadata.name || null : null;
}

/**
 * Returns all available license plate regions as a mapping from code to region name.
 *
 * @returns {{ [key: number]: string }} The mapping of region codes to region names.
 */
export function getAllRegions(): { [key: number]: string } {
  return LICENSE_PLATE_REGIONS;
}

/**
 * Returns all available license plate diplomatic regions as a mapping from code to region name.
 *
 * @returns {{ [key: number]: string }} The mapping of region codes to region names.
 */
export function getAllDiplomaticRegions(): { [key: number]: string } {
  return LICENSE_PLATE_DIPLOMATIC_REGION;
}

/**
 * Returns all known license plate types except UNKNOWN.
 *
 * @returns {LicensePlateType[]} Array of all valid license plate types.
 */
export function getAllLicensePlateTypes(): LicensePlateType[] {
  return Object.values(LicensePlateType).filter(
    type => type !== LicensePlateType.UNKNOWN
  );
}
