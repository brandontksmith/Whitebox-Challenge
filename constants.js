// Client ID Filter for the Rates
const CLIENT_ID = 1240;

// The Sheets (Shipping Speeds and Locale)
const RATE_TYPES = [
  { shippingSpeed: 'standard', locale: 'domestic' },
  { shippingSpeed: 'expedited', locale: 'domestic' },
  { shippingSpeed: 'nextDay', locale: 'domestic' },
  { shippingSpeed: 'intlEconomy', locale: 'international' },
  { shippingSpeed: 'intlExpedited', locale: 'international' }
];

/**
 * Default Headings
 * Note: mapDomesticItem and mapInternationalItem must be modified if new items
 * are added here.
 */
const HEADINGS = [
  'Start Weight', 'End Weight'
];

// Max Domestic Zone (8 = Zones 1 - 8)
const MAX_DOMESTIC_ZONE = process.env.MAX_DOMESTIC_ZONE || '8';

// Max International Zone (O = Zones A - O)
const MAX_INTERNATIONAL_ZONE = process.env.MAX_INTERNATIONAL_ZONE || 'O';

// Database Configuration
const DB_CONFIG = {
  host: process.env.DATABASE_HOST || '127.0.0.1',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASS || 'secret',
  database: process.env.DATABASE_NAME || 'whitebox'
};

// Location to upload the File
const FILE_NAME = 'uploads/Whitebox-Export.xlsx';

module.exports.CLIENT_ID = CLIENT_ID;
module.exports.RATE_TYPES = RATE_TYPES;
module.exports.HEADINGS = HEADINGS;
module.exports.MAX_DOMESTIC_ZONE = MAX_DOMESTIC_ZONE;
module.exports.MAX_INTERNATIONAL_ZONE = MAX_INTERNATIONAL_ZONE;
module.exports.DB_CONFIG = DB_CONFIG;
module.exports.FILE_NAME = FILE_NAME;
