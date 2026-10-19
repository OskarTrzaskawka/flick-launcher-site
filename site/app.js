const menu = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
menu.addEventListener("click", () => {
  const expanded = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!expanded));
  menu.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
  navigation.classList.toggle("open", !expanded);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navigation.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    navigation.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }
});
const shots = {
  wardrobe:{image:"assets/launcher-wardrobe.png",caption:"Wardrobe — Flick Launcher 0.5.0",description:"Your skin in 3D, a library on your PC and cape options for the selected account."},
  servers:{image:"assets/launcher-servers.png",caption:"Servers — Flick Launcher 0.5.0",description:"Browse directories, save favourites and add servers directly to a Minecraft profile."},
  play: {
    image: "assets/launcher-home.png",
    caption: "Play — Flick Launcher development build",
    description: "Your selected profile, version and next adventure, one click away.",
  },
  library: {
    image: "assets/launcher-library.png",
    caption: "Your library — Flick Launcher development build",
    description:
      "Separate profiles, independent worlds, and the add-ons inside your selected adventure.",
  },
  discover: {
    image: "assets/launcher-discover.png",
    caption: "Discover — Flick Launcher development build",
    description:
      "Actual Modrinth results, filtered for your profile, with installation from the launcher.",
  },
};
const tabs = [...document.querySelectorAll("[data-shot]")];
function selectShot(tab) {
  const shot = shots[tab.dataset.shot];
  for (const t of tabs) {
    t.setAttribute("aria-selected", String(t === tab));
    t.tabIndex = t === tab ? 0 : -1;
  }
  document.querySelector("#gallery-image").src = shot.image;
  document.querySelector("#gallery-image").alt = shot.caption;
  document.querySelector("#gallery-description").textContent = shot.description;
  const enlarge = document.querySelector("#gallery-enlarge");
  enlarge.dataset.image = shot.image;
  enlarge.dataset.caption = shot.caption;
  document.querySelector("#screenshot-panel").setAttribute("aria-labelledby", tab.id);
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectShot(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") next = tabs[(index + tabs.length - 1) % tabs.length];
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs.at(-1);
    if (next) {
      event.preventDefault();
      selectShot(next);
      next.focus();
    }
  });
});
const lightbox = document.querySelector("#lightbox");
document.querySelectorAll("[data-image]").forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelector("#lightbox-image").src = button.dataset.image;
    document.querySelector("#lightbox-image").alt = button.dataset.caption;
    document.querySelector("#lightbox-caption").textContent = button.dataset.caption;
    lightbox.showModal();
  }),
);
document.querySelector("#close-lightbox").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    const r = lightbox.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      lightbox.close();
  }
});
fetch("config.json")
  .then((r) => {
    if (!r.ok) throw Error("Project configuration unavailable");
    return r.json();
  })
  .then((config) => {
    for (const [selector, url] of [
      ["[data-project-link]", config.repository],
      ["[data-contact-link]", config.issues],
    ]) {
      if (typeof url === "string" && /^https:\/\/github\.com\/[^/]+\/[^/]+/.test(url)) {
        const a = document.querySelector(selector);
        a.href = url;
        a.innerHTML = selector.includes("contact")
          ? "Questions & feedback <span>↗</span>"
          : "View project on GitHub <span>↗</span>";
        a.rel = "noopener noreferrer";
      }
    }
  })
  .catch(() => {});
const canvas = document.querySelector("#ambient"),
  ctx = canvas.getContext("2d"),
  motionButton = document.querySelector("#motion-toggle"),
  reduced = matchMedia("(prefers-reduced-motion:reduce)");
let paused = false,
  frame = 0,
  last = 0,
  width = 0,
  height = 0;
try {
  paused = localStorage.getItem("flick-site-motion") === "paused";
} catch {}
function paint(time) {
  ctx.clearRect(0, 0, width, height);
  for (let x = 0; x < width; x += 35)
    for (let y = 0; y < height; y += 35) {
      const wave = Math.sin((x - y) * 0.005 + time * 0.00045),
        crest = ((wave + 1) / 2) ** 14;
      ctx.fillStyle = `rgba(255,130,149,${(0.012 + crest * 0.13) * (x / width)})`;
      ctx.beginPath();
      ctx.arc(x, y + wave * 3, 0.6 + crest * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
}
function animate(time) {
  frame = requestAnimationFrame(animate);
  if (time - last < 60) return;
  last = time;
  paint(time);
}
function syncMotion() {
  cancelAnimationFrame(frame);
  const enabled = !paused && !reduced.matches;
  document.documentElement.classList.toggle("motion-paused", !enabled);
  motionButton.textContent = reduced.matches
    ? "Reduced motion enabled"
    : paused
      ? "Resume animation"
      : "Pause animation";
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.disabled = reduced.matches;
  paint(0);
  if (enabled && !document.hidden) frame = requestAnimationFrame(animate);
}
function resize() {
  const r = Math.min(devicePixelRatio || 1, 1.5);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = width * r;
  canvas.height = height * r;
  ctx.setTransform(r, 0, 0, r, 0, 0);
  syncMotion();
}
motionButton.addEventListener("click", () => {
  paused = !paused;
  try {
    localStorage.setItem("flick-site-motion", paused ? "paused" : "enabled");
  } catch {}
  syncMotion();
});
reduced.addEventListener("change", syncMotion);
document.addEventListener("visibilitychange", syncMotion);
window.addEventListener("resize", resize);
resize();
