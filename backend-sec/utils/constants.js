// Curfew / Pass End Time Configuration
const PASS_CURFEW_CONFIG = {
    hour: parseInt(process.env.PASS_CURFEW_HOUR, 10) || 20,       // 20 -> 8 PM
    minute: parseInt(process.env.PASS_CURFEW_MINUTE, 10) || 30,   // 30 -> 30 mins (8:30 PM)
    timeZone: 'Asia/Kolkata',
    display: process.env.PASS_CURFEW_DISPLAY || '8:30 PM IST'
};

/**
 * Returns a Date object representing the curfew time on the given date in IST.
 * @param {string|Date} dateInput - YYYY-MM-DD string or Date object
 * @returns {Date}
 */
const getPassCurfewDate = (dateInput) => {
    let dateStr = '';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        dateStr = dateInput;
    } else {
        const d = dateInput ? new Date(dateInput) : new Date();
        dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: PASS_CURFEW_CONFIG.timeZone }).format(d);
    }
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${pad(PASS_CURFEW_CONFIG.hour)}:${pad(PASS_CURFEW_CONFIG.minute)}:00+05:30`;
    return new Date(`${dateStr}T${timeStr}`);
};

/**
 * Formats a Date into YYYY-MM-DD in the configured timezone.
 * @param {Date} date 
 * @returns {string}
 */
const getISTDateStr = (date) => {
    const d = date ? new Date(date) : new Date();
    return new Intl.DateTimeFormat('en-CA', { timeZone: PASS_CURFEW_CONFIG.timeZone }).format(d);
};

module.exports = {
    PASS_CURFEW_CONFIG,
    getPassCurfewDate,
    getISTDateStr
};
