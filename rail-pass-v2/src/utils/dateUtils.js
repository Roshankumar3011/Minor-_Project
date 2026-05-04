/**
 * Utility functions for date formatting and parsing
 */

/**
 * Formats a date string or object into "dd-MM-yyyy"
 * @param {string | Date} date - ISO string (YYYY-MM-DD) or Date object
 * @returns {string} - Formatted date string "dd-MM-yyyy"
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  // If it's already in dd-MM-yyyy format, return as is
  if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return date;
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Parses a "dd-MM-yyyy" string into a Date object
 * @param {string} dateStr - Date string in "dd-MM-yyyy" format
 * @returns {Date} - JavaScript Date object
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  // If it's already an ISO string, use standard constructor
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr);
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
  return new Date(dateStr);
};

/**
 * Formats time from an ISO string
 * @param {string} isoStr 
 * @returns {string} - Formatted time "HH:mm"
 */
export const formatTime = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return String(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
