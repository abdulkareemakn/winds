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
    } catch {}
  }

  return null;
}

const homeLink = document.querySelector("#nf-home");
if (homeLink) {
  findHome().then((home) => {
    if (home) homeLink.href = home;
  });
}

const canvas = document.querySelector("#snow");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const darkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
const flakeColors = darkScheme ? ["#eef5f8", "#8fc0d6"] : ["#9fb9c4", "#4d7f93"];

function driftOf(flake) {
  return Math.sin(flake.age * flake.sway) * flake.swayAmount;
}

function drawSnow(ctx, width, height, flakes) {
  ctx.clearRect(0, 0, width, height);

  const groups = new Map();

  for (const flake of flakes) {
    const alpha = Math.round(flake.opacity * 20) / 20;
    const key = `${flake.color}|${alpha}`;

    let group = groups.get(key);

    if (!group) {
      group = { color: flake.color, alpha, width: 0, flakes: [] };
      groups.set(key, group);
    }

    group.flakes.push(flake);
    group.width = Math.max(group.width, flake.radius * 0.6);
  }

  for (const group of groups.values()) {
    ctx.fillStyle = group.color;
    ctx.strokeStyle = group.color;

    ctx.globalAlpha = group.alpha;
    ctx.beginPath();

    for (const flake of group.flakes) {
      const x = flake.x + driftOf(flake);

      ctx.moveTo(x + flake.radius, flake.y);
      ctx.arc(x, flake.y, flake.radius, 0, Math.PI * 2);
    }

    ctx.fill();

    ctx.globalAlpha = group.alpha * 0.35;
    ctx.lineWidth = group.width;
    ctx.beginPath();

    for (const flake of group.flakes) {
      const x = flake.x + driftOf(flake);

      ctx.moveTo(x, flake.y);
      ctx.lineTo(x - flake.speed * 3, flake.y - flake.speed * 0.4);
    }

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
  let resizeHandle = 0;

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

    if (reduceMotion) {
      drawSnow(ctx, width, height, flakes);
    }
  }

  function scheduleResize() {
    if (resizeHandle) {
      return;
    }

    resizeHandle = window.requestAnimationFrame(() => {
      resizeHandle = 0;
      resize();
    });
  }

  resize();
  window.addEventListener("resize", scheduleResize);

  if (reduceMotion) {
    drawSnow(ctx, width, height, flakes);
  } else {
    function frame(time) {
      const delta = lastTime ? Math.min((time - lastTime) / 16.67, 3) : 1;
      lastTime = time;

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
