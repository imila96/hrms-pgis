/**
 * Sri Lankan Public Holidays Utility
 * 
 * Includes:
 * - Fixed holidays (e.g., Christmas, Independence Day)
 * - Poya days (calculated based on lunar calendar)
 * - Other government holidays
 */

// Fixed holidays for Sri Lanka (month is 0-indexed: 0=Jan, 11=Dec)
const FIXED_HOLIDAYS = {
  2025: [
    { date: '2025-01-14', name: 'Tamil Thai Pongal Day' },
    { date: '2025-02-04', name: 'Independence Day' },
    { date: '2025-03-14', name: 'Mahasivarathri Day' },
    { date: '2025-04-10', name: 'Eid-Ul-Fitr (Ramazan Festival Day)' },
    { date: '2025-04-11', name: 'Day prior to Sinhala & Tamil New Year Day' },
    { date: '2025-04-12', name: 'Sinhala & Tamil New Year Day' },
    { date: '2025-04-13', name: 'Day following Sinhala & Tamil New Year Day' },
    { date: '2025-04-14', name: 'Good Friday' },
    { date: '2025-05-01', name: 'May Day' },
    { date: '2025-05-12', name: 'Vesak Full Moon Poya Day' },
    { date: '2025-05-13', name: 'Day following Vesak Full Moon Poya Day' },
    { date: '2025-06-16', name: 'Eid-Ul-Alha (Hadji Festival Day)' },
    { date: '2025-12-25', name: 'Christmas Day' },
  ],
  2026: [
    { date: '2026-01-14', name: 'Tamil Thai Pongal Day' },
    { date: '2026-02-04', name: 'Independence Day' },
    { date: '2026-03-03', name: 'Mahasivarathri Day' },
    { date: '2026-03-30', name: 'Eid-Ul-Fitr (Ramazan Festival Day)' },
    { date: '2026-04-13', name: 'Day prior to Sinhala & Tamil New Year Day' },
    { date: '2026-04-14', name: 'Sinhala & Tamil New Year Day' },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-05-01', name: 'May Day' },
    { date: '2026-05-31', name: 'Vesak Full Moon Poya Day' },
    { date: '2026-06-01', name: 'Day following Vesak Full Moon Poya Day' },
    { date: '2026-06-06', name: 'Eid-Ul-Alha (Hadji Festival Day)' },
    { date: '2026-12-25', name: 'Christmas Day' },
  ],
};

// Poya Days for 2025-2026 (Full moon days - Buddhist religious holidays)
const POYA_DAYS = {
  2025: [
    { date: '2025-01-13', name: 'Duruthu Full Moon Poya Day' },
    { date: '2025-02-12', name: 'Navam Full Moon Poya Day' },
    { date: '2025-03-14', name: 'Medin Full Moon Poya Day' },
    { date: '2025-04-12', name: 'Bak Full Moon Poya Day' },
    { date: '2025-05-12', name: 'Vesak Full Moon Poya Day' },
    { date: '2025-06-10', name: 'Poson Full Moon Poya Day' },
    { date: '2025-07-10', name: 'Esala Full Moon Poya Day' },
    { date: '2025-08-08', name: 'Nikini Full Moon Poya Day' },
    { date: '2025-09-07', name: 'Binara Full Moon Poya Day' },
    { date: '2025-10-06', name: 'Vap Full Moon Poya Day' },
    { date: '2025-11-05', name: 'Il Full Moon Poya Day' },
    { date: '2025-12-04', name: 'Unduvap Full Moon Poya Day' },
  ],
  2026: [
    { date: '2026-01-02', name: 'Duruthu Full Moon Poya Day' },
    { date: '2026-02-01', name: 'Navam Full Moon Poya Day' },
    { date: '2026-03-03', name: 'Medin Full Moon Poya Day' },
    { date: '2026-04-01', name: 'Bak Full Moon Poya Day' },
    { date: '2026-05-01', name: 'Vesak Full Moon Poya Day' },
    { date: '2026-05-30', name: 'Poson Full Moon Poya Day' },
    { date: '2026-06-29', name: 'Esala Full Moon Poya Day' },
    { date: '2026-07-28', name: 'Nikini Full Moon Poya Day' },
    { date: '2026-08-27', name: 'Binara Full Moon Poya Day' },
    { date: '2026-09-25', name: 'Vap Full Moon Poya Day' },
    { date: '2026-10-25', name: 'Il Full Moon Poya Day' },
    { date: '2026-11-23', name: 'Unduvap Full Moon Poya Day' },
    { date: '2026-12-23', name: 'Duruthu Full Moon Poya Day' },
  ],
};

/**
 * Get all holidays for a specific year
 * @param {number} year - The year to get holidays for
 * @returns {Array} Array of holiday objects with date and name
 */
export const getHolidaysForYear = (year) => {
  const fixed = FIXED_HOLIDAYS[year] || [];
  const poya = POYA_DAYS[year] || [];
  return [...fixed, ...poya];
};

/**
 * Get all holidays within a date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Array of holiday objects within the range
 */
export const getHolidaysInRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  
  let allHolidays = [];
  
  // Get holidays for all years in the range
  for (let year = startYear; year <= endYear; year++) {
    allHolidays = [...allHolidays, ...getHolidaysForYear(year)];
  }
  
  // Filter holidays within the date range
  return allHolidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= start && holidayDate <= end;
  });
};

/**
 * Check if a specific date is a holiday
 * @param {Date|string} date - Date to check
 * @returns {Object|null} Holiday object if it's a holiday, null otherwise
 */
export const isHoliday = (date) => {
  const checkDate = new Date(date);
  const dateStr = checkDate.toISOString().split('T')[0];
  const year = checkDate.getFullYear();
  
  const allHolidays = getHolidaysForYear(year);
  return allHolidays.find(h => h.date === dateStr) || null;
};

/**
 * Calculate working days excluding holidays (but including weekends since employees work Sat/Sun)
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Object} Object with totalDays, holidays, workingDays, and holidaysList
 */
export const calculateWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate total days (inclusive)
  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Get holidays in the range
  const holidaysInRange = getHolidaysInRange(start, end);
  
  // Working days = total days - holidays (weekends are working days)
  const workingDays = totalDays - holidaysInRange.length;
  
  return {
    totalDays,
    holidays: holidaysInRange.length,
    workingDays: Math.max(0, workingDays),
    holidaysList: holidaysInRange,
  };
};

/**
 * Get holiday map for easy lookup (used by date picker)
 * @param {number} year - Year to get holidays for
 * @returns {Object} Map of date strings to holiday names
 */
export const getHolidayMap = (year) => {
  const holidays = getHolidaysForYear(year);
  const map = {};
  holidays.forEach(h => {
    map[h.date] = h.name;
  });
  return map;
};

/**
 * Get all holidays for multiple years (used for date range spanning years)
 * @param {number} startYear - Start year
 * @param {number} endYear - End year
 * @returns {Array} Array of all holidays
 */
export const getHolidaysForYearRange = (startYear, endYear) => {
  let allHolidays = [];
  for (let year = startYear; year <= endYear; year++) {
    allHolidays = [...allHolidays, ...getHolidaysForYear(year)];
  }
  return allHolidays;
};

const sriLankanHolidaysUtil = {
  getHolidaysForYear,
  getHolidaysInRange,
  isHoliday,
  calculateWorkingDays,
  getHolidayMap,
  getHolidaysForYearRange,
};

export default sriLankanHolidaysUtil;
