const days = document.querySelector("#days");
const hours = document.querySelector("#hours");
const minutes = document.querySelector("#minutes");
const seconds = document.querySelector("#seconds");

const days_counter = document.querySelector("#days_counter");
const hours_counter = document.querySelector("#hours_counter");
const minutes_counter = document.querySelector("#minutes_counter");
const seconds_counter = document.querySelector("#seconds_counter");
const elapsedTime = document.querySelector("#elapsed-time");

function windsCounter() {
  // Local midnight, so the countdown and the breakdown agree with the
  // calendar date the book was published on.
  const dance = new Date(2011, 6, 12);

  const now = new Date();

  let winds_ms = now - dance;

  let winds_days = winds_ms / 86400000;
  winds_ms %= 86400000;

  let winds_hours = winds_ms / 3600000;
  winds_ms %= 3600000;

  let winds_minutes = winds_ms / 60000;
  winds_ms %= 60000;

  let winds_seconds = winds_ms / 1000;

  winds_days = Math.floor(winds_days);
  winds_hours = Math.floor(winds_hours);
  winds_minutes = Math.floor(winds_minutes);
  winds_seconds = Math.floor(winds_seconds);

  days.textContent = `${winds_days}`;
  hours.textContent = `${winds_hours}`;
  minutes.textContent = `${winds_minutes}`;
  seconds.textContent = `${winds_seconds}`;

  days_counter.textContent = winds_days === 1 ? "day" : "days";
  hours_counter.textContent = winds_hours === 1 ? "hour" : "hours";
  minutes_counter.textContent = winds_minutes === 1 ? "minute" : "minutes";
  seconds_counter.textContent = winds_seconds === 1 ? "second" : "seconds";

  const elapsed = elapsedSince(dance, now);

  const parts = [
    [elapsed.years, "year"],
    [elapsed.months, "month"],
    [elapsed.days, "day"],
    [elapsed.hours, "hour"],
    [elapsed.minutes, "minute"],
    [elapsed.seconds, "second"],
  ].map(([value, unit]) => `${value} ${unit}${value === 1 ? "" : "s"}`);

  const last = parts.pop();
  const list = parts.length ? `${parts.join(", ")}, and ${last}` : last;

  elapsedTime.textContent = `That's ${list}.`;
}

// Walks down the calendar hierarchy year -> month -> day -> hour -> minute
// -> second, so each unit carries the remainder of the one above it.
function elapsedSince(start, end) {
  if (end < start) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  let years = end.getFullYear() - start.getFullYear();
  const anniversary = new Date(start);
  anniversary.setFullYear(start.getFullYear() + years);
  if (end < anniversary) years--;

  const yearMark = new Date(start);
  yearMark.setFullYear(start.getFullYear() + years);

  let months = (end.getFullYear() - yearMark.getFullYear()) * 12 + (end.getMonth() - yearMark.getMonth());
  if (months < 0) months = 0;

  // A month only counts once it has fully passed, so step back when the
  // anniversary day has not been reached yet this month.
  let monthMark = addMonths(yearMark, months);
  if (end < monthMark && months > 0) {
    months -= 1;
    monthMark = addMonths(yearMark, months);
  }

  // Compare wall-clock components in UTC so daylight saving shifts never
  // eat an hour from the breakdown.
  const from = Date.UTC(
    monthMark.getFullYear(),
    monthMark.getMonth(),
    monthMark.getDate(),
    monthMark.getHours(),
    monthMark.getMinutes(),
    monthMark.getSeconds(),
  );
  const to = Date.UTC(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
    end.getHours(),
    end.getMinutes(),
    end.getSeconds(),
  );

  const rest = Math.max(0, to - from);

  const days = Math.floor(rest / 86400000);
  const hours = Math.floor(rest / 3600000) % 24;
  const minutes = Math.floor(rest / 60000) % 60;
  const seconds = Math.floor(rest / 1000) % 60;

  return { years, months, days, hours, minutes, seconds };
}

// Adds months without letting a short month roll the day over.
function addMonths(date, months) {
  const result = new Date(date);
  const day = date.getDate();
  result.setDate(1);
  result.setMonth(date.getMonth() + months);
  const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, daysInMonth));
  return result;
}

windsCounter();
setInterval(windsCounter, 1000);
