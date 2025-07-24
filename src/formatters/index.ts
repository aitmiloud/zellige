/**
 * Formatter module for various data formatting operations
 * @module formatters
 */

/**
 * Import CIN formatting utilities
 */
import {
  formatCIN,
  getAllCINFormats,
  CINFormatter,
  CINFormattingError,
} from './cin';

/**
 * Import ICE formatting utilities
 */
import {
  formatICE,
  formatICEWhileTyping,
  unformatICE,
  ICEFormattingError,
} from './ice';

/**
 * Namespace containing all CIN-related formatting functions
 */
const cin = {
  format: formatCIN,
  Formatter: CINFormatter,
  FormattingError: CINFormattingError,
};

/**
 * Namespace containing all ICE-related formatting functions
 */
const ice = {
  format: formatICE,
  formatWhileTyping: formatICEWhileTyping,
  unformat: unformatICE,
  FormattingError: ICEFormattingError,
};

/**
 * Collection of all formatter namespaces
 */
export const formatters = {
  cin,
  ice,
};

/**
 * Default export providing access to all formatter functions
 * @default
 */
export default formatters;

/**
 * Direct exports of CIN formatting functions and classes for granular imports
 */
export { formatCIN, getAllCINFormats, CINFormatter, CINFormattingError };

/**
 * Direct exports of ICE formatting functions and classes for granular imports
 */
export { formatICE, formatICEWhileTyping, unformatICE, ICEFormattingError };
