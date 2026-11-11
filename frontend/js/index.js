//                            Mobile menu toggle

const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");
if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
  });
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
    });
  });
}

//                            Features fade-in

const features = document.querySelectorAll("#features li");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.2 },
);
features.forEach((f) => observer.observe(f));

//                            Solutions timeline reveal

const items = document.querySelectorAll(".timeline-item");
const observer2 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  },
  { threshold: 0.3 },
);
items.forEach((item) => observer2.observe(item));

//                 About Us horizontal slider controls 

const slider = document.getElementById("slider");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

//             in case the element with id 'slider' is absent in the DOM 

const horizSlider =
  document.getElementById("slider") ||
  document.getElementById("sliderHorizontal");

function getScrollDistance() {
  const card = horizSlider ? horizSlider.querySelector(".card") : null;
  return card ? card.offsetWidth + 25 : 320;
}
if (prevBtn && horizSlider) {
  prevBtn.addEventListener("click", () => {
    horizSlider.scrollBy({ left: -getScrollDistance(), behavior: "smooth" });
  });
}
if (nextBtn && horizSlider) {
  nextBtn.addEventListener("click", () => {
    horizSlider.scrollBy({ left: getScrollDistance(), behavior: "smooth" });
  });
}

//                        FETCH AND UPDATE STATISTICS

// We use JavaScript array methods like `.filter()` to easily 
// count the number of complaints in a specific state without needing to write 
// complex SQL queries or loops.

async function updateStats() {
  try {
    const res = await fetch("https://smartseva-5dia.onrender.com/api/complaints");
    if (!res.ok) return;
    const complaints = await res.json();
    
    let total = complaints.length;
    let solved = complaints.filter(c => c.status === "Resolved").length;
    let pending = total - solved;

    const totalEl = document.getElementById("totalReceived");
    const solvedEl = document.getElementById("totalSolved");
    const pendingEl = document.getElementById("totalPending");

    if (totalEl) totalEl.innerText = total;
    if (solvedEl) solvedEl.innerText = solved;
    if (pendingEl) pendingEl.innerText = pending;
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
}

document.addEventListener("DOMContentLoaded", updateStats);
