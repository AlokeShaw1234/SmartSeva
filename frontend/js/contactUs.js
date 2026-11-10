document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let msg = document.getElementById("successMsg");
  msg.style.display = "block";

  setTimeout(() => {
    msg.style.display = "none";
    e.target.reset();
  }, 3000);
});
