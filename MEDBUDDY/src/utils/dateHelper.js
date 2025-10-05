const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const relativeTime = require('dayjs/plugin/relativeTime');
require('dayjs/locale/vi');

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

// Set default timezone to Vietnam
dayjs.locale('vi');
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

/**
 * Get current date in Vietnam timezone
 * @returns {dayjs.Dayjs} Current date in Vietnam timezone
 */
const now = () => {
  return dayjs().tz('Asia/Ho_Chi_Minh');
};

/**
 * Format date to Vietnam timezone
 * @param {Date|string|dayjs.Dayjs} date - Date to format
 * @param {string} format - Format string (default: 'DD/MM/YYYY HH:mm:ss')
 * @returns {string} Formatted date string
 */
const formatVN = (date, format = 'DD/MM/YYYY HH:mm:ss') => {
  return dayjs(date).tz('Asia/Ho_Chi_Minh').format(format);
};

/**
 * Format date to Vietnam timezone with relative time
 * @param {Date|string|dayjs.Dayjs} date - Date to format
 * @returns {string} Formatted date with relative time
 */
const formatRelativeVN = (date) => {
  return dayjs(date).tz('Asia/Ho_Chi_Minh').fromNow();
};

/**
 * Add days to date in Vietnam timezone
 * @param {Date|string|dayjs.Dayjs} date - Base date
 * @param {number} days - Number of days to add
 * @returns {dayjs.Dayjs} New date
 */
const addDays = (date, days) => {
  return dayjs(date).tz('Asia/Ho_Chi_Minh').add(days, 'day');
};

/**
 * Add months to date in Vietnam timezone
 * @param {Date|string|dayjs.Dayjs} date - Base date
 * @param {number} months - Number of months to add
 * @returns {dayjs.Dayjs} New date
 */
const addMonths = (date, months) => {
  return dayjs(date).tz('Asia/Ho_Chi_Minh').add(months, 'month');
};

/**
 * Add years to date in Vietnam timezone
 * @param {Date|string|dayjs.Dayjs} date - Base date
 * @param {number} years - Number of years to add
 * @returns {dayjs.Dayjs} New date
 */
const addYears = (date, years) => {
  return dayjs(date).tz('Asia/Ho_Chi_Minh').add(years, 'year');
};

/**
 * Check if date is before another date
 * @param {Date|string|dayjs.Dayjs} date1 - First date
 * @param {Date|string|dayjs.Dayjs} date2 - Second date
 * @returns {boolean} True if date1 is before date2
 */
const isBefore = (date1, date2) => {
  return dayjs(date1).tz('Asia/Ho_Chi_Minh').isBefore(dayjs(date2).tz('Asia/Ho_Chi_Minh'));
};

/**
 * Check if date is after another date
 * @param {Date|string|dayjs.Dayjs} date1 - First date
 * @param {Date|string|dayjs.Dayjs} date2 - Second date
 * @returns {boolean} True if date1 is after date2
 */
const isAfter = (date1, date2) => {
  return dayjs(date1).tz('Asia/Ho_Chi_Minh').isAfter(dayjs(date2).tz('Asia/Ho_Chi_Minh'));
};

/**
 * Get start of day in Vietnam timezone
 * @param {Date|string|dayjs.Dayjs} date - Date
 * @returns {dayjs.Dayjs} Start of day
 */
const startOfDay = (date) => {
  return dayjs(date).tz('Asia/Ho_Chi_Minh').startOf('day');
};

/**
 * Get end of day in Vietnam timezone
 * @param {Date|string|dayjs.Dayjs} date - Date
 * @returns {dayjs.Dayjs} End of day
 */
const endOfDay = (date) => {
  return dayjs(date).tz('Asia/Ho_Chi_Minh').endOf('day');
};

/**
 * Convert date to Vietnam timezone
 * @param {Date|string|dayjs.Dayjs} date - Date to convert
 * @returns {dayjs.Dayjs} Date in Vietnam timezone
 */
const toVN = (date) => {
  return dayjs(date).tz('Asia/Ho_Chi_Minh');
};

/**
 * Get package expiry date
 * @param {number} duration - Duration in months
 * @returns {dayjs.Dayjs} Expiry date
 */
const getPackageExpiryDate = (duration = 1) => {
  return now().add(duration, 'month');
};

/**
 * Format package expiry date for display
 * @param {Date|string|dayjs.Dayjs} date - Expiry date
 * @returns {string} Formatted expiry date
 */
const formatPackageExpiry = (date) => {
  return formatVN(date, 'DD/MM/YYYY [lúc] HH:mm');
};

module.exports = {
  dayjs,
  now,
  formatVN,
  formatRelativeVN,
  addDays,
  addMonths,
  addYears,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  toVN,
  getPackageExpiryDate,
  formatPackageExpiry
};
