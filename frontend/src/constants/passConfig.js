// Curfew / Pass End Time Configuration
export const PASS_CURFEW_CONFIG = {
  hour: Number(import.meta.env.VITE_PASS_CURFEW_HOUR) || 20,       // 20 = 8 PM
  minute: Number(import.meta.env.VITE_PASS_CURFEW_MINUTE) || 30,   // 30 mins -> 8:30 PM
  timeZone: 'Asia/Kolkata',
  display: import.meta.env.VITE_PASS_CURFEW_DISPLAY || '8:30 PM IST'
};

/**
 * Returns an ISO timestamp string anchored to the curfew time on the given date (in IST).
 * @param {string|Date} dateInput - YYYY-MM-DD string or Date object
 * @returns {string} - ISO string representation in UTC for the 8:30 PM IST timestamp
 */
export const getPassCurfewIsoString = (dateInput) => {
  let dateStr = '';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    dateStr = dateInput;
  } else {
    const d = dateInput ? new Date(dateInput) : new Date();
    dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: PASS_CURFEW_CONFIG.timeZone }).format(d);
  }
  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${pad(PASS_CURFEW_CONFIG.hour)}:${pad(PASS_CURFEW_CONFIG.minute)}:00+05:30`;
  const curfewDate = new Date(`${dateStr}T${timeStr}`);
  return curfewDate.toISOString();
};

/**
 * Checks if current time is already past today's curfew.
 * @returns {boolean}
 */
export const isPastTodayCurfew = () => {
  const now = new Date();
  const todayCurfew = new Date(getPassCurfewIsoString(now));
  return now.getTime() > todayCurfew.getTime();
};
