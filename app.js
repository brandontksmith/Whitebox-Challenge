const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');

const {
  CLIENT_ID,
  RATE_TYPES,
  HEADINGS,
  MAX_DOMESTIC_ZONE,
  MAX_INTERNATIONAL_ZONE,
  DB_CONFIG,
  FILE_NAME
} = require('./constants');

var connection;

/**
 * Fetches Rates for the given Client ID, Shipping Speed, and Locale.
 *
 * @param {string} clientId The Client ID.
 * @param {string} shippingSpeed The Shipping Speed.
 * @param {string} locale The Locale, Domestic or International.
 * @return {array} An Array of Rates.
 */
const fetchRatesByClientAndType = async (clientId, shippingSpeed, locale) => {
  return await connection.query(
    'SELECT * FROM rates WHERE client_id = ? AND shipping_speed = ? AND locale = ? ' +
    ' ORDER BY start_weight, end_weight, zone', [ clientId, shippingSpeed, locale ]
  );
};

/**
 * Formats the sheet title for the given Shipping Speed and Locale.
 *
 * @param {string} shippingSpeed The Shipping Speed.
 * @param {string} locale The Locale, Domestic or International.
 * @return {string} The Sheet Title.
 */
const formatSheetTitle = (shippingSpeed, locale) => {
  let altLocale = locale.charAt(0).toUpperCase() + locale.slice(1);
  let altShippingSpeed = shippingSpeed.charAt(0).toUpperCase() + shippingSpeed.slice(1);

  // Shipping Speeds that do not conform to the pattern above.
  if (shippingSpeed === 'nextDay') {
    altShippingSpeed = 'Next Day';
  } else if (shippingSpeed === 'intlExpedited') {
    altShippingSpeed = 'Expedited';
  } else if (shippingSpeed === 'intlEconomy') {
    altShippingSpeed = 'Economy';
  }

  return `${ altLocale } ${ altShippingSpeed } Rates`;
};

/**
 * Returns the Zones.
 *
 * @param {string} locale The Locale, Domestic or International.
 * @return {object} The Zones.
 */
const getZones = (locale) => {
  if (locale === 'domestic') {
    return getDomesticZones();
  }

  if (locale === 'international') {
    return getInternationalZones();
  }

  return [];
};

/**
 * Returns the Domestic Zones.
 *
 * @return {object} The Domestic Zones.
 */
const getDomesticZones = () => {
  const zones = {};

  for (let i = 1; i <= MAX_DOMESTIC_ZONE; i++) {
    const heading = `Zone ${ i }`;
    const mapping = `zone${ i }`;

    zones[heading] = mapping;
  }

  return zones;
};

/**
 * Returns the International Zones.
 *
 * @return {object} The International Zones.
 */
const getInternationalZones = () => {
  const zones = {};

  const min = 'A'.charCodeAt(0);
  const max = MAX_INTERNATIONAL_ZONE.charCodeAt(0);

  for (let i = min; i <= max; i++) {
    const letter = String.fromCharCode(i);
    const heading = `Zone ${ letter }`;
    const mapping = `zone${ letter }`;

    zones[heading] = mapping;
  }

  return zones;
};

/**
 * Maps the Rate Item.
 *
 * @param {object} item The Rate Item.
 * @param {string} locale The Locale, Domestic or International.
 * @return {array} An Array of the fully-populated Rates and Zones.
 */
const mapItem = (item, locale, zones) => {
  if (locale === 'domestic') {
    return mapDomesticItem(item, zones);
  }

  if (locale === 'international') {
    return mapInternationalItem(item, zones);
  }

  return [];
};

/**
 * Maps the Domestic Rate Item.
 *
 * @param {object} item The Domestic Rate Item.
 * @param {array} zones The Domestic Zones.
 * @return {array} An Array of the fully-populated Domestic Rates and Zones.
 */
const mapDomesticItem = (item, zones) => {
  const mappedItem = [ item.startWeight, item.endWeight ];

  for (const zone of zones) {
    mappedItem.push(item[zone]);
  }

  return mappedItem;
};

/**
 * Maps the International Rate Item.
 *
 * @param {object} item The International Rate Item.
 * @param {array} zones The International Zones.
 * @return {array} An Array of the fully-populated International Rates and Zones.
 */
const mapInternationalItem = (item, zones) => {
  const mappedItem = [ item.startWeight, item.endWeight ];

  for (const zone of zones) {
    mappedItem.push(item[zone]);
  }

  return mappedItem;
};

/**
 * Creates a new Worksheet on the Workbook with the given Records for the Shipping
 * Speed and Locale.
 *
 * @param {object} workbook The Workbook Object.
 * @param {array} records The Array of Rates.
 * @param {string} shippingSpeed The Shipping Speed.
 * @param {string} locale The Locale, Domestic or International.
 * @return {object} The newly-created Worksheet.
 */
const createSheet = (workbook, records, shippingSpeed, locale) => {
  const sheet = workbook.addWorksheet(formatSheetTitle(shippingSpeed, locale), {
    properties: {
      defaultColWidth: 15
    }
  });

  const dataMap = new Map();
  const data = [];
  const zones = getZones(locale);

  const zoneHeadings = Object.keys(zones);
  const zoneKeys = Object.values(zones);

  for (const record of records) {
    const mapKey = `${ record.start_weight }:${ record.end_weight }`;
    const zoneKey = `zone${ record.zone.toUpperCase() }`;

    const obj = dataMap.has(mapKey) ? dataMap.get(mapKey) : {};

    if (!obj.startWeight) {
      obj.startWeight = record.start_weight;
    }

    if (!obj.endWeight) {
      obj.endWeight = record.end_weight;
    }
    
    obj[zoneKey] = record.rate;
    dataMap.set(mapKey, obj);
  }

  data.push([ ...HEADINGS, ...zoneHeadings ]);

  const iterator = dataMap[Symbol.iterator]();

  for (const [key, value] of iterator) {
    data.push(mapItem(value, locale, zoneKeys));
  }

  sheet.addRows(data);

  return sheet;
};

/**
 * Exports and writes the Rates to an Excel (.xlsx) File.
 *
 * @param {string} fileName The File name.
 */
const exportRatesToExcel = async (fileName) => {
  const workbook = new ExcelJS.Workbook();

  for (const rateType of RATE_TYPES) {
    const { shippingSpeed, locale } = rateType;

    console.log(`Exporting Rates for ${ locale } ${ shippingSpeed }`);

    const [ rows, fields ] = await fetchRatesByClientAndType(CLIENT_ID, shippingSpeed, locale);

    console.log(`Found ${ rows.length } Records for ${ locale } ${ shippingSpeed }`);

    createSheet(workbook, rows, shippingSpeed, locale);
  }

  await workbook.xlsx.writeFile(fileName);
};

(async function() {
  try {
    connection = await mysql.createConnection({ ...DB_CONFIG });

    await exportRatesToExcel(FILE_NAME);

    console.log(`Done. Uploaded to ${ FILE_NAME }`);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}());
