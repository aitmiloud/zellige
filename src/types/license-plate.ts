import {
  LicensePlateErrorCode,
  LicensePlateType,
} from '../constants/license-plate';

export type LicensePlateInput = string | null | undefined;

export interface LicensePlateError {
  code: LicensePlateErrorCode;
  message: string;
}

export interface LicensePlateValidationResult {
  isValid: boolean;
  error?: LicensePlateError;
  metadata?: {
    type?: LicensePlateType | string;
    name?: string;
    regionCode?: string | number;
  };
}

export interface LicensePlateDetails {
  isValid: boolean;
  type: LicensePlateType;
  registration: number;
  series: string;
  regionCode: number;
  region: string;
  raw: string;
}
