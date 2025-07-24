import { LicensePlateError } from '../types/license-plate';
import { LICENSE_PLATE_DIPLOMATIC_REGION } from './regions';

/**
 * Comprehensive Moroccan License Plate Validation Module
 */
export enum LicensePlateType {
  NORMAL = 'NORMAL',
  TRAILER = 'TRAILER',
  DEALER_W18 = 'DEALER_W18',
  TEMPORARY_WW = 'TEMPORARY_WW',
  PUBLIC = 'PUBLIC',
  DIPLOMATIC = 'DIPLOMATIC',
  INTERNATIONAL_COOPERATIVE = 'INTERNATIONAL_COOPERATIVE',
  GOVERNMENT = 'GOVERNMENT',
  CIVIL_PROTECTION = 'CIVIL_PROTECTION',
  POLICE = 'POLICE',
  AUXILIARY_FORCES = 'AUXILIARY_FORCES',
  MILITARY = 'MILITARY',
  CROISSANT_ROUGE = 'CROISSANT_ROUGE',
  UNKNOWN = 'UNKNOWN',
}

export const validLetters = [
  'ا',
  'أ',
  'ب',
  'د',
  'ﻫ',
  'ه',
  'و',
  'ط',
  'ي',
  'ك',
  'ل',
  'م',
  'ن',
  'ص',
  'ف',
  'ر',
  'س',
  'A',
  'B',
  'D',
  'H',
  'E',
  'T',
  'Y',
  'K',
  'L',
  'M',
  'N',
  'C',
  'F',
  'R',
  'S',
];

/**
 * Regular expressions for all license plate types.
 */
export const PATTERNS: Record<LicensePlateType, RegExp> = {
  NORMAL: /^[1-9][0-9]{0,4}\s*[-|]\s*\p{L}\s*[-|]\s*[0-9]{1,2}$/u,
  TRAILER: /^\s*\d{4}\s*-\s*\d{2}\s*$/,
  DEALER_W18: /^[1-9][0-9]{1,4}\s*W\s*18$/,
  TEMPORARY_WW: /^[1-9][0-9]{0,5}\s*WW$/,
  PUBLIC: /^[1-9][0-9]{0,5}\s*(المغرب|maroc|MAROC|m|M|م)$/,
  DIPLOMATIC:
    /^C\s*[.| ]?\s*D\s*[-|]\s*[0-9]{1,3}\s*[-|]\s*[0-9]{1,3}(\s*[-|]\s*ه\s*د)?$/,
  INTERNATIONAL_COOPERATIVE:
    /^C\s*[.| ]?\s*I\s*[-|]\s*(?:[1-9][0-9]{0,3})\s*[-|]\s*(?:0[1-9]|[1-9][0-9])(\s*[-|]\s*ت\s*[.| ]?\s*د)?$/,
  GOVERNMENT: /^[0-9]{6}\s*(j|J|ج)$/,
  CIVIL_PROTECTION: /^[0-9]{6}\s*و\s*م$/,
  POLICE: /^[0-9]{6}\s*ش$/,
  AUXILIARY_FORCES: /^[0-9]{6}\s*ق\s*س$/,
  MILITARY: /^[0-9]{6}\s*ق\s*م\s*م$/,
  CROISSANT_ROUGE: /^[0-9]{6}\s*[ه|هـ]\s*[أ|ا]$/,
  UNKNOWN: /^.*$/,
} as const;

/**
 * Error codes for license plate validation errors
 */
export enum LicensePlateErrorCode {
  REQUIRED = 'REQUIRED',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_REGION = 'INVALID_REGION',
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_LENGTH = 'INVALID_LENGTH',
  INVALID_SEQUENCE = 'INVALID_SEQUENCE',
  INVALID_CHARACTERS = 'INVALID_CHARACTERS',
}
/**
 * Error messages for license plate validation errors
 */
export const ERRORS: Record<LicensePlateErrorCode, LicensePlateError> = {
  REQUIRED: {
    code: LicensePlateErrorCode.REQUIRED,
    message: 'License plate is required',
  },
  INVALID_FORMAT: {
    code: LicensePlateErrorCode.INVALID_FORMAT,
    message: 'License plate format is invalid',
  },
  INVALID_REGION: {
    code: LicensePlateErrorCode.INVALID_REGION,
    message: 'License plate region is invalid',
  },
  INVALID_TYPE: {
    code: LicensePlateErrorCode.INVALID_TYPE,
    message: 'License plate type is invalid',
  },
  INVALID_LENGTH: {
    code: LicensePlateErrorCode.INVALID_LENGTH,
    message: 'License plate length is invalid',
  },
  INVALID_SEQUENCE: {
    code: LicensePlateErrorCode.INVALID_SEQUENCE,
    message: 'License plate sequence is invalid',
  },
  INVALID_CHARACTERS: {
    code: LicensePlateErrorCode.INVALID_CHARACTERS,
    message: 'License plate contains invalid characters',
  },
} as const;

