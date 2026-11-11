const days = document.querySelector("#days");
const hours = document.querySelector("#hours");
const minutes = document.querySelector("#minutes");
const seconds = document.querySelector("#seconds");

const days_counter = document.querySelector("#days_counter");
const hours_counter = document.querySelector("#hours_counter");
const minutes_counter = document.querySelector("#minutes_counter");
const seconds_counter = document.querySelector("#seconds_counter");
const elapsedTime = document.querySelector("#elapsed-time");

const proseUnits = [
  ["years", "year"],
  ["months", "month"],
  ["days", "day"],
  ["hours", "hour"],
  ["minutes", "minute"],
  ["seconds", "second"],
];

const proseNumbers = [];
const proseLabels = [];

function buildProse() {
  elapsedTime.replaceChildren(document.createTextNode("That's "));

  proseUnits.forEach(([, unit], index) => {
    if (index > 0) {
      elapsedTime.append(
        document.createTextNode(index === proseUnits.length - 1 ? ", and " : ", "),
      );
    }

    const number = document.createElement("span");
    elapsedTime.append(number);
    proseNumbers.push(number);

    elapsedTime.append(document.createTextNode(" "));

    const label = document.createElement("span");
    elapsedTime.append(label);
    proseLabels.push(label);
  });

  elapsedTime.append(document.createTextNode("."));
}

function windsCounter() {
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

  renderNumber(days, winds_days, 4);
  renderNumber(hours, winds_hours, 2);
  renderNumber(minutes, winds_minutes, 2);
  renderNumber(seconds, winds_seconds, 2);

  renderUnit(days_counter, "day", winds_days === 1);
  renderUnit(hours_counter, "hour", winds_hours === 1);
  renderUnit(minutes_counter, "minute", winds_minutes === 1);
  renderUnit(seconds_counter, "second", winds_seconds === 1);

  const elapsed = elapsedSince(dance, now);

  proseUnits.forEach(([field, unit], index) => {
    const value = elapsed[field];

    renderNumber(proseNumbers[index], value, 2);

    renderUnit(proseLabels[index], unit, value === 1);
  });
}

function renderNumber(element, value, width) {
  const text = String(value).padStart(width, "0");

  if (element.dataset.value === text) {
    return;
  }

  element.dataset.value = text;

  const spoken = document.createElement("span");
  spoken.className = "sr-only";
  spoken.textContent = String(value);

  const grid = document.createElement("span");
  grid.className = "digit-grid";
  grid.setAttribute("aria-hidden", "true");

  for (const digit of text) {
    const cell = document.createElement("span");
    cell.className = "digit";
    cell.textContent = digit;
    grid.appendChild(cell);
  }

  element.replaceChildren(spoken, grid);
}

function renderUnit(element, unit, singular) {
  const word = singular ? unit : `${unit}s`;

  if (element.dataset.unit === word) {
    return;
  }

  element.dataset.unit = word;

  const suffix = document.createElement("span");

  suffix.className = singular ? "unit-s--hidden" : "unit-s";
  suffix.textContent = "s";

  element.replaceChildren(document.createTextNode(unit), suffix);
}

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

  let monthMark = addMonths(yearMark, months);
  if (end < monthMark && months > 0) {
    months -= 1;
    monthMark = addMonths(yearMark, months);
  }

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

function addMonths(date, months) {
  const result = new Date(date);
  const day = date.getDate();
  result.setDate(1);
  result.setMonth(date.getMonth() + months);
  const daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, daysInMonth));
  return result;
}

function tick() {
  const delay = 1000 - (Date.now() % 1000);

  window.setTimeout(() => {
    if (!document.hidden) {
      windsCounter();
    }

    tick();
  }, delay);
}

buildProse();
windsCounter();
tick();
