/**
 * Extractor module for various data extraction operations
 * @module extractors
 */

/**
 * Import CIN extraction utilities
 */
import { extractCINMetadata } from './cin';

/**
 * Import ICE extraction utilities
 */
import { extractICEComponents } from './ice';

/**
 * Namespace containing all CIN-related extraction functions
 */
const cin = {
  extract: extractCINMetadata,
};

/**
 * Namespace containing all ICE-related extraction functions
 */
const ice = {
  extract: extractICEComponents,
};

/**
 * Collection of all extractor namespaces
 */
export const extractors = {
  cin,
  ice,
};

/**
 * Default export providing access to all extractor functions
 * @default
 */
export default extractors;

/**
 * Direct exports of CIN extraction functions for granular imports
 */
export { extractCINMetadata };

/**
 * Direct exports of ICE extraction functions for granular imports
 */
export { extractICEComponents };
