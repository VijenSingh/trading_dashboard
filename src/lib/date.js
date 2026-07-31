// Trade dates are stored as plain "YYYY-MM-DD" strings with no time/timezone
// component. `new Date("YYYY-MM-DD")` parses that as UTC midnight (per spec),
// so any later call to local getters (.getMonth(), .getDay()) or
// .toLocaleDateString() can silently shift the date by a day depending on
// the browser's timezone offset. Use this instead — it builds the Date from
// local-time components, which is symmetric with local getters/formatting.
export function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
