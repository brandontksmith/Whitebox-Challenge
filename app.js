const mysql = require('mysql');
const ExcelJS = require('exceljs');

const {
  CLIENT_ID,
  RATE_TYPES,
  DOMESTIC_HEADINGS,
  INTERNATIONAL_HEADINGS,
  DB_CONFIG,
  EXPORT_PATH,
  FILE_NAME
} = require('./constants');

const connection = mysql.createConnection({ ...DB_CONFIG });

connection.connect();

/**
 * Fetches Rates for the given Client ID, Shipping Speed, and Locale.
 *
 * @param {string} clientId The Client ID.
 * @param {string} shippingSpeed The Shipping Speed.
 * @param {string} locale The Locale, Domestic or International.
 * @return {array} An Array of Rates.
 */
const fetchRatesByClientAndType = async (clientId, shippingSpeed, locale) => {
  return await new Promise((resolve, reject) => {
    connection.query('SELECT * FROM rates WHERE client_id = ? AND shipping_speed = ? AND locale = ? ORDER BY start_weight, end_weight, zone', [ clientId, shippingSpeed, locale ], (error, results, fields) => {
      return error ? reject(error) : resolve(results);
    });
  });
}

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

  if (shippingSpeed === 'nextDay') {
    altShippingSpeed = 'Next Day';
  } else if (shippingSpeed === 'intlExpedited') {
    altShippingSpeed = 'Expedited';
  } else if (shippingSpeed === 'intlEconomy') {
    altShippingSpeed = 'Economy';
  }

  return `${ altLocale } ${ altShippingSpeed } Rates`;
}

/**
 * Maps the Rate Item.
 *
 * @param {object} item The Rate Item.
 * @param {string} locale The Locale, Domestic or International.
 * @return {array} An Array of the fully-populated Rates and Zones.
 */
const mapItem = (item, locale) => {
  if (locale === 'domestic') {
    return mapDomesticItem(item);
  }

  if (locale === 'international') {
    return mapInternationalItem(item);
  }

  return [];
}

/**
 * Maps the Domestic Rate Item.
 *
 * @param {object} item The Domestic Rate Item.
 * @return {array} An Array of the fully-populated Domestic Rates and Zones.
 */
const mapDomesticItem = (item) => {
  return [
    item.startWeight, item.endWeight, item.zone1, item.zone2, item.zone3, item.zone4,
    item.zone5, item.zone6, item.zone7, item.zone8
  ];
}

/**
 * Maps the International Rate Item.
 *
 * @param {object} item The International Rate Item.
 * @return {array} An Array of the fully-populated International Rates and Zones.
 */
const mapInternationalItem = (item) => {
  return [
    item.startWeight, item.endWeight, item.zoneA, item.zoneB, item.zoneC, item.zoneD,
    item.zoneE, item.zoneF, item.zoneG, item.zoneH, item.zoneI, item.zoneJ, item.zoneK,
    item.zoneL, item.zoneM, item.zoneN, item.zoneO
  ];
}

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
  const sheet = workbook.addWorksheet(formatSheetTitle(shippingSpeed, locale), { properties: {
    defaultColWidth: 15
  }});

  const dataMap = new Map();
  const data = [];

  records.forEach(record => {
    const mapKey = `${ record.start_weight }:${ record.end_weight }`;
    const zoneKey = `zone${ record.zone.toUpperCase() }`;

    let obj = {
      startWeight: record.start_weight,
      endWeight: record.end_weight
    };

    if (dataMap.has(mapKey)) {
      obj = dataMap.get(mapKey);
    }

    obj[zoneKey] = record.rate;
    dataMap.set(mapKey, obj);
  });

  const headings = locale === 'domestic' ? DOMESTIC_HEADINGS : INTERNATIONAL_HEADINGS;

  data.push(headings);
  dataMap.forEach((item, key) => {
    if (locale === 'domestic') {
      data.push(mapDomesticItem(item));
    } else if (locale === 'international') {
      data.push(mapInternationalItem(item));
    }
  });

  sheet.addRows(data);

  return sheet;
}

/**
 * Exports Rates to an Excel (.xlsx) File.
 *
 * @param {string} fileName The File name.
 */
const exportRatesToExcel = async (fileName) => {
  const workbook = new ExcelJS.Workbook();

  for (let index in RATE_TYPES) {
    const rateType = RATE_TYPES[index];
    const { shippingSpeed, locale } = rateType;

    console.log(`Exporting Rates for ${ locale } ${ shippingSpeed }`)

    const records = await fetchRatesByClientAndType(CLIENT_ID, shippingSpeed, locale);

    console.log(`Found ${ records.length } Records for ${ locale } ${ shippingSpeed }`)

    const sheet = createSheet(workbook, records, shippingSpeed, locale);
  }

  await workbook.xlsx.writeFile(fileName);
}

exportRatesToExcel(FILE_NAME).then(() => {
  console.log(`Done. Uploaded to ${ FILE_NAME }`);

  connection.destroy();
  process.exit();
});
