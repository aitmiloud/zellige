import { extractICEComponents } from '../../src';
import {
  ICEExtractionError,
  ICEExtractionErrorCode,
} from '../../src/extractors/ice';
import * as ICEValidator from '../../src/validators/ice';

jest.mock('../../src/validators/ice', () => ({
  validateICE: jest.fn().mockImplementation((input: string) => {
    return {
      isValid: true,
      components: {
        company: '123456789',
        establishment: '0001',
        control: '31',
      },
      sanitized: input.replace(/\D/g, ''),
    };
  }),
}));

const mockValidateICE = jest.spyOn(ICEValidator, 'validateICE');

describe('ICE extractors', () => {
  describe('extractICEComponents', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should extract elements from valid ICE number', () => {
      const result = extractICEComponents('123456789000131');
      expect(result).toEqual({
        company: '123456789',
        establishment: '0001',
        control: '31',
      });
    });

    test('should not extract elements from invalid ICE number', () => {
      mockValidateICE.mockImplementationOnce(() => ({
        isValid: false,
        error: {
          code: 'TEST',
          message: 'Cannot extract elements from invalid ICE number',
        },
        sanitized: '123',
      }));
      expect(() => extractICEComponents('123000131')).toThrow(
        new ICEExtractionError(
          ICEExtractionErrorCode.INVALID_INPUT_TYPE,
          'Cannot extract elements from invalid ICE number'
        )
      );
    });

    test('ICE components are missing', () => {
      mockValidateICE.mockImplementationOnce(() => ({
        isValid: true,
        components: undefined,
        sanitized: '123456789000131',
      }));
      expect(() => extractICEComponents('123000131')).toThrow(
        new ICEExtractionError(
          ICEExtractionErrorCode.MISSING_COMPONENTS,
          'ICE components are missing',
          undefined
        )
      );
    });

    test('ICE components have invalid lengths', () => {
      mockValidateICE.mockImplementationOnce(() => ({
        isValid: true,
        components: {
          company: '123',
          establishment: '0001',
          control: '31',
        },
        sanitized: '123000131',
      }));
      expect(() => extractICEComponents('123000131')).toThrow(
        new ICEExtractionError(
          ICEExtractionErrorCode.INVALID_COMPONENT_LENGTH,
          'ICE components have invalid lengths',
          { company: '123', establishment: '0001', control: '31' }
        )
      );
    });
  });
});