export const RULES: Record<
  LicensePlateType,
  {
    separator: RegExp;
    checks: Array<{
      validate: (val: string) => boolean;
      error: LicensePlateError;
    }>;
    name: string;
    hasRegion: boolean;
  }
> = {
  [LicensePlateType.NORMAL]: {
    separator: /[-|]/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 99999,
        error: ERRORS.INVALID_SEQUENCE,
      },
      {
        validate: val => validLetters.includes(val),
        error: ERRORS.INVALID_CHARACTERS,
      },
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 89,
        error: ERRORS.INVALID_REGION,
      },
    ],
    name: 'Normal License Plate',
    hasRegion: true,
  },
  [LicensePlateType.TRAILER]: {
    separator: /[-|]/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 9999,
        error: ERRORS.INVALID_SEQUENCE,
      },
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 99,
        error: ERRORS.INVALID_SEQUENCE,
      },
    ],
    name: 'Trailer License Plate',
    hasRegion: false,
  },
  [LicensePlateType.DEALER_W18]: {
    separator: /[wW]/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 99999,
        error: ERRORS.INVALID_SEQUENCE,
      },
    ],
    name: 'Temporary W18 Dealer License Plate',
    hasRegion: false,
  },
  [LicensePlateType.TEMPORARY_WW]: {
    separator: /[wW]/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999999,
        error: ERRORS.INVALID_SEQUENCE,
      },
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 99,
        error: ERRORS.INVALID_REGION,
      },
    ],
    name: 'Temporary WW License Plate',
    hasRegion: false,
  },
  [LicensePlateType.PUBLIC]: {
    separator: /[المغرب|maroc|MAROC|m|M]/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999999,
        error: ERRORS.INVALID_SEQUENCE,
      },
    ],
    name: 'Public or Semi Public License Plate',
    hasRegion: false,
  },
  [LicensePlateType.DIPLOMATIC]: {
    separator: /[-|]/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999,
        error: ERRORS.INVALID_SEQUENCE,
      },
      {
        validate: val =>
          Object.keys(LICENSE_PLATE_DIPLOMATIC_REGION).includes(
            String(parseInt(val))
          ),
        error: ERRORS.INVALID_REGION,
      },
    ],
    name: 'Diplomatic License Plate',
    hasRegion: true,
  },
  [LicensePlateType.INTERNATIONAL_COOPERATIVE]: {
    separator: /[-|]/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999,
        error: ERRORS.INVALID_SEQUENCE,
      },
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 99,
        error: ERRORS.INVALID_REGION,
      },
    ],
    name: 'International Cooperative License Plate',
    hasRegion: false,
  },
  [LicensePlateType.GOVERNMENT]: {
    separator: /\s+/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999999,
        error: ERRORS.INVALID_SEQUENCE,
      },
    ],
    name: 'Government License Plate',
    hasRegion: false,
  },
  [LicensePlateType.CIVIL_PROTECTION]: {
    separator: /\s+/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999999,
        error: ERRORS.INVALID_SEQUENCE,
      },
    ],
    name: 'Civil Protection License Plate',
    hasRegion: false,
  },
  [LicensePlateType.POLICE]: {
    separator: /\s+/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999999,
        error: ERRORS.INVALID_SEQUENCE,
      },
    ],
    name: 'Police License Plate',
    hasRegion: false,
  },
  [LicensePlateType.AUXILIARY_FORCES]: {
    separator: /\s+/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999999,
        error: ERRORS.INVALID_SEQUENCE,
      },
    ],
    name: 'Auxiliary Forces License Plate',
    hasRegion: false,
  },
  [LicensePlateType.MILITARY]: {
    separator: /\s+/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999999,
        error: ERRORS.INVALID_SEQUENCE,
      },
    ],
    name: 'Military License Plate',
    hasRegion: false,
  },
  [LicensePlateType.CROISSANT_ROUGE]: {
    separator: /\s+/,
    checks: [
      {
        validate: val => parseInt(val) >= 1 && parseInt(val) <= 999999,
        error: ERRORS.INVALID_SEQUENCE,
      },
    ],
    name: 'Croissant Rouge License Plate',
    hasRegion: false,
  },
  UNKNOWN: {
    separator: /[-|]/,
    checks: [],
    name: 'Unknown License Plate',
    hasRegion: false,
  },
};
