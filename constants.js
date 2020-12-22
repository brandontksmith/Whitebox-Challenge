const CLIENT_ID = 1240;

const RATE_TYPES = [
  { shippingSpeed: 'standard', locale: 'domestic' },
  { shippingSpeed: 'expedited', locale: 'domestic' },
  { shippingSpeed: 'nextDay', locale: 'domestic' },
  { shippingSpeed: 'intlEconomy', locale: 'international' },
  { shippingSpeed: 'intlExpedited', locale: 'international' }
];

const DOMESTIC_HEADINGS = [
  'Start Weight', 'End Weight',	'Zone 1', 'Zone 2',	'Zone 3',	'Zone 4', 'Zone 5',
  'Zone 6', 'Zone 7', 'Zone 8'
];

const INTERNATIONAL_HEADINGS = [
  'Start Weight', 'End Weight', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E',
  'Zone F', 'Zone G', 'Zone H', 'Zone I', 'Zone J', 'Zone K', 'Zone L', 'Zone M',
  'Zone N', 'Zone O'
];

const DB_CONFIG = {
  host: process.env.DATABASE_HOST || '127.0.0.1',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASS || 'secret',
  database: process.env.DATABASE_NAME || 'whitebox'
}

const FILE_NAME = 'uploads/Whitebox-Export.xlsx';

module.exports.CLIENT_ID = CLIENT_ID;
module.exports.RATE_TYPES = RATE_TYPES;
module.exports.DOMESTIC_HEADINGS = DOMESTIC_HEADINGS;
module.exports.INTERNATIONAL_HEADINGS = INTERNATIONAL_HEADINGS;
module.exports.DB_CONFIG = DB_CONFIG;
module.exports.FILE_NAME = FILE_NAME;
