/* 404 — gone with the wind */

/*
 * The 404 page is served at the path the visitor asked for, so relative links
 * would point at the missing path instead of the site. Cloudflare Pages keeps
 * the site root at "/", but probe anyway in case the site is served from a
 * subdirectory.
 */
async function findHome() {
  const candidates = ["/", "../", "./", "../../", "../../../", "../../../../"];
  const marker = "Winds of Winter Countdown";

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { redirect: "follow" });
      if (!response.ok) continue;

      const html = await response.text();
      if (html.includes(marker)) {
        return new URL(candidate, window.location.href).href;
      }
    } catch {
      /* Try the next candidate. */
    }
  }

  return null;
}

const homeLink = document.querySelector("#nf-home");
if (homeLink) {
  findHome().then((home) => {
    if (home) homeLink.href = home;
  });
}

/* Snow on the Wall. */
const canvas = document.querySelector("#snow");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const darkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
const flakeColors = darkScheme ? ["#eef5f8", "#8fc0d6"] : ["#9fb9c4", "#4d7f93"];

function drawSnow(ctx, width, height, flakes) {
  ctx.clearRect(0, 0, width, height);

  for (const flake of flakes) {
    const drift = Math.sin(flake.age * flake.sway) * flake.swayAmount;

    ctx.globalAlpha = flake.opacity;
    ctx.fillStyle = flake.color;
    ctx.beginPath();
    ctx.arc(flake.x + drift, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();

    /* A faint streak behind each flake, as if the wind were pulling it. */
    ctx.globalAlpha = flake.opacity * 0.35;
    ctx.strokeStyle = flake.color;
    ctx.lineWidth = flake.radius * 0.6;
    ctx.beginPath();
    ctx.moveTo(flake.x + drift, flake.y);
    ctx.lineTo(flake.x + drift - flake.speed * 3, flake.y - flake.speed * 0.4);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function makeFlakes(width, height, count) {
  const flakes = [];

  for (let i = 0; i < count; i++) {
    const depth = Math.random();

    flakes.push({
      x: Math.random() * (width + 200) - 100,
      y: Math.random() * height,
      radius: 0.8 + depth * 2.1,
      speed: 0.25 + depth * 0.9,
      opacity: 0.2 + depth * 0.5,
      sway: 0.01 + Math.random() * 0.05,
      swayAmount: 8 + Math.random() * 26,
      age: Math.random() * 100,
      color: depth > 0.72 ? flakeColors[0] : flakeColors[1],
    });
  }

  return flakes;
}

if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;
  let flakes = makeFlakes(width, height, Math.min(160, Math.round((width * height) / 12000)));
  let gust = 0;
  let lastTime = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    flakes = makeFlakes(width, height, Math.min(160, Math.round((width * height) / 12000)));
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    drawSnow(ctx, width, height, flakes);
  } else {
    function frame(time) {
      const delta = lastTime ? Math.min((time - lastTime) / 16.67, 3) : 1;
      lastTime = time;

      /* The wind gusts, then eases off. */
      gust += (Math.random() - 0.48) * 0.5;
      gust = Math.max(-1.6, Math.min(2.6, gust));

      for (const flake of flakes) {
        flake.x -= (flake.speed + gust) * delta;
        flake.y += flake.speed * 0.55 * delta;
        flake.age += delta;

        if (flake.x < -20) {
          flake.x = width + 20;
          flake.y = Math.random() * height;
        }
        if (flake.y > height + 10) {
          flake.y = -10;
          flake.x = Math.random() * (width + 200) - 100;
        }
      }

      drawSnow(ctx, width, height, flakes);
      window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }
}
