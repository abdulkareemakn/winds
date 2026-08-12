const days = document.querySelector("#days");
const hours = document.querySelector("#hours");
const minutes = document.querySelector("#minutes");
const seconds = document.querySelector("#seconds");

const days_counter = document.querySelector("#days_counter");
const hours_counter = document.querySelector("#hours_counter");
const minutes_counter = document.querySelector("#minutes_counter");
const seconds_counter = document.querySelector("#seconds_counter");

function windsCounter() {
  const dance = new Date("2011-07-12");

  const now = new Date();

  let winds_ms = now - dance;

  let winds_days = winds_ms / 86400000;
  winds_ms %= 86400000;

  let winds_hours = winds_ms / 3600000;
  winds_ms %= 3600000;

  let winds_minutes = winds_ms / 60000;
  winds_ms %= 60000;

  let winds_seconds = winds_ms / 1000;
  winds_ms %= 1000;

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

  //   counter.textContent = `It has been ${winds_days} days, ${winds_hours} hours, ${winds_minutes} minutes and ${winds_seconds} seconds since A Dance with Dragons released. `;
}

setInterval(windsCounter, 1000);
