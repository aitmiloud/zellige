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
 *
 * @param input License plate string
 * @returns Normalized license plate string
 */

export function normalizeInput(input: LicensePlateInput): string | null {
  if (!input) return null;
  if (typeof input !== 'string' || input.trim().length === 0) return null;

  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s*-\s*/g, ' - ')
    .toUpperCase();
}

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

function getType(input: string): LicensePlateType {
  return (Object.keys(PATTERNS).find(key =>
    PATTERNS[key as keyof typeof PATTERNS].test(input)
  ) || 'UNKNOWN') as LicensePlateType;
}

function extractRegion(
  type: LicensePlateType,
  parts: string[]
): number | undefined {
  if (!parts.length) return undefined;
  // You can adjust logic here if region code is not always last
  const code = parseInt(parts[parts.length - 1]);
  return isNaN(code) ? undefined : code;
}

/**
 * Validates license plate format
 * @param input License plate string
 * @returns Validation result
 */
export function validateLicensePlate(
  input: LicensePlateInput
): LicensePlateValidationResult {
  const returnValue: LicensePlateValidationResult = {
    isValid: false,
    error: ERRORS.INVALID_FORMAT,
  };
  const normalizedInput = normalizeInput(input);

  if (!normalizedInput) {
    return returnValue;
  }
  const type: LicensePlateType = getType(normalizedInput);
  console.log('🔰 type:', type);

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
    regionCode = extractRegion(type, parts);
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

export function isValidLicensePlate(input: LicensePlateInput): boolean {
  const result = validateLicensePlate(input);
  return result.isValid;
}

export function getLicensePlateType(
  input: LicensePlateInput
): LicensePlateType | null {
  const normalizedInput = normalizeInput(input);
  if (!normalizedInput) return null;
  if (validateLicensePlate(normalizedInput).isValid) {
    return getType(normalizedInput);
  }
  return LicensePlateType.UNKNOWN;
}

export function getLicensePlateRegion(
  input: LicensePlateInput
): { name: string; code: number } | null {
  const normalizedInput = normalizeInput(input);
  if (!normalizedInput) return null;

  const type = getType(normalizedInput);
  if (type === LicensePlateType.UNKNOWN) return null;

  const rule = RULES[type];
  if (!rule || !rule.hasRegion) return null;

  const parts = splitParts(normalizedInput, type, rule.separator);
  const regionCode = extractRegion(type, parts);
  if (regionCode === undefined || isNaN(regionCode)) return null;
  return type === LicensePlateType.NORMAL
    ? { name: LICENSE_PLATE_REGIONS[regionCode], code: regionCode }
    : { name: LICENSE_PLATE_DIPLOMATIC_REGION[regionCode], code: regionCode };
}

export function getLicensePlateMetadata(
  input: LicensePlateInput
): LicensePlateValidationResult['metadata'] | null {
  const result = validateLicensePlate(input);
  return result.metadata;
}

export function getLicensePlateName(input: LicensePlateInput): string | null {
  const metadata = getLicensePlateMetadata(input);
  return metadata ? metadata.name || null : null;
}

export function getAllRegions(): { [key: number]: string } {
  return LICENSE_PLATE_REGIONS;
}

export function getAllLicensePlateTypes(): LicensePlateType[] {
  return Object.values(LicensePlateType).filter(
    type => type !== LicensePlateType.UNKNOWN
  );
}
