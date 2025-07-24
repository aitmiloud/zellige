import {
  formatICE,
  formatICEWhileTyping,
  ICEFormattingError,
  unformatICE,
} from '../../src';

describe('ICE formatter', () => {
  describe('formatICE', () => {
    const validICE = '123456789000161';

    test('should formats ICE with default options', () => {
      const formatted = formatICE(validICE);
      expect(formatted).toBe('123456789 0001 61');
    });
    test('should formats ICE with custom separator', () => {
      const formatted = formatICE(validICE, { separator: '-' });
      expect(formatted).toBe('123456789-0001-61');
    });
    test('should formats ICE with prefix', () => {
      const formatted = formatICE(validICE, { prefix: true });
      expect(formatted).toBe('ICE 123456789 0001 61');
    });
    test('should formats ICE with grouped company digits', () => {
      const formatted = formatICE(validICE, { groupCompanyDigits: true });
      expect(formatted).toBe('123 456 789 0001 61');
    });
    test('should formats ICE with all options', () => {
      const formatted = formatICE(validICE, {
        separator: '/',
        prefix: true,
        groupCompanyDigits: true,
      });
      expect(formatted).toBe('ICE/123/456/789/0001/61');
    });
    test('should throws error for invalid separator', () => {
      expect(() => formatICE(validICE, { separator: '12' })).toThrow(
        ICEFormattingError
      );
      expect(() => formatICE(validICE, { separator: '1' })).toThrow(
        ICEFormattingError
      );
    });
    test('should throws error for invalid ICE input', () => {
      expect(() => formatICE('1234567890001')).toThrow(ICEFormattingError);
      expect(() => formatICE('123456789ABCDEF')).toThrow(ICEFormattingError);
    });
  });

  describe('unformatICE', () => {
    test('should removes "ICE" prefix and non-digit characters', () => {
      const formatted = 'ICE 123-456/789.0001_61';
      const result = unformatICE(formatted);
      expect(result).toBe('123456789000161');
    });

    test('should handles case-insensitive "ICE" prefix', () => {
      const formatted = 'ice 123-456/789.0001_61';
      const result = unformatICE(formatted);
      expect(result).toBe('123456789000161');
    });

    test('should removes only non-digit characters without prefix', () => {
      const formatted = '123 456-789/0001.61';
      const result = unformatICE(formatted);
      expect(result).toBe('123456789000161');
    });

    test('should handles full-width numbers', () => {
      const formatted = '1 2 3 4 5 6 7 8 9 0 0 0 1 6 1';
      const result = unformatICE(formatted);
      expect(result).toBe('123456789000161');
    });

    test('should returns empty string for invalid input', () => {
      const formatted = 'ICE ABC-XYZ/123.456_789';
      const result = unformatICE(formatted);
      expect(result).toBe('123456789');
    });

    test('should andles empty input', () => {
      const formatted = '';
      const result = unformatICE(formatted);
      expect(result).toBe('');
    });

    test('should handles input with only non-digit characters', () => {
      const formatted = 'ICE -/._';
      const result = unformatICE(formatted);
      expect(result).toBe('');
    });

    test('should handles input with only "ICE" prefix', () => {
      const formatted = 'ICE';
      const result = unformatICE(formatted);
      expect(result).toBe('');
    });
  });

  describe('formatICEWhileTyping', () => {
    test('should formats partial company identifier', () => {
      expect(formatICEWhileTyping('123')).toBe('123');
      expect(formatICEWhileTyping('123456')).toBe('123456');
      expect(formatICEWhileTyping('123456789')).toBe('123 456 789');
    });

    test('should formats company and establishment identifiers', () => {
      expect(formatICEWhileTyping('123456789000')).toBe('123 456 789000');
      expect(formatICEWhileTyping('1234567890001')).toBe('123 456 789 0001');
    });

    test('should formats full ICE number', () => {
      expect(formatICEWhileTyping('123456789000161')).toBe(
        '123 456 789 0001 61'
      );
    });

    test('should handles input with separators', () => {
      expect(formatICEWhileTyping('123 456 789 0001 61')).toBe(
        '123 456 789 0001 61'
      );
      expect(formatICEWhileTyping('123-456-789-0001-61')).toBe(
        '123 456 789 0001 61'
      );
    });

    test('should respects maxLength parameter', () => {
      expect(formatICEWhileTyping('123456789000161', 10)).toBe('123 456 7890');
      expect(formatICEWhileTyping('123456789000161', 13)).toBe(
        '123 456 789 0001'
      );
    });

    test('should trims excess input beyond maxLength', () => {
      expect(formatICEWhileTyping('12345678900016112345', 15)).toBe(
        '123 456 789 0001 61'
      );
    });

    test('should handles empty input', () => {
      expect(formatICEWhileTyping('')).toBe('');
    });

    test('should handles non-numeric characters', () => {
      expect(formatICEWhileTyping('123abc456789000161')).toBe(
        '123 456 789 0001 61'
      );
      expect(formatICEWhileTyping('123-456-789-0001-61')).toBe(
        '123 456 789 0001 61'
      );
    });
  });
});
